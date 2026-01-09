const { Feedback, QueryLog } = require('../models');

/**
 * Submit feedback for a query
 * @param {Object} feedbackData - Feedback data
 * @returns {Object} - Feedback result
 */
const submitFeedback = async (feedbackData) => {
  const { queryId, isHelpful, comment = '', sessionId = '' } = feedbackData;

  // Verify query exists
  const queryExists = await QueryLog.findById(queryId);
  if (!queryExists) {
    throw new Error('Query not found');
  }

  // Check if feedback already exists
  const existingFeedback = await Feedback.findOne({ queryLogId: queryId });
  
  if (existingFeedback) {
    existingFeedback.isHelpful = isHelpful;
    existingFeedback.comment = comment;
    await existingFeedback.save();

    return {
      feedbackId: existingFeedback._id,
      isHelpful,
      updated: true
    };
  }

  // Create new feedback
  const feedback = new Feedback({
    queryLogId: queryId,
    isHelpful,
    comment,
    sessionId
  });

  await feedback.save();

  return {
    feedbackId: feedback._id,
    isHelpful,
    updated: false
  };
};

/**
 * Get feedback statistics
 * @returns {Object} - Feedback stats
 */
const getFeedbackStats = async () => {
  const totalFeedback = await Feedback.countDocuments();
  const helpfulCount = await Feedback.countDocuments({ isHelpful: true });
  const notHelpfulCount = await Feedback.countDocuments({ isHelpful: false });

  const helpfulPercentage = totalFeedback > 0 
    ? ((helpfulCount / totalFeedback) * 100).toFixed(2) 
    : 0;

  return {
    totalFeedback,
    helpful: helpfulCount,
    notHelpful: notHelpfulCount,
    helpfulPercentage: `${helpfulPercentage}%`
  };
};

module.exports = {
  submitFeedback,
  getFeedbackStats
};
