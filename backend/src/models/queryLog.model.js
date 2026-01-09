const mongoose = require('mongoose');

// Schema for retrieved chunks (sources used in RAG)
const retrievedChunkSchema = new mongoose.Schema({
  chunkId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  source: {
    type: String,
    default: ''
  },
  similarityScore: {
    type: Number,
    default: 0
  }
}, { _id: false });

// Main Query Log Schema - Stores all required data per assignment
const queryLogSchema = new mongoose.Schema({
  // User's original query
  userQuery: {
    type: String,
    required: true,
    trim: true
  },
  
  // Retrieved chunks from vector store (sources used)
  retrievedChunks: [retrievedChunkSchema],
  
  // Final AI-generated answer
  aiAnswer: {
    type: String,
    required: true
  },
  
  // Safety flags
  isUnsafe: {
    type: Boolean,
    default: false
  },
  
  // Detected safety keywords that triggered the flag
  safetyKeywordsDetected: [{
    type: String
  }],
  
  // Safety warning message (if isUnsafe is true)
  safetyWarning: {
    type: String,
    default: ''
  },
  
  // Modified/safer recommendation (if isUnsafe is true)
  safeRecommendation: {
    type: String,
    default: ''
  },
  
  // Response time in milliseconds
  responseTime: {
    type: Number,
    default: 0
  },
  
  // Session/User identifier (optional, for tracking)
  sessionId: {
    type: String,
    default: ''
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for faster queries
queryLogSchema.index({ createdAt: -1 });
queryLogSchema.index({ isUnsafe: 1 });
queryLogSchema.index({ userQuery: 'text' });

module.exports = mongoose.model('QueryLog', queryLogSchema);
