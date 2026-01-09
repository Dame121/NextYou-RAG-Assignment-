const { QueryLog } = require('../models');
const { processSafetyFilter } = require('./safety.service');

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

  // TODO: RAG Pipeline Integration
  // 1. Generate embeddings for the query
  // 2. Search vector store for relevant chunks
  // 3. Retrieve top-k matching chunks
  // 4. Construct prompt with retrieved context
  // 5. Generate AI response

  // Placeholder for RAG response
  const retrievedChunks = [];

  // Placeholder AI response
  let aiAnswer = "This is a placeholder response. The RAG pipeline will be integrated to provide accurate yoga-related answers.";

  // If query is unsafe, modify the response
  if (safetyResult.isUnsafe) {
    aiAnswer = `⚠️ **Safety Notice**\n\n${safetyResult.safetyWarning}\n\n**Recommended Alternatives:**\n${safetyResult.safeRecommendation}`;
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
