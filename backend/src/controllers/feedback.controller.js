const { feedbackService } = require('../services');

/**
 * Handle POST /api/feedback
 */
const submitFeedback = async (req, res) => {
  try {
    const { queryId, isHelpful, comment = '', sessionId = '' } = req.body;

    // Validate input
    if (!queryId) {
      return res.status(400).json({
        success: false,
        message: 'Query ID is required'
      });
    }

    if (typeof isHelpful !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isHelpful must be a boolean (true/false)'
      });
    }

    const result = await feedbackService.submitFeedback({
      queryId,
      isHelpful,
      comment,
      sessionId
    });

    const statusCode = result.updated ? 200 : 201;
    const message = result.updated ? 'Feedback updated successfully' : 'Thank you for your feedback!';

    res.status(statusCode).json({
      success: true,
      message,
      data: result
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    
    if (error.message === 'Query not found') {
      return res.status(404).json({
        success: false,
        message: 'Query not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Handle GET /api/feedback/stats
 */
const getStats = async (req, res) => {
  try {
    const stats = await feedbackService.getFeedbackStats();

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback statistics'
    });
  }
};

module.exports = {
  submitFeedback,
  getStats
};
