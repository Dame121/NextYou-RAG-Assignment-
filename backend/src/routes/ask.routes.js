const express = require('express');
const router = express.Router();
const askController = require('../controllers/ask.controller');

// POST /api/ask - Submit a yoga question
router.post('/', askController.askQuestion);

// GET /api/ask/history - Get query history
router.get('/history', askController.getHistory);

// GET /api/ask/safety-stats - Get safety statistics
router.get('/safety-stats', askController.getSafetyStats);

module.exports = router;
