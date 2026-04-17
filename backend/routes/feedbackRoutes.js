const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { checkAdmin, checkWallet } = require('../middleware/authMiddleware');

// Student routes
router.post('/', checkWallet, feedbackController.submitFeedback);
router.get('/', feedbackController.getAllFeedback);
router.get('/stats', checkAdmin, feedbackController.getStats);
router.get('/:id', feedbackController.getFeedbackById);

// Admin routes
router.put('/:id/respond', checkAdmin, feedbackController.respondToFeedback);
router.put('/:id/status', checkAdmin, feedbackController.updateStatus);

module.exports = router;