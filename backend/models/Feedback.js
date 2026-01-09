const mongoose = require('mongoose');

// Feedback Schema for user feedback on AI responses
const feedbackSchema = new mongoose.Schema({
  // Reference to the query log
  queryLogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QueryLog',
    required: true
  },
  
  // User's feedback: true = helpful (👍), false = not helpful (👎)
  isHelpful: {
    type: Boolean,
    required: true
  },
  
  // Optional comment from user
  comment: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Session/User identifier
  sessionId: {
    type: String,
    default: ''
  },
  
  // Timestamp
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for analytics
feedbackSchema.index({ queryLogId: 1 });
feedbackSchema.index({ isHelpful: 1 });
feedbackSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
