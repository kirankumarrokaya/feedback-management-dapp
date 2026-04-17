const { contract, readContract } = require('../config/blockchain');

const submitFeedback = async (text, category) => {
  try {
    const categoryIndex = ['TEACHING', 'FACILITIES', 'ADMIN', 'OTHER'].indexOf(category);
    if (categoryIndex === -1) throw new Error('Invalid category');

    const tx = await contract.submitFeedback(text, categoryIndex);
    const receipt = await tx.wait();

    return {
      txHash: receipt.hash,
      feedbackId: Number(receipt.logs[0].topics[1])
    };
  } catch (error) {
    throw new Error(`Blockchain error: ${error.message}`);
  }
};

const getAllFeedback = async () => {
  try {
    const feedbacks = await readContract.getAllFeedback();
    return feedbacks.map(f => formatFeedback(f));
  } catch (error) {
    throw new Error(`Blockchain error: ${error.message}`);
  }
};

const getFeedbackById = async (id) => {
  try {
    const feedback = await readContract.getFeedbackById(id);
    return formatFeedback(feedback);
  } catch (error) {
    throw new Error(`Blockchain error: ${error.message}`);
  }
};

const respondToFeedback = async (id, response) => {
  try {
    const tx = await contract.respondToFeedback(id, response);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  } catch (error) {
    throw new Error(`Blockchain error: ${error.message}`);
  }
};

const updateStatus = async (id, newStatus) => {
  try {
    const statusIndex = ['PENDING', 'REVIEWED', 'RESOLVED'].indexOf(newStatus);
    if (statusIndex === -1) throw new Error('Invalid status');

    const tx = await contract.updateStatus(id, statusIndex);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  } catch (error) {
    throw new Error(`Blockchain error: ${error.message}`);
  }
};

const getStats = async () => {
  try {
    const feedbacks = await readContract.getAllFeedback();
    const total = feedbacks.length;
    const pending = feedbacks.filter(f => f.status === 0n).length;
    const reviewed = feedbacks.filter(f => f.status === 1n).length;
    const resolved = feedbacks.filter(f => f.status === 2n).length;
    return { total, pending, reviewed, resolved };
  } catch (error) {
    throw new Error(`Blockchain error: ${error.message}`);
  }
};

// Helper to format blockchain data
const formatFeedback = (f) => {
  const categories = ['TEACHING', 'FACILITIES', 'ADMIN', 'OTHER'];
  const statuses = ['PENDING', 'REVIEWED', 'RESOLVED'];
  return {
    id: Number(f.id),
    text: f.text,
    category: categories[Number(f.category)],
    status: statuses[Number(f.status)],
    submittedBy: f.submittedBy,
    response: f.response,
    timestamp: new Date(Number(f.timestamp) * 1000).toISOString()
  };
};

module.exports = {
  submitFeedback,
  getAllFeedback,
  getFeedbackById,
  respondToFeedback,
  updateStatus,
  getStats
};