module.exports = {
  // Server configuration
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // MongoDB configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/yoga_rag_db',
  
  // RAG configuration
  RAG: {
    TOP_K_CHUNKS: 5,
    SIMILARITY_THRESHOLD: 0.7
  },
  
  // Safety configuration
  SAFETY: {
    ENABLED: true,
    STRICT_MODE: false
  }
};
