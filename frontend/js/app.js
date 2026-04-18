let currentPage = 'dashboard';

const showPage = (page) => {
  ['dashboard', 'submit', 'view', 'admin'].forEach(p => {
    document.getElementById(`page-${p}`).classList.add('d-none');
  });
  document.getElementById(`page-${page}`).classList.remove('d-none');
  currentPage = page;
  loadCurrentPage();
};

const loadCurrentPage = () => {
  if (currentPage === 'dashboard') renderDashboard();
  if (currentPage === 'submit') renderSubmitPage();
  if (currentPage === 'view') renderViewPage();
  if (currentPage === 'admin') renderAdminPanel();
};

const handleSubmitFeedback = async () => {
  const text = document.getElementById('feedbackText').value.trim();
  const category = document.getElementById('categoryInput').value;
  const statusDiv = document.getElementById('submitStatus');

  if (!text) {
    statusDiv.innerHTML = `<div class="alert alert-danger">Feedback text cannot be empty.</div>`;
    return;
  }

  statusDiv.innerHTML = `<div class="alert alert-info">⏳ Submitting to blockchain...</div>`;

  try {
    const result = await apiSubmitFeedback(text, category);
    if (result.data && result.data.txHash) {
      statusDiv.innerHTML = `<div class="alert alert-success">✅ Submitted successfully!</div>`;
      showTxModal(result.data.txHash);
      document.getElementById('feedbackText').value = '';
    } else {
      statusDiv.innerHTML = `<div class="alert alert-danger">Error: ${result.error}</div>`;
    }
  } catch (err) {
    statusDiv.innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`;
  }
};

const handleRespond = (id) => {
  const area = document.getElementById('adminActionArea');
  area.innerHTML = `
    <div class="card p-3 mt-3">
      <h6>Respond to Feedback #${id}</h6>
      <textarea id="responseText" class="form-control mb-2" rows="3"
        placeholder="Write your response..."></textarea>
      <button class="btn btn-primary btn-sm" onclick="submitResponse(${id})">
        Submit Response
      </button>
    </div>
  `;
};

const submitResponse = async (id) => {
  const response = document.getElementById('responseText').value.trim();
  if (!response) { alert('Response cannot be empty'); return; }

  try {
    const result = await apiRespondToFeedback(id, response);
    if (result.data && result.data.txHash) {
      showTxModal(result.data.txHash);
      renderAdminPanel();
    }
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

const handleUpdateStatus = async (id, currentStatus) => {
  const nextStatus = { 'PENDING': 'REVIEWED', 'REVIEWED': 'RESOLVED' };
  const newStatus = nextStatus[currentStatus];

  if (!newStatus) { alert('Already resolved'); return; }

  if (!confirm(`Update status to ${newStatus}?`)) return;

  try {
    const result = await apiUpdateStatus(id, newStatus);
    if (result.data && result.data.txHash) {
      showTxModal(result.data.txHash);
      renderAdminPanel();
    }
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

// Event listeners
document.getElementById('connectBtn').addEventListener('click', connectWallet);
document.getElementById('disconnectBtn').addEventListener('click', disconnectWallet);

// Load dashboard on start
renderDashboard();