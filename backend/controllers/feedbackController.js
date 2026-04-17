const blockchainService = require('../services/blockchainService');

const submitFeedback = async (req, res, next) => {
  try {
    const { text, category } = req.body;
    if (!text || !category) {
      return res.status(400).json({ error: 'Text and category are required' });
    }
    const result = await blockchainService.submitFeedback(text, category);
    res.status(201).json({ message: 'Feedback submitted', data: result });
  } catch (error) {
    next(error);
  }
};

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

const respondToFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { response } = req.body;
    if (!response) {
      return res.status(400).json({ error: 'Response text is required' });
    }
    const result = await blockchainService.respondToFeedback(Number(id), response);
    res.status(200).json({ message: 'Response submitted', data: result });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newStatus } = req.body;
    const result = await blockchainService.updateStatus(Number(id), newStatus);
    res.status(200).json({ message: 'Status updated', data: result });
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
  getAllFeedback,
  getFeedbackById,
  respondToFeedback,
  updateStatus,
  getStats
};