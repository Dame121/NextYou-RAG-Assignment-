const express = require('express');
const router = express.Router();
const { QueryLog } = require('../models');
const { processSafetyFilter } = require('../utils/safetyFilter');

/**
 * POST /api/ask
 * Main endpoint for yoga-related queries
 * 
 * Request body:
 * {
 *   "query": "What are the benefits of downward dog?",
 *   "sessionId": "optional-session-id"
 * }
 */
router.post('/', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { query, sessionId = '' } = req.body;

    // Validate input
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid query'
      });
    }

    const trimmedQuery = query.trim();

    // Process safety filter
    const safetyResult = processSafetyFilter(trimmedQuery);

    // TODO: RAG Pipeline Integration
    // 1. Generate embeddings for the query
    // 2. Search vector store for relevant chunks
    // 3. Retrieve top-k matching chunks
    // 4. Construct prompt with retrieved context
    // 5. Generate AI response

    // Placeholder for RAG response (to be implemented)
    const retrievedChunks = [
      // This will be populated by the RAG pipeline
      // Example structure:
      // {
      //   chunkId: 'chunk_001',
      //   title: 'Benefits of Downward Dog',
      //   content: 'Downward Dog (Adho Mukha Svanasana) is...',
      //   source: 'Article 1',
      //   similarityScore: 0.95
      // }
    ];

    // Placeholder AI response (to be replaced with actual LLM response)
    let aiAnswer = "This is a placeholder response. The RAG pipeline will be integrated here to provide accurate yoga-related answers based on our knowledge base.";

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

    // Send response
    res.status(200).json({
      success: true,
      data: {
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
      }
    });

  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process your query',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/ask/history
 * Get query history (for analytics/debugging)
 */
router.get('/history', async (req, res) => {
  try {
    const { limit = 10, page = 1, unsafe = null } = req.query;
    
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

    res.status(200).json({
      success: true,
      data: {
        queries,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Error fetching query history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch query history'
    });
  }
});

module.exports = router;
