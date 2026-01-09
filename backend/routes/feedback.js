const express = require('express');
const router = express.Router();
const { Feedback, QueryLog } = require('../models');

/**
 * POST /api/feedback
 * Submit feedback for a query response
 * 
 * Request body:
 * {
 *   "queryId": "mongodb-object-id",
 *   "isHelpful": true/false,
 *   "comment": "optional comment",
 *   "sessionId": "optional-session-id"
 * }
 */
router.post('/', async (req, res) => {
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

    // Verify query exists
    const queryExists = await QueryLog.findById(queryId);
    if (!queryExists) {
      return res.status(404).json({
        success: false,
        message: 'Query not found'
      });
    }

    // Check if feedback already exists for this query
    const existingFeedback = await Feedback.findOne({ queryLogId: queryId });
    if (existingFeedback) {
      // Update existing feedback
      existingFeedback.isHelpful = isHelpful;
      existingFeedback.comment = comment;
      await existingFeedback.save();

      return res.status(200).json({
        success: true,
        message: 'Feedback updated successfully',
        data: {
          feedbackId: existingFeedback._id,
          isHelpful
        }
      });
    }

    // Create new feedback
    const feedback = new Feedback({
      queryLogId: queryId,
      isHelpful,
      comment,
      sessionId
    });

    await feedback.save();

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback!',
      data: {
        feedbackId: feedback._id,
        isHelpful
      }
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/feedback/stats
 * Get feedback statistics (for analytics)
 */
router.get('/stats', async (req, res) => {
  try {
    const totalFeedback = await Feedback.countDocuments();
    const helpfulCount = await Feedback.countDocuments({ isHelpful: true });
    const notHelpfulCount = await Feedback.countDocuments({ isHelpful: false });

    const helpfulPercentage = totalFeedback > 0 
      ? ((helpfulCount / totalFeedback) * 100).toFixed(2) 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalFeedback,
        helpful: helpfulCount,
        notHelpful: notHelpfulCount,
        helpfulPercentage: `${helpfulPercentage}%`
      }
    });

  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback statistics'
    });
  }
});

module.exports = router;
