const { askService } = require('../services');

/**
 * Handle POST /api/ask
 */
const askQuestion = async (req, res) => {
  try {
    const { query, sessionId = '' } = req.body;

    // Validate input
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid query'
      });
    }

    const result = await askService.processQuery(query, sessionId);

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process your query',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Handle GET /api/ask/history
 */
const getHistory = async (req, res) => {
  try {
    const result = await askService.getQueryHistory(req.query);

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error fetching query history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch query history'
    });
  }
};

module.exports = {
  askQuestion,
  getHistory
};
