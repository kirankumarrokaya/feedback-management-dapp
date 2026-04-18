const { contract, readContract } = require('../config/blockchain');

// =====================
// HELPER FUNCTIONS
// =====================
const categories = ['TEACHING', 'FACILITIES', 'ADMIN', 'OTHER'];
const statuses = ['PENDING', 'REVIEWED', 'RESOLVED'];

const formatFeedback = (id, text, category, status, submitter, timestamp, upvotes, downvotes) => ({
  id: Number(id),
  text,
  category: categories[Number(category)],
  status: statuses[Number(status)],
  submittedBy: submitter,
  timestamp: new Date(Number(timestamp) * 1000).toISOString(),
  upvotes: Number(upvotes),
  downvotes: Number(downvotes),
  voteScore: Number(upvotes) - Number(downvotes)
});

// =====================
// STUDENT FUNCTIONS
// =====================
const submitFeedback = async (text, category) => {
  try {
    const categoryIndex = categories.indexOf(category);
    if (categoryIndex === -1) throw new Error('Invalid category');

    const tx = await contract.submitFeedback(text, categoryIndex);
    const receipt = await tx.wait();

    return {
      txHash: receipt.hash,
      feedbackId: Number(receipt.logs[0].topics[1])
    };
  } catch (error) {
    throw new Error(`Submit error: ${error.message}`);
  }
};

const editFeedback = async (id, newText) => {
  try {
    const tx = await contract.editFeedback(id, newText);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  } catch (error) {
    throw new Error(`Edit error: ${error.message}`);
  }
};

// =====================
// VOTING FUNCTIONS
// =====================
const upvoteFeedback = async (id, walletAddress) => {
  try {
    const tx = await contract.upvoteFeedback(id);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  } catch (error) {
    throw new Error(`Upvote error: ${error.message}`);
  }
};

const downvoteFeedback = async (id, walletAddress) => {
  try {
    const tx = await contract.downvoteFeedback(id);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  } catch (error) {
    throw new Error(`Downvote error: ${error.message}`);
  }
};

const getVoteScore = async (id) => {
  try {
    const score = await readContract.getVoteScore(id);
    return { score: Number(score) };
  } catch (error) {
    throw new Error(`Vote score error: ${error.message}`);
  }
};

const hasUserVoted = async (id, walletAddress) => {
  try {
    const voted = await readContract.hasUserVoted(id, walletAddress);
    return { hasVoted: voted };
  } catch (error) {
    throw new Error(`Check vote error: ${error.message}`);
  }
};

// =====================
// ADMIN FUNCTIONS
// =====================
const addResponse = async (id, responseText) => {
  try {
    const tx = await contract.addResponse(id, responseText);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  } catch (error) {
    throw new Error(`Response error: ${error.message}`);
  }
};

const updateStatus = async (id, newStatus) => {
  try {
    const statusIndex = statuses.indexOf(newStatus);
    if (statusIndex === -1) throw new Error('Invalid status');

    const tx = await contract.updateStatus(id, statusIndex);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  } catch (error) {
    throw new Error(`Status error: ${error.message}`);
  }
};

// =====================
// READ FUNCTIONS
// =====================
const getAllFeedback = async () => {
  try {
    const result = await readContract.getAllFeedback();
    const [ids, texts, cats, stats, submitters, timestamps, upvotes, downvotes] = result;

    return ids.map((id, i) =>
      formatFeedback(id, texts[i], cats[i], stats[i], submitters[i], timestamps[i], upvotes[i], downvotes[i])
    );
  } catch (error) {
    throw new Error(`Get all error: ${error.message}`);
  }
};

const getFeedbackById = async (id) => {
  try {
    const result = await readContract.getFeedbackById(id);
    const [fId, text, category, status, submitter, timestamp, upvotes, downvotes] = result;
    return formatFeedback(fId, text, category, status, submitter, timestamp, upvotes, downvotes);
  } catch (error) {
    throw new Error(`Get by id error: ${error.message}`);
  }
};

const getResponses = async (id) => {
  try {
    const responses = await readContract.getResponses(id);
    return responses.map(r => ({
      adminWallet: r.adminWallet,
      responseText: r.responseText,
      timestamp: new Date(Number(r.timestamp) * 1000).toISOString()
    }));
  } catch (error) {
    throw new Error(`Get responses error: ${error.message}`);
  }
};

const getEditHistory = async (id) => {
  try {
    const history = await readContract.getEditHistory(id);
    return history.map(h => ({
      oldText: h.oldText,
      newText: h.newText,
      timestamp: new Date(Number(h.timestamp) * 1000).toISOString()
    }));
  } catch (error) {
    throw new Error(`Get edit history error: ${error.message}`);
  }
};

const getStats = async () => {
  try {
    const feedbacks = await getAllFeedback();
    return {
      total: feedbacks.length,
      pending: feedbacks.filter(f => f.status === 'PENDING').length,
      reviewed: feedbacks.filter(f => f.status === 'REVIEWED').length,
      resolved: feedbacks.filter(f => f.status === 'RESOLVED').length,
      topVoted: [...feedbacks].sort((a, b) => b.voteScore - a.voteScore).slice(0, 3),
      mostDownvoted: [...feedbacks].sort((a, b) => a.voteScore - b.voteScore).slice(0, 3)
    };
  } catch (error) {
    throw new Error(`Stats error: ${error.message}`);
  }
};

module.exports = {
  submitFeedback,
  editFeedback,
  upvoteFeedback,
  downvoteFeedback,
  getVoteScore,
  hasUserVoted,
  addResponse,
  updateStatus,
  getAllFeedback,
  getFeedbackById,
  getResponses,
  getEditHistory,
  getStats
};