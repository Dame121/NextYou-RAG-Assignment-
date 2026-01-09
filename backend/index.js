const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const askRoutes = require('./routes/ask');
const feedbackRoutes = require('./routes/feedback');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

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
    endpoints: {
      ask: 'POST /api/ask',
      feedback: 'POST /api/feedback',
      health: 'GET /health'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', database: 'MongoDB connected' });
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
  console.log(`Server is running on http://localhost:${PORT}`);
});
