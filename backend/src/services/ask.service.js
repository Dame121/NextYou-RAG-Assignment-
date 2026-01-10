/**
 * Ask Service
 * Handles yoga query processing with RAG pipeline integration
 */

const { Ollama } = require('ollama');
const { QueryLog } = require('../models');
const { processSafetyFilter } = require('./safety.service');
const { retrieveChunks, buildRAGPrompt, getRAGStatus } = require('./rag.service');
const config = require('../config');

// Initialize Ollama client
const ollama = new Ollama({ host: config.OLLAMA.HOST });

/**
 * Generate response from Ollama model with RAG context
 * @param {string} systemPrompt - System prompt with instructions
 * @param {string} userPrompt - User prompt with context and query
 * @returns {string} - AI generated response
 */
const generateRAGResponse = async (systemPrompt, userPrompt) => {
  try {
    const response = await ollama.chat({
      model: config.OLLAMA.MODEL,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ]
    });
    
    return response.message.content;
  } catch (error) {
    console.error('Ollama error:', error.message);
    throw new Error(`Failed to generate response from Ollama: ${error.message}`);
  }
};

/**
 * Process a yoga-related query with RAG pipeline
 * @param {string} query - User's question
 * @param {string} sessionId - Optional session identifier
 * @returns {Object} - Processed query result with sources
 */
const processQuery = async (query, sessionId = '') => {
  const startTime = Date.now();
  
  const trimmedQuery = query.trim();

  // Process safety filter
  const safetyResult = processSafetyFilter(trimmedQuery);

  let retrievedChunks = [];
  let aiAnswer;

  // If query is unsafe, still provide helpful guidance with safety warnings
  if (safetyResult.isUnsafe) {
    // Still retrieve relevant chunks for context
    try {
      retrievedChunks = await retrieveChunks(trimmedQuery, config.RAG.TOP_K_CHUNKS);
    } catch (error) {
      console.warn('Could not retrieve chunks:', error.message);
    }

    // Build prompt with safety flag
    const { systemPrompt, userPrompt } = buildRAGPrompt(
      trimmedQuery, 
      retrievedChunks, 
      true // isUnsafe
    );

    // Generate response with safety awareness
    const ragResponse = await generateRAGResponse(systemPrompt, userPrompt);

    // Prepend safety warning to response
    aiAnswer = `⚠️ **Safety Notice**\n\n${safetyResult.safetyWarning}\n\n---\n\n${ragResponse}\n\n---\n\n**Recommended Safer Alternatives:**\n${safetyResult.safeRecommendation}`;
  } else {
    // Normal RAG flow
    try {
      // Retrieve relevant chunks from vector store
      retrievedChunks = await retrieveChunks(trimmedQuery, config.RAG.TOP_K_CHUNKS);
      console.log(`📚 Retrieved ${retrievedChunks.length} relevant chunks`);
    } catch (error) {
      console.warn('Could not retrieve chunks, using direct generation:', error.message);
    }

    // Build RAG prompt with context
    const { systemPrompt, userPrompt } = buildRAGPrompt(
      trimmedQuery, 
      retrievedChunks, 
      false
    );

    // Generate response using Ollama with RAG context
    aiAnswer = await generateRAGResponse(systemPrompt, userPrompt);
  }

  const responseTime = Date.now() - startTime;

  // Create query log entry with all required data
  const queryLog = new QueryLog({
    userQuery: trimmedQuery,
    retrievedChunks: retrievedChunks.map(chunk => ({
      chunkId: chunk.chunkId,
      title: chunk.title,
      content: chunk.content,
      source: chunk.source,
      similarityScore: chunk.similarityScore
    })),
    aiAnswer,
    isUnsafe: safetyResult.isUnsafe,
    safetyKeywordsDetected: safetyResult.safetyKeywordsDetected,
    safetyWarning: safetyResult.safetyWarning,
    safeRecommendation: safetyResult.safeRecommendation,
    responseTime,
    sessionId
  });

  // Save to MongoDB
  await queryLog.save();

  return {
    queryId: queryLog._id,
    query: trimmedQuery,
    answer: aiAnswer,
    sources: retrievedChunks.map(chunk => ({
      id: chunk.chunkId,
      title: chunk.title,
      source: chunk.source,
      category: chunk.category,
      relevanceScore: chunk.similarityScore
    })),
    isUnsafe: safetyResult.isUnsafe,
    safetyWarning: safetyResult.isUnsafe ? safetyResult.safetyWarning : null,
    safeRecommendation: safetyResult.isUnsafe ? safetyResult.safeRecommendation : null,
    responseTime: `${responseTime}ms`
  };
};

/**
 * Get query history with pagination
 * @param {Object} options - Query options
 * @returns {Object} - Paginated query history
 */
const getQueryHistory = async (options = {}) => {
  const { limit = 10, page = 1, unsafe = null } = options;
  
  const filter = {};
  if (unsafe !== null) {
    filter.isUnsafe = unsafe === 'true';
  }

  const queries = await QueryLog.find(filter)
    .sort({ createdAt: -1 })
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit))
    .select('-__v');

  const total = await QueryLog.countDocuments(filter);

  return {
    queries,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit))
    }
  };
};

/**
 * Get RAG system status
 * @returns {Object} - RAG status information
 */
const getSystemStatus = () => {
  return getRAGStatus();
};

module.exports = {
  processQuery,
  getQueryHistory,
  getSystemStatus
};
