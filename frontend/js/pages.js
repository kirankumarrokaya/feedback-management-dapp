const renderDashboard = async () => {
  const container = document.getElementById('page-dashboard');
  container.innerHTML = `<div class="loading-spinner"><div class="spinner-border text-primary"></div></div>`;

  try {
    let stats = { total: 0, pending: 0, reviewed: 0, resolved: 0 };

    if (walletAddress) {
      if (userRole === 'admin') {
        // Admin gets stats directly from stats endpoint
        const result = await apiGetStats();
        stats = result.data || stats;
      } else {
        // Student calculates stats from getAllFeedback (public endpoint)
        const result = await apiGetAllFeedback();
        const feedbacks = result.data || [];
        stats = {
          total: feedbacks.length,
          pending: feedbacks.filter(f => f.status === 'PENDING').length,
          reviewed: feedbacks.filter(f => f.status === 'REVIEWED').length,
          resolved: feedbacks.filter(f => f.status === 'RESOLVED').length
        };
      }
    }

    container.innerHTML = `
      <h4 class="mb-4">📊 Dashboard Overview</h4>
      <div class="row g-4 mb-5">
        <div class="col-md-3">
          <div class="stat-card card-total">
            <p>Total Feedback</p>
            <h2>${stats.total}</h2>
          </div>
        </div>
        <div class="col-md-3">
          <div class="stat-card card-pending">
            <p>Pending</p>
            <h2>${stats.pending}</h2>
          </div>
        </div>
        <div class="col-md-3">
          <div class="stat-card card-reviewed">
            <p>Reviewed</p>
            <h2>${stats.reviewed}</h2>
          </div>
        </div>
        <div class="col-md-3">
          <div class="stat-card card-resolved">
            <p>Resolved</p>
            <h2>${stats.resolved}</h2>
          </div>
        </div>
      </div>
      ${!walletAddress
        ? '<div class="alert alert-warning">Connect your wallet to see full stats and submit feedback.</div>'
        : `<div class="alert alert-info">Connected as <strong>${userRole.toUpperCase()}</strong> — ${walletAddress.slice(0,6)}...${walletAddress.slice(-4)}</div>`
      }
    `;

  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Error loading dashboard: ${err.message}</div>`;
  }
};

const renderSubmitPage = () => {
  const container = document.getElementById('page-submit');

  if (!walletAddress) {
    container.innerHTML = `<div class="alert alert-warning">Please connect your wallet first.</div>`;
    return;
  }

  container.innerHTML = `
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow p-4">
          <h4 class="mb-4">📝 Submit Feedback</h4>
          <div class="mb-3">
            <label class="form-label">Category</label>
            <select id="categoryInput" class="form-select">
              <option value="TEACHING">Teaching</option>
              <option value="FACILITIES">Facilities</option>
              <option value="ADMIN">Admin</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Feedback</label>
            <textarea id="feedbackText" class="form-control" rows="4"
              placeholder="Write your feedback here..."></textarea>
          </div>
          <button onclick="handleSubmitFeedback()" class="btn btn-primary w-100">
            🚀 Submit to Blockchain
          </button>
          <div id="submitStatus" class="mt-3"></div>
        </div>
      </div>
    </div>
  `;
};

const renderViewPage = async () => {
  const container = document.getElementById('page-view');
  container.innerHTML = `<div class="loading-spinner"><div class="spinner-border text-primary"></div></div>`;

  try {
    const result = await apiGetAllFeedback();
    const feedbacks = result.data;

    if (feedbacks.length === 0) {
      container.innerHTML = `<div class="alert alert-info">No feedback submitted yet.</div>`;
      return;
    }

    const cards = feedbacks.map(f => `
      <div class="card feedback-card p-3">
        <div class="d-flex justify-content-between align-items-center">
          <span class="badge badge-${f.status} text-white">${f.status}</span>
          <span class="badge bg-secondary">${f.category}</span>
          <small class="text-muted">${new Date(f.timestamp).toLocaleDateString()}</small>
        </div>
        <p class="mt-2 mb-1">${f.text}</p>
        <small class="text-muted">By: ${f.submittedBy.slice(0,6)}...${f.submittedBy.slice(-4)}</small>
        ${f.response ? `<div class="alert alert-success mt-2 mb-0 small">💬 Response: ${f.response}</div>` : ''}
      </div>
    `).join('');

    container.innerHTML = `<h4 class="mb-4">📋 All Feedback</h4>${cards}`;

  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Error loading feedback: ${err.message}</div>`;
  }
};

const renderAdminPanel = async () => {
  const container = document.getElementById('page-admin');

  if (userRole !== 'admin') {
    container.innerHTML = `<div class="alert alert-danger">🔐 Admin access only.</div>`;
    return;
  }

  container.innerHTML = `<div class="loading-spinner"><div class="spinner-border text-primary"></div></div>`;

  try {
    const result = await apiGetAllFeedback();
    const feedbacks = result.data.filter(f => f.status !== 'RESOLVED');

    const rows = feedbacks.map(f => `
      <tr>
        <td>${f.id}</td>
        <td>${f.text}</td>
        <td><span class="badge bg-secondary">${f.category}</span></td>
        <td><span class="badge badge-${f.status} text-white">${f.status}</span></td>
        <td>
          <button class="btn btn-sm btn-primary me-1"
            onclick="handleRespond(${f.id})">💬 Respond</button>
          <button class="btn btn-sm btn-success"
            onclick="handleUpdateStatus(${f.id}, '${f.status}')">⬆️ Update</button>
        </td>
      </tr>
    `).join('');

    container.innerHTML = `
      <h4 class="mb-4">🔐 Admin Panel</h4>
      <table class="table table-bordered table-hover bg-white">
        <thead class="table-dark">
          <tr>
            <th>ID</th><th>Feedback</th><th>Category</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div id="adminActionArea"></div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`;
  }
};