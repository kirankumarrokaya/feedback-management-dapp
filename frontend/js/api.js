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