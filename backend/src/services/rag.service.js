/**
 * RAG Service
 * Main Retrieval-Augmented Generation pipeline
 */

const fs = require('fs');
const path = require('path');
const { chunkAllArticles } = require('./chunking.service');
const { generateEmbedding, generateEmbeddings, getEmbeddingDimension } = require('./embedding.service');
const { vectorStore } = require('./vectorStore.service');
const config = require('../config');

// Path to knowledge base
const KNOWLEDGE_BASE_PATH = path.join(__dirname, '../../../rag/knowledge_base/articles.json');

/**
 * Load articles from knowledge base
 * @returns {Object[]} - Array of articles
 */
const loadKnowledgeBase = () => {
  try {
    const data = fs.readFileSync(KNOWLEDGE_BASE_PATH, 'utf-8');
    const kb = JSON.parse(data);
    console.log(`📚 Loaded ${kb.articles.length} articles from knowledge base`);
    return kb.articles;
  } catch (error) {
    console.error('Error loading knowledge base:', error.message);
    throw new Error('Failed to load knowledge base');
  }
};

/**
 * Initialize the RAG pipeline
 * Creates chunks and embeddings for all articles
 */
const initializeRAG = async () => {
  console.log('🚀 Initializing RAG pipeline...');
  
  // Check if index already exists
  if (vectorStore.load()) {
    console.log('✅ Using existing vector index');
    return vectorStore.getStats();
  }
  
  // Load knowledge base
  const articles = loadKnowledgeBase();
  
  // Chunk articles
  const chunks = chunkAllArticles(articles, {
    chunkSize: 500,
    chunkOverlap: 50
  });
  
  // Get embedding dimension
  const dimension = await getEmbeddingDimension();
  vectorStore.initialize(dimension);
  
  // Generate embeddings for all chunks
  console.log('🔄 Generating embeddings for chunks...');
  const texts = chunks.map(chunk => 
    `${chunk.title}\n${chunk.content}`
  );
  
  const embeddings = await generateEmbeddings(texts);
  
  // Add to vector store
  const vectorItems = chunks.map((chunk, index) => ({
    id: chunk.chunkId,
    embedding: embeddings[index],
    metadata: {
      chunkId: chunk.chunkId,
      articleId: chunk.articleId,
      title: chunk.title,
      content: chunk.content,
      category: chunk.category,
      tags: chunk.tags,
      source: chunk.source,
      difficulty: chunk.difficulty,
      safetyNotes: chunk.safetyNotes
    }
  }));
  
  vectorStore.addVectors(vectorItems);
  
  // Save index
  vectorStore.save();
  
  console.log('✅ RAG pipeline initialized successfully');
  return vectorStore.getStats();
};

/**
 * Retrieve relevant chunks for a query
 * @param {string} query - User query
 * @param {number} topK - Number of chunks to retrieve
 * @returns {Object[]} - Retrieved chunks with scores
 */
const retrieveChunks = async (query, topK = 5) => {
  // Ensure vector store is loaded
  if (vectorStore.vectors.length === 0) {
    if (!vectorStore.load()) {
      throw new Error('Vector index not found. Please initialize the RAG pipeline first.');
    }
  }
  
  // Generate query embedding
  const queryEmbedding = await generateEmbedding(query);
  
  // Search vector store
  const results = vectorStore.search(
    queryEmbedding, 
    topK, 
    config.RAG.SIMILARITY_THRESHOLD
  );
  
  // Format results
  return results.map(r => ({
    chunkId: r.metadata.chunkId,
    title: r.metadata.title,
    content: r.metadata.content,
    source: r.metadata.source,
    category: r.metadata.category,
    difficulty: r.metadata.difficulty,
    safetyNotes: r.metadata.safetyNotes,
    similarityScore: Math.round(r.score * 100) / 100
  }));
};

/**
 * Retrieve context with formatted sources for user display
 * @param {string} query - User query
 * @param {number} topK - Number of chunks to retrieve
 * @returns {Object} - Object containing chunks, context string, and formatted sources array
 */
const retrieveContext = async (query, topK = 5) => {
  // Retrieve chunks
  const chunks = await retrieveChunks(query, topK);
  
  // Build context string for LLM
  const context = buildContext(chunks);
  
  // Format sources for user display
  const sources = chunks.map((chunk, index) => ({
    id: index + 1,
    title: chunk.title,
    chunkId: chunk.chunkId,
    category: chunk.category,
    source: chunk.source,
    relevance: Math.round(chunk.similarityScore * 100)
  }));
  
  return {
    chunks,
    context,
    sources
  };
};

/**
 * Build context string from retrieved chunks
 * @param {Object[]} chunks - Retrieved chunks
 * @returns {string} - Formatted context
 */
const buildContext = (chunks) => {
  if (!chunks || chunks.length === 0) {
    return '';
  }
  
  return chunks.map((chunk, index) => 
    `[Source ${index + 1}: ${chunk.title}]\n${chunk.content}`
  ).join('\n\n---\n\n');
};

/**
 * Build prompt with retrieved context
 * @param {string} query - User query
 * @param {Object[]} chunks - Retrieved chunks
 * @param {boolean} isUnsafe - Whether query was flagged as unsafe
 * @returns {string} - Complete prompt
 */
const buildRAGPrompt = (query, chunks, isUnsafe = false) => {
  const context = buildContext(chunks);
  
  let systemPrompt = `You are a knowledgeable yoga instructor and wellness expert. 
Use the provided context to answer questions accurately about yoga poses, breathing techniques, 
meditation practices, and general wellness. 

Guidelines:
1. Base your answers primarily on the provided context
2. If the context doesn't contain relevant information, you may draw on general yoga knowledge
3. Always prioritize user safety
4. Recommend consulting healthcare professionals for medical concerns
5. Be clear about difficulty levels and contraindications
6. Keep responses helpful and encouraging`;

  if (isUnsafe) {
    systemPrompt += `

IMPORTANT: This query has been flagged for safety concerns. 
Include appropriate warnings and suggest consulting a healthcare provider or certified yoga therapist.
Do not provide medical advice or specific instructions for medical conditions.`;
  }

  const userPrompt = context 
    ? `Context from yoga knowledge base:

${context}

---

User Question: ${query}

Please provide a helpful, accurate, and safe response based on the context above.`
    : `User Question: ${query}

Please provide a helpful, accurate, and safe response based on your yoga knowledge.`;

  return { systemPrompt, userPrompt };
};

/**
 * Get RAG pipeline status
 * @returns {Object} - Status information
 */
const getRAGStatus = () => {
  return {
    initialized: vectorStore.vectors.length > 0 || vectorStore.indexExists(),
    ...vectorStore.getStats()
  };
};

module.exports = {
  initializeRAG,
  retrieveChunks,
  retrieveContext,
  buildContext,
  buildRAGPrompt,
  getRAGStatus,
  loadKnowledgeBase
};
