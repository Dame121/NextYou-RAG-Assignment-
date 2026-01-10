/**
 * Ask Service
 * Handles yoga query processing with RAG pipeline integration
 */

const ollama = require('ollama');
const config = require('../config');
const QueryLog = require('../models/queryLog.model');
const ragService = require('./rag.service');
const safetyService = require('./safety.service');

// Ollama client configuration
const ollamaClient = new ollama.Ollama({
  host: config.OLLAMA.HOST
});

/**
 * Generate response using Ollama yoga model
 * @param {string} query - User's question
 * @param {string} context - RAG context from retrieved chunks
 * @param {boolean} isUnsafe - Whether the query is flagged as unsafe
 * @returns {Promise<string>} - AI generated response
 */
const generateOllamaResponse = async (query, context = '', isUnsafe = false) => {
  let systemPrompt = `You are a knowledgeable and caring yoga instructor assistant. 
You provide helpful, accurate information about yoga poses, breathing techniques, meditation, and wellness practices.
Always be supportive and encouraging while prioritizing safety.`;

  if (isUnsafe) {
    systemPrompt += `

IMPORTANT: This query has been flagged as potentially risky. 
- DO NOT provide specific medical advice or diagnosis
- DO NOT recommend poses without mentioning the need for professional guidance
- Always emphasize consulting healthcare providers
- Suggest gentle, safe alternatives when possible
- Be extra cautious and caring in your response`;
  }

  if (context) {
    systemPrompt += `

Use the following context from our yoga knowledge base to inform your answer:

${context}

Base your response on this context when relevant, but you can also use your general knowledge about yoga.`;
  }

  try {
    const response = await ollamaClient.chat({
      model: config.OLLAMA.MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ],
      stream: false
    });

    return response.message.content;
  } catch (error) {
    console.error('Ollama generation error:', error);
    throw new Error('Failed to generate response from AI model');
  }
};

/**
 * Process user query with RAG and safety checks
 * @param {string} query - User's question
 * @param {string} sessionId - Optional session identifier
 * @returns {Promise<Object>} - Processed response with answer and metadata
 */
const processQuery = async (query, sessionId = null) => {
  const startTime = Date.now();

  try {
    // Step 1: Safety Check
    const safetyCheck = safetyService.checkQuery(query);
    
    // Step 2: RAG Retrieval
    let retrievedChunks = [];
    let ragContext = '';
    let sources = [];

    try {
      const ragResult = await ragService.retrieveContext(query);
      retrievedChunks = ragResult.chunks || [];
      ragContext = ragResult.context || '';
      sources = ragResult.sources || [];
    } catch (ragError) {
      console.error('RAG retrieval error:', ragError);
      // Continue without RAG context if it fails
    }

    // Step 3: Generate Response
    let aiAnswer = '';
    let safetyWarning = null;
    let safeRecommendation = null;

    if (safetyCheck.isUnsafe) {
      // Generate safety-aware response
      safetyWarning = safetyCheck.safetyResponse.warning;
      safeRecommendation = safetyCheck.safetyResponse.recommendation;
      
      // Generate AI response with safety context
      const baseResponse = await generateOllamaResponse(query, ragContext, true);
      
      // Combine AI response with safety information
      aiAnswer = `${safetyCheck.safetyResponse.warning}

${baseResponse}

---

**🛡️ Safe Alternatives:**
${safetyCheck.safetyResponse.recommendation}

**⚕️ Professional Guidance:**
${safetyCheck.safetyResponse.disclaimer}`;
    } else {
      // Generate normal response
      aiAnswer = await generateOllamaResponse(query, ragContext, false);
    }

    const responseTime = Date.now() - startTime;

    // Step 4: Log to MongoDB
    const queryLog = new QueryLog({
      userQuery: query,
      retrievedChunks: retrievedChunks.map(chunk => ({
        chunkId: chunk.id,
        title: chunk.title,
        content: chunk.content.substring(0, 500),
        source: chunk.category,
        similarityScore: chunk.similarity
      })),
      aiAnswer,
      isUnsafe: safetyCheck.isUnsafe,
      safetyKeywordsDetected: safetyCheck.keywords,
      safetyWarning,
      safeRecommendation,
      responseTime,
      sessionId
    });

    await queryLog.save();

    // Step 5: Return response
    return {
      success: true,
      data: {
        answer: aiAnswer,
        sources: sources,
        isUnsafe: safetyCheck.isUnsafe,
        safetyInfo: safetyCheck.isUnsafe ? {
          warning: safetyCheck.safetyResponse.warning,
          recommendation: safetyCheck.safetyResponse.recommendation,
          disclaimer: safetyCheck.safetyResponse.disclaimer,
          detectedKeywords: safetyCheck.keywords,
          detectedCategories: safetyCheck.categories
        } : null,
        queryId: queryLog._id,
        responseTime
      }
    };

  } catch (error) {
    console.error('Error processing query:', error);
    
    // Log failed query
    try {
      await new QueryLog({
        userQuery: query,
        aiAnswer: 'Error processing query',
        isUnsafe: false,
        responseTime: Date.now() - startTime,
        sessionId
      }).save();
    } catch (logError) {
      console.error('Error logging failed query:', logError);
    }

    throw error;
  }
};

/**
 * Get query history
 * @param {number} limit - Number of records to return
 * @returns {Promise<Array>} - Array of query logs
 */
const getQueryHistory = async (limit = 50) => {
  return await QueryLog.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('-__v');
};

/**
 * Get safety statistics
 * @returns {Promise<Object>} - Safety statistics
 */
const getSafetyStats = async () => {
  const total = await QueryLog.countDocuments();
  const unsafe = await QueryLog.countDocuments({ isUnsafe: true });
  
  const keywordStats = await QueryLog.aggregate([
    { $match: { isUnsafe: true } },
    { $unwind: '$safetyKeywordsDetected' },
    { $group: { _id: '$safetyKeywordsDetected', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  return {
    totalQueries: total,
    unsafeQueries: unsafe,
    safeQueries: total - unsafe,
    unsafePercentage: total > 0 ? ((unsafe / total) * 100).toFixed(2) : 0,
    topSafetyKeywords: keywordStats
  };
};

module.exports = {
  processQuery,
  getQueryHistory,
  getSafetyStats,
  generateOllamaResponse
};
