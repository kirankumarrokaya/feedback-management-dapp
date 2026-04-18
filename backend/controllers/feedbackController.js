const blockchainService = require('../services/blockchainService');

// =====================
// STUDENT FUNCTIONS
// =====================
const submitFeedback = async (req, res, next) => {
  try {
    const { text, category } = req.body;

    if (!text || !category) {
      return res.status(400).json({ error: 'Text and category are required' });
    }

    const validCategories = ['TEACHING', 'FACILITIES', 'ADMIN', 'OTHER'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const result = await blockchainService.submitFeedback(text, category);
    res.status(201).json({
      message: 'Feedback submitted successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const editFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newText } = req.body;

    if (!newText) {
      return res.status(400).json({ error: 'New text is required' });
    }

    const result = await blockchainService.editFeedback(Number(id), newText);
    res.status(200).json({
      message: 'Feedback edited successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// =====================
// VOTING FUNCTIONS
// =====================
const upvoteFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const walletAddress = req.headers['wallet-address'];

    const { hasVoted } = await blockchainService.hasUserVoted(Number(id), walletAddress);
    if (hasVoted) {
      return res.status(400).json({ error: 'You have already voted on this feedback' });
    }

    const result = await blockchainService.upvoteFeedback(Number(id));
    res.status(200).json({
      message: 'Upvoted successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const downvoteFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const walletAddress = req.headers['wallet-address'];

    const { hasVoted } = await blockchainService.hasUserVoted(Number(id), walletAddress);
    if (hasVoted) {
      return res.status(400).json({ error: 'You have already voted on this feedback' });
    }

    const result = await blockchainService.downvoteFeedback(Number(id));
    res.status(200).json({
      message: 'Downvoted successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const checkVote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const walletAddress = req.query.wallet;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    const result = await blockchainService.hasUserVoted(Number(id), walletAddress);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
};

// =====================
// ADMIN FUNCTIONS
// =====================
const addResponse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { responseText } = req.body;

    if (!responseText) {
      return res.status(400).json({ error: 'Response text is required' });
    }

    const result = await blockchainService.addResponse(Number(id), responseText);
    res.status(200).json({
      message: 'Response added successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newStatus } = req.body;

    const validStatuses = ['PENDING', 'REVIEWED', 'RESOLVED'];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const result = await blockchainService.updateStatus(Number(id), newStatus);
    res.status(200).json({
      message: `Status updated to ${newStatus}`,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// =====================
// READ FUNCTIONS
// =====================
const getAllFeedback = async (req, res, next) => {
  try {
    const feedbacks = await blockchainService.getAllFeedback();
    res.status(200).json({ data: feedbacks });
  } catch (error) {
    next(error);
  }
};

const getFeedbackById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const feedback = await blockchainService.getFeedbackById(Number(id));
    res.status(200).json({ data: feedback });
  } catch (error) {
    next(error);
  }
};

const getResponses = async (req, res, next) => {
  try {
    const { id } = req.params;
    const responses = await blockchainService.getResponses(Number(id));
    res.status(200).json({ data: responses });
  } catch (error) {
    next(error);
  }
};

const getEditHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const history = await blockchainService.getEditHistory(Number(id));
    res.status(200).json({ data: history });
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await blockchainService.getStats();
    res.status(200).json({ data: stats });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitFeedback,
  editFeedback,
  upvoteFeedback,
  downvoteFeedback,
  checkVote,
  addResponse,
  updateStatus,
  getAllFeedback,
  getFeedbackById,
  getResponses,
  getEditHistory,
  getStats
};