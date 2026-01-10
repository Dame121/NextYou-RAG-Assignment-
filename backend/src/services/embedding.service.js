/**
 * Embedding Service
 * Handles vector embedding generation using Ollama
 */

const { Ollama } = require('ollama');
const config = require('../config');

// Initialize Ollama client
const ollama = new Ollama({ host: config.OLLAMA.HOST });

// Embedding model to use (nomic-embed-text is a good choice for RAG)
const EMBEDDING_MODEL = process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text';

/**
 * Generate embedding for a single text
 * @param {string} text - Text to embed
 * @returns {number[]} - Embedding vector
 */
const generateEmbedding = async (text) => {
  try {
    const response = await ollama.embed({
      model: EMBEDDING_MODEL,
      input: text
    });
    
    return response.embeddings[0];
  } catch (error) {
    console.error('Error generating embedding:', error.message);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
};

/**
 * Generate embeddings for multiple texts in batch
 * @param {string[]} texts - Array of texts to embed
 * @param {Function} onProgress - Optional progress callback
 * @returns {number[][]} - Array of embedding vectors
 */
const generateEmbeddings = async (texts, onProgress = null) => {
  const embeddings = [];
  
  for (let i = 0; i < texts.length; i++) {
    const embedding = await generateEmbedding(texts[i]);
    embeddings.push(embedding);
    
    if (onProgress) {
      onProgress(i + 1, texts.length);
    }
    
    // Log progress every 10 items
    if ((i + 1) % 10 === 0) {
      console.log(`🔄 Generated embeddings: ${i + 1}/${texts.length}`);
    }
  }
  
  console.log(`✅ Generated ${embeddings.length} embeddings`);
  return embeddings;
};

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} vecA - First vector
 * @param {number[]} vecB - Second vector
 * @returns {number} - Similarity score (0-1)
 */
const cosineSimilarity = (vecA, vecB) => {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Get embedding dimension from model
 * @returns {number} - Embedding dimension
 */
const getEmbeddingDimension = async () => {
  const testEmbedding = await generateEmbedding('test');
  return testEmbedding.length;
};

module.exports = {
  generateEmbedding,
  generateEmbeddings,
  cosineSimilarity,
  getEmbeddingDimension,
  EMBEDDING_MODEL
};
