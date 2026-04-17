const submitFeedback = async (req, res, next) => {
  try {
    const { text, category, walletAddress } = req.body;

    if (!text || !category || !walletAddress) {
      return res.status(400).json({ error: 'Text, category and walletAddress are required' });
    }

    // Blockchain call will be added in Step 4
    res.status(201).json({
      message: 'Feedback submitted successfully',
      data: { text, category, walletAddress }
    });

  } catch (error) {
    next(error);
  }
};

const getAllFeedback = async (req, res, next) => {
  try {
    // Blockchain call will be added in Step 4
    res.status(200).json({ message: 'All feedback', data: [] });
  } catch (error) {
    next(error);
  }
};

const getFeedbackById = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Blockchain call will be added in Step 4
    res.status(200).json({ message: `Feedback ${id}`, data: {} });
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

    // Blockchain call will be added in Step 4
    res.status(200).json({ message: `Responded to feedback ${id}` });
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

    // Blockchain call will be added in Step 4
    res.status(200).json({ message: `Status updated to ${newStatus}` });
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    // Blockchain call will be added in Step 4
    res.status(200).json({
      data: { total: 0, pending: 0, reviewed: 0, resolved: 0 }
    });
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