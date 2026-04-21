const API_URL = 'http://localhost:5000/api';

const apiSubmitFeedback = async (text, category) => {
  const res = await fetch(`${API_URL}/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'wallet-address': walletAddress
    },
    body: JSON.stringify({ text, category, walletAddress })
  });
  return res.json();
};

const apiGetAllFeedback = async () => {
  const res = await fetch(`${API_URL}/feedback`);
  return res.json();
};

const apiGetStats = async () => {
  const res = await fetch(`${API_URL}/feedback/stats`, {
    headers: { 'wallet-address': walletAddress }
  });
  return res.json();
};

const apiRespondToFeedback = async (id, response) => {
  const res = await fetch(`${API_URL}/feedback/${id}/respond`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'wallet-address': walletAddress
    },
    body: JSON.stringify({ response })
  });
  return res.json();
};

const apiUpdateStatus = async (id, newStatus) => {
  const res = await fetch(`${API_URL}/feedback/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'wallet-address': walletAddress
    },
    body: JSON.stringify({ newStatus })
  });
  return res.json();
};

const apiGetResponses = async (id) => {
  const res = await fetch(`${API_URL}/feedback/${id}/responses`);
  return res.json();
};

const apiGetEditHistory = async (id) => {
  const res = await fetch(`${API_URL}/feedback/${id}/history`);
  return res.json();
};

const apiCheckVote = async (id, wallet) => {
  const res = await fetch(`${API_URL}/feedback/${id}/vote-check?wallet=${wallet}`);
  return res.json();
};

const apiUpvote = async (id) => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    const tx = await contract.upvoteFeedback(id);
    const receipt = await tx.wait();
    return { data: { txHash: receipt.hash } };
  } catch (error) {
    return { error: error.reason || error.message };
  }
};

const apiDownvote = async (id) => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    const tx = await contract.downvoteFeedback(id);
    const receipt = await tx.wait();
    return { data: { txHash: receipt.hash } };
  } catch (error) {
    return { error: error.reason || error.message };
  }
};

const apiEditFeedback = async (id, newText) => {
  const res = await fetch(`${API_URL}/feedback/${id}/edit`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'wallet-address': walletAddress
    },
    body: JSON.stringify({ newText })
  });
  return res.json();
};

const apiAdminRespond = async (id, responseText) => {
  const res = await fetch(`${API_URL}/feedback/${id}/respond`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'wallet-address': walletAddress
    },
    body: JSON.stringify({ responseText })
  });
  return res.json();
};

const apiAddComment = async (id, responseText) => {
  const res = await fetch(`${API_URL}/feedback/${id}/comment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'wallet-address': walletAddress
    },
    body: JSON.stringify({ responseText })
  });
  return res.json();
};