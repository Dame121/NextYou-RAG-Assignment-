const express = require('express');
const router = express.Router();
const { feedbackController } = require('../controllers');

// POST /api/feedback - Submit feedback
router.post('/', feedbackController.submitFeedback);

// GET /api/feedback/stats - Get feedback statistics
router.get('/stats', feedbackController.getStats);

module.exports = router;
