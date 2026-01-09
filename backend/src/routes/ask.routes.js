const express = require('express');
const router = express.Router();
const { askController } = require('../controllers');

// POST /api/ask - Submit a yoga query
router.post('/', askController.askQuestion);

// GET /api/ask/history - Get query history
router.get('/history', askController.getHistory);

module.exports = router;
