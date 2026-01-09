const mongoose = require('mongoose');

// Schema for storing yoga knowledge base articles
const knowledgeBaseSchema = new mongoose.Schema({
  // Unique identifier for the article
  articleId: {
    type: String,
    required: true
  },
  
  // Article title
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  // Full content of the article
  content: {
    type: String,
    required: true
  },
  
  // Category of the article
  category: {
    type: String,
    enum: ['asanas', 'pranayama', 'benefits', 'contraindications', 'beginner', 'advanced', 'general'],
    required: true
  },
  
  // Tags for better searchability
  tags: [{
    type: String,
    trim: true
  }],
  
  // Source/citation for the article
  source: {
    type: String,
    default: 'Self-written'
  },
  
  // Difficulty level
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'all-levels'],
    default: 'all-levels'
  },
  
  // Safety considerations for this article
  safetyNotes: {
    type: String,
    default: ''
  },
  
  // Contraindications mentioned
  contraindications: [{
    type: String
  }],
  
  // Is this article active/published
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Text index for full-text search
knowledgeBaseSchema.index({ title: 'text', content: 'text', tags: 'text' });
knowledgeBaseSchema.index({ category: 1 });
knowledgeBaseSchema.index({ articleId: 1 });

module.exports = mongoose.model('KnowledgeBase', knowledgeBaseSchema);
