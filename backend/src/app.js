const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('./config/db.config');
const { initializeRAG, getRAGStatus } = require('./services/rag.service');

// Import routes
const askRoutes = require('./routes/ask.routes');
const feedbackRoutes = require('./routes/feedback.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Initialize RAG pipeline on startup
const initRAG = async () => {
  try {
    console.log('🔄 Initializing RAG pipeline...');
    const stats = await initializeRAG();
    console.log(`✅ RAG ready with ${stats.vectorCount} vectors`);
  } catch (error) {
    console.warn('⚠️ RAG initialization warning:', error.message);
    console.log('   Run "npm run init-rag" to build the vector index');
  }
};
initRAG();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/ask', askRoutes);
app.use('/api/feedback', feedbackRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Wellness RAG Micro-App: Ask Me Anything About Yoga',
    status: 'Server is running',
    version: '1.0.0',
    endpoints: {
      ask: 'POST /api/ask',
      askHistory: 'GET /api/ask/history',
      feedback: 'POST /api/feedback',
      feedbackStats: 'GET /api/feedback/stats',
      ragStatus: 'GET /api/rag/status',
      health: 'GET /health'
    }
  });
});

// RAG status endpoint
app.get('/api/rag/status', (req, res) => {
  const status = getRAGStatus();
  res.json({
    success: true,
    data: status
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  const ragStatus = getRAGStatus();
  res.json({ 
    status: 'OK', 
    database: 'MongoDB connected',
    rag: {
      initialized: ragStatus.initialized,
      vectorCount: ragStatus.vectorCount
    },
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🧘 Yoga RAG Server is running on http://localhost:${PORT}`);
});

module.exports = app;
