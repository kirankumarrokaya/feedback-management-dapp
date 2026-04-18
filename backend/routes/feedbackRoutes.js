const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { checkAdmin, checkWallet } = require('../middleware/authMiddleware');

// =====================
// PUBLIC ROUTES
// =====================
router.get('/', feedbackController.getAllFeedback);
router.get('/stats', feedbackController.getStats);
router.get('/:id', feedbackController.getFeedbackById);
router.get('/:id/responses', feedbackController.getResponses);
router.get('/:id/history', feedbackController.getEditHistory);
router.get('/:id/vote-check', feedbackController.checkVote);
router.get('/auth/check-admin', (req, res) => {
  const walletAddress = req.headers['wallet-address'];
  const isAdmin = walletAddress &&
    walletAddress.toLowerCase() === process.env.ADMIN_WALLET_ADDRESS.toLowerCase();
  res.json({ isAdmin: !!isAdmin });
});

// =====================
// STUDENT ROUTES
// =====================
router.post('/', checkWallet, feedbackController.submitFeedback);
router.put('/:id/edit', checkWallet, feedbackController.editFeedback);
router.post('/:id/upvote', checkWallet, feedbackController.upvoteFeedback);
router.post('/:id/downvote', checkWallet, feedbackController.downvoteFeedback);

// =====================
// ADMIN ROUTES
// =====================
router.post('/:id/respond', checkAdmin, feedbackController.addResponse);
router.put('/:id/status', checkAdmin, feedbackController.updateStatus);

module.exports = router;