const askService = require('../services/ask.service');

/**
 * Handle yoga question
 * POST /api/ask
 */
const askQuestion = async (req, res, next) => {
  try {
    const { query, sessionId } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Query is required and must be a non-empty string'
      });
    }

    if (query.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Query must be less than 1000 characters'
      });
    }

    const result = await askService.processQuery(query.trim(), sessionId);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get query history
 * GET /api/ask/history
 */
const getHistory = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const history = await askService.getQueryHistory(limit);
    
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get safety statistics
 * GET /api/ask/safety-stats
 */
const getSafetyStats = async (req, res, next) => {
  try {
    const stats = await askService.getSafetyStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  askQuestion,
  getHistory,
  getSafetyStats
};
