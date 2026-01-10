const { Ollama } = require('ollama');
const { QueryLog } = require('../models');
const { processSafetyFilter } = require('./safety.service');
const config = require('../config');

// Initialize Ollama client
const ollama = new Ollama({ host: config.OLLAMA.HOST });

/**
 * Generate response from Ollama model
 * @param {string} query - User's question
 * @returns {string} - AI generated response
 */
const generateOllamaResponse = async (query) => {
  try {
    const response = await ollama.chat({
      model: config.OLLAMA.MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a knowledgeable yoga instructor and wellness expert. 
Provide helpful, accurate, and safe advice about yoga poses, breathing techniques, 
meditation practices, and general wellness. Always prioritize user safety and 
recommend consulting healthcare professionals for medical concerns.`
        },
        {
          role: 'user',
          content: query
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
 * Process a yoga-related query
 * @param {string} query - User's question
 * @param {string} sessionId - Optional session identifier
 * @returns {Object} - Processed query result
 */
const processQuery = async (query, sessionId = '') => {
  const startTime = Date.now();
  
  const trimmedQuery = query.trim();

  // Process safety filter
  const safetyResult = processSafetyFilter(trimmedQuery);

  // Placeholder for RAG response (future: retrieve relevant chunks)
  const retrievedChunks = [];

  let aiAnswer;

  // If query is unsafe, provide safety response
  if (safetyResult.isUnsafe) {
    aiAnswer = `⚠️ **Safety Notice**\n\n${safetyResult.safetyWarning}\n\n**Recommended Alternatives:**\n${safetyResult.safeRecommendation}`;
  } else {
    // Generate response using Ollama yoga model
    aiAnswer = await generateOllamaResponse(trimmedQuery);
  }

  const responseTime = Date.now() - startTime;

  // Create query log entry
  const queryLog = new QueryLog({
    userQuery: trimmedQuery,
    retrievedChunks,
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
      source: chunk.source
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

module.exports = {
  processQuery,
  getQueryHistory
};
