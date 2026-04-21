let currentPage = 'dashboard';

// =====================
// PAGE NAVIGATION
// =====================
const showPage = (page) => {
  ['dashboard', 'submit', 'view', 'admin'].forEach(p => {
    document.getElementById(`page-${p}`).classList.add('d-none');
  });
  document.getElementById(`page-${page}`).classList.remove('d-none');

  // Update active tab
  document.querySelectorAll('#mainTabs .nav-link').forEach(link => {
    link.classList.remove('active');
  });
  const activeLink = document.querySelector(`#mainTabs .nav-link[onclick="showPage('${page}')"]`);
  if (activeLink) activeLink.classList.add('active');

  currentPage = page;
  loadCurrentPage();
};

const loadCurrentPage = () => {
  if (currentPage === 'dashboard') renderDashboard();
  if (currentPage === 'submit')    renderSubmitPage();
  if (currentPage === 'view')      renderViewPage();
  if (currentPage === 'admin')     renderAdminPanel();
};

// =====================
// SUBMIT FEEDBACK
// =====================
const handleSubmitFeedback = async () => {
  const text = document.getElementById('feedbackText').value.trim();
  const category = document.getElementById('categoryInput').value;
  const statusDiv = document.getElementById('submitStatus');
  const btn = document.getElementById('submitBtn');

  if (!text) {
    showToast('Feedback text cannot be empty.', 'warning');
    return;
  }

  // Loading state
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Submitting to blockchain...`;
  statusDiv.innerHTML = '';

  try {
    const result = await apiSubmitFeedback(text, category);
    if (result.data && result.data.txHash) {
      showTxModal(result.data.txHash);
      showToast('Feedback submitted successfully to blockchain!', 'success');
      document.getElementById('feedbackText').value = '';
      statusDiv.innerHTML = `
        <div class="alert alert-success d-flex align-items-center gap-2 mt-2">
          <i data-lucide="check-circle" style="width:18px;height:18px;"></i>
          Feedback submitted successfully!
        </div>
      `;
      if (window.lucide) lucide.createIcons();
    } else {
      showToast(result.error || 'Submission failed. Try again.', 'error');
      statusDiv.innerHTML = `
        <div class="alert alert-danger d-flex align-items-center gap-2 mt-2">
          <i data-lucide="x-circle" style="width:18px;height:18px;"></i>
          ${result.error || 'Submission failed.'}
        </div>
      `;
      if (window.lucide) lucide.createIcons();
    }
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `
      <i data-lucide="send" style="width:16px;height:16px;"></i>
      Submit to Blockchain
    `;
    if (window.lucide) lucide.createIcons();
  }
};

// =====================
// VOTING
// =====================
const handleUpvote = async (id) => {
  if (!walletAddress) {
    showToast('Please connect your wallet to vote.', 'warning');
    return;
  }
  try {
    const result = await apiUpvote(id);
    if (result.data && result.data.txHash) {
      showTxModal(result.data.txHash);
      showToast('Upvote recorded on blockchain!', 'success');
      renderViewPage();
    } else {
      showToast(result.error || 'Error voting.', 'error');
    }
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }
};

const handleDownvote = async (id) => {
  if (!walletAddress) {
    showToast('Please connect your wallet to vote.', 'warning');
    return;
  }
  try {
    const result = await apiDownvote(id);
    if (result.data && result.data.txHash) {
      showTxModal(result.data.txHash);
      showToast('Downvote recorded on blockchain!', 'success');
      renderViewPage();
    } else {
      showToast(result.error || 'Error voting.', 'error');
    }
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }
};

// =====================
// EDIT FEEDBACK
// =====================
const handleEditFeedback = (id, currentText) => {
  const area = document.getElementById(`responses-${id}`);
  area.classList.remove('d-none');
  area.innerHTML = `
    <div class="card p-3 mt-2" style="border:1px solid #f59e0b;border-radius:10px;">
      <div class="d-flex align-items-center gap-2 mb-2">
        <i data-lucide="pencil" style="width:16px;height:16px;color:#f59e0b;"></i>
        <h6 class="mb-0 fw-semibold">Edit Feedback #${id}</h6>
      </div>
      <textarea id="editText-${id}" class="form-control mb-2" rows="3">${currentText}</textarea>
      <div class="d-flex gap-2">
        <button class="btn btn-warning btn-sm d-flex align-items-center gap-2"
          onclick="submitEdit(${id})">
          <i data-lucide="save" style="width:14px;height:14px;"></i>
          Save to Blockchain
        </button>
        <button class="btn btn-outline-secondary btn-sm" onclick="document.getElementById('responses-${id}').classList.add('d-none')">
          Cancel
        </button>
      </div>
    </div>
  `;
  if (window.lucide) lucide.createIcons();
};

const submitEdit = async (id) => {
  const newText = document.getElementById(`editText-${id}`).value.trim();
  if (!newText) {
    showToast('Text cannot be empty.', 'warning');
    return;
  }
  try {
    const result = await apiEditFeedback(id, newText);
    if (result.data && result.data.txHash) {
      showTxModal(result.data.txHash);
      showToast('Feedback updated on blockchain!', 'success');
      renderViewPage();
    } else {
      showToast(result.error || 'Error editing feedback.', 'error');
    }
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }
};

// =====================
// COMMENT (STUDENT)
// =====================
const submitComment = async (id) => {
  const text = document.getElementById(`commentText-${id}`)?.value.trim();
  if (!text) {
    showToast('Comment cannot be empty.', 'warning');
    return;
  }
  try {
    const result = await apiAddComment(id, text);
    if (result.data && result.data.txHash) {
      showTxModal(result.data.txHash);
      showToast('Comment added to blockchain!', 'success');
      // Close and reopen to refresh
      const container = document.getElementById(`responses-${id}`);
      container.classList.add('d-none');
      setTimeout(() => toggleResponses(id), 600);
    } else {
      showToast(result.error || 'Error adding comment.', 'error');
    }
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }
};

// =====================
// ADMIN — RESPOND
// =====================
const handleAdminRespond = (id) => {
  const area = document.getElementById('adminActionArea');
  area.innerHTML = `
    <div class="card p-3 mt-3" style="border:1px solid #4f46e5;border-radius:10px;">
      <div class="d-flex align-items-center gap-2 mb-2">
        <i data-lucide="message-square" style="width:16px;height:16px;color:#4f46e5;"></i>
        <h6 class="mb-0 fw-semibold">Respond to Feedback #${id}</h6>
      </div>
      <textarea id="responseText" class="form-control mb-2" rows="3"
        placeholder="Write your official response..."></textarea>
      <div class="d-flex gap-2">
        <button class="btn btn-primary btn-sm d-flex align-items-center gap-2"
          onclick="submitAdminResponse(${id})">
          <i data-lucide="send" style="width:14px;height:14px;"></i>
          Submit Response
        </button>
        <button class="btn btn-outline-secondary btn-sm"
          onclick="document.getElementById('adminActionArea').innerHTML=''">
          Cancel
        </button>
      </div>
    </div>
  `;
  if (window.lucide) lucide.createIcons();
  area.scrollIntoView({ behavior: 'smooth' });
};

const submitAdminResponse = async (id) => {
  const responseText = document.getElementById('responseText')?.value.trim();
  if (!responseText) {
    showToast('Response cannot be empty.', 'warning');
    return;
  }
  try {
    const result = await apiAdminRespond(id, responseText);
    if (result.data && result.data.txHash) {
      showTxModal(result.data.txHash);
      showToast('Response submitted to blockchain!', 'success');
      renderAdminPanel();
    } else {
      showToast(result.error || 'Error submitting response.', 'error');
    }
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }
};

// =====================
// ADMIN — UPDATE STATUS
// =====================
const handleUpdateStatus = async (id, currentStatus) => {
  const nextStatus = { 'PENDING': 'REVIEWED', 'REVIEWED': 'RESOLVED' };
  const newStatus = nextStatus[currentStatus];

  if (!newStatus) {
    showToast('This feedback is already resolved.', 'info');
    return;
  }

  if (!confirm(`Update status from ${currentStatus} to ${newStatus}?`)) return;

  try {
    const result = await apiUpdateStatus(id, newStatus);
    if (result.data && result.data.txHash) {
      showTxModal(result.data.txHash);
      showToast(`Status updated to ${newStatus}!`, 'success');
      renderAdminPanel();
    } else {
      showToast(result.error || 'Error updating status.', 'error');
    }
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }
};

// =====================
// EVENT LISTENERS
// =====================
document.getElementById('connectBtn').addEventListener('click', connectWallet);
document.getElementById('disconnectBtn').addEventListener('click', disconnectWallet);

// =====================
// INIT
// =====================
renderDashboard();