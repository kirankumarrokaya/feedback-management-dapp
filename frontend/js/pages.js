// =====================
// FILTER STATE
// =====================
const filterState = {
  search: '',
  status: 'ALL',
  category: 'ALL',
  sort: 'NEWEST'
};

// =====================
// DASHBOARD PAGE
// =====================
const renderDashboard = async () => {
  const container = document.getElementById('page-dashboard');
  container.innerHTML = `<div class="loading-spinner"><div class="spinner-border text-primary"></div></div>`;

  try {
    const result = await apiGetStats();
    const stats = result.data || { total: 0, pending: 0, reviewed: 0, resolved: 0, topVoted: [], mostDownvoted: [] };

    const topVotedHTML = stats.topVoted && stats.topVoted.length > 0
      ? stats.topVoted.map(f => `
          <div class="d-flex justify-content-between align-items-center border-bottom py-2">
            <span class="text-truncate me-2">${f.text}</span>
            <span class="badge bg-success">+${f.voteScore}</span>
          </div>`).join('')
      : '<p class="text-muted small">No votes yet</p>';

    const mostDownvotedHTML = stats.mostDownvoted && stats.mostDownvoted.length > 0
      ? stats.mostDownvoted.map(f => `
          <div class="d-flex justify-content-between align-items-center border-bottom py-2">
            <span class="text-truncate me-2">${f.text}</span>
            <span class="badge bg-danger">${f.voteScore}</span>
          </div>`).join('')
      : '<p class="text-muted small">No votes yet</p>';

    container.innerHTML = `
      <h4 class="mb-4">📊 Dashboard Overview</h4>

      <!-- STAT CARDS -->
      <div class="row g-4 mb-4">
        <div class="col-md-3">
          <div class="stat-card card-total">
            <p>Total Feedback</p>
            <h2>${stats.total}</h2>
          </div>
        </div>
        <div class="col-md-3">
          <div class="stat-card card-pending">
            <p>⏳ Pending</p>
            <h2>${stats.pending}</h2>
          </div>
        </div>
        <div class="col-md-3">
          <div class="stat-card card-reviewed">
            <p>🔍 Reviewed</p>
            <h2>${stats.reviewed}</h2>
          </div>
        </div>
        <div class="col-md-3">
          <div class="stat-card card-resolved">
            <p>✅ Resolved</p>
            <h2>${stats.resolved}</h2>
          </div>
        </div>
      </div>

      <!-- TOP VOTED -->
      <div class="row g-4 mb-4">
        <div class="col-md-6">
          <div class="card p-3 shadow-sm">
            <h6 class="fw-bold mb-3">🏆 Top Voted Feedback</h6>
            ${topVotedHTML}
          </div>
        </div>
        <div class="col-md-6">
          <div class="card p-3 shadow-sm">
            <h6 class="fw-bold mb-3">👎 Most Downvoted Feedback</h6>
            ${mostDownvotedHTML}
          </div>
        </div>
      </div>

      ${!walletAddress
        ? '<div class="alert alert-warning">⚠️ Connect your wallet to submit feedback and vote.</div>'
        : `<div class="alert alert-info">✅ Connected as <strong>${userRole.toUpperCase()}</strong> — ${walletAddress.slice(0,6)}...${walletAddress.slice(-4)}</div>`
      }
    `;
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Error loading dashboard: ${err.message}</div>`;
  }
};

// =====================
// SUBMIT PAGE
// =====================
const renderSubmitPage = () => {
  const container = document.getElementById('page-submit');

  if (!walletAddress) {
    container.innerHTML = `<div class="alert alert-warning">⚠️ Please connect your wallet first.</div>`;
    return;
  }

  container.innerHTML = `
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow p-4">
          <h4 class="mb-4">📝 Submit Feedback</h4>
          <div class="mb-3">
            <label class="form-label fw-bold">Category</label>
            <select id="categoryInput" class="form-select">
              <option value="TEACHING">📚 Teaching</option>
              <option value="FACILITIES">🏫 Facilities</option>
              <option value="ADMIN">🏢 Admin</option>
              <option value="OTHER">💬 Other</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Your Feedback</label>
            <textarea id="feedbackText" class="form-control" rows="4"
              placeholder="Write your feedback here..."></textarea>
            <small class="text-muted">Your feedback will be stored permanently on the blockchain.</small>
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

// =====================
// VIEW FEEDBACK PAGE
// =====================
let allFeedbackCache = [];

const renderViewPage = async () => {
  const container = document.getElementById('page-view');
  container.innerHTML = `<div class="loading-spinner"><div class="spinner-border text-primary"></div></div>`;

  try {
    const result = await apiGetAllFeedback();
    allFeedbackCache = result.data || [];

    filterState.search = '';
    filterState.status = 'ALL';
    filterState.category = 'ALL';
    filterState.sort = 'NEWEST';
    window.currentFeedbackPage = 1;

    // Render full page structure ONCE
    container.innerHTML = `
      <div class="card p-3 mb-4 shadow-sm">
        <div class="row g-2 align-items-end">
          <div class="col-md-4">
            <label class="form-label fw-bold">🔍 Search</label>
            <input type="text" id="searchInput" class="form-control"
              placeholder="Search feedback..." oninput="applyFilters()"/>
          </div>
          <div class="col-md-2">
            <label class="form-label fw-bold">Status</label>
            <select id="statusFilter" class="form-select" onchange="applyFilters()">
              <option value="ALL">All</option>
              <option value="PENDING">⏳ Pending</option>
              <option value="REVIEWED">🔍 Reviewed</option>
              <option value="RESOLVED">✅ Resolved</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label fw-bold">Category</label>
            <select id="categoryFilter" class="form-select" onchange="applyFilters()">
              <option value="ALL">All</option>
              <option value="TEACHING">📚 Teaching</option>
              <option value="FACILITIES">🏫 Facilities</option>
              <option value="ADMIN">🏢 Admin</option>
              <option value="OTHER">💬 Other</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label fw-bold">Sort By</label>
            <select id="sortFilter" class="form-select" onchange="applyFilters()">
              <option value="NEWEST">Newest First</option>
              <option value="OLDEST">Oldest First</option>
              <option value="HIGHEST">Highest Score</option>
              <option value="LOWEST">Lowest Score</option>
              <option value="MOST_UPVOTED">Most Upvoted</option>
            </select>
          </div>
          <div class="col-md-2">
            <button class="btn btn-outline-secondary w-100" onclick="resetFilters()">
              🔄 Reset
            </button>
          </div>
        </div>
      </div>

      <!-- ONLY THIS PART GETS UPDATED ON FILTER -->
      <div id="feedbackListContainer"></div>
    `;

    // Render cards into the container
    renderFeedbackCards(allFeedbackCache);

  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`;
  }
};

// Only updates the cards — never touches filter bar
const renderFeedbackList = (feedbacks) => {
  renderFeedbackCards(feedbacks);
};

const renderFeedbackCards = (feedbacks) => {
  const container = document.getElementById('feedbackListContainer');
  if (!container) return;

  if (feedbacks.length === 0) {
    container.innerHTML = `<div class="alert alert-info">No feedback found.</div>`;
    return;
  }

  const page = window.currentFeedbackPage || 1;
  const perPage = 10;
  const totalPages = Math.ceil(feedbacks.length / perPage);
  const paginated = feedbacks.slice((page - 1) * perPage, page * perPage);

  const cards = paginated.map(f => `
    <div class="card feedback-card p-3 mb-3">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <div class="d-flex gap-2">
          <span class="badge text-white" style="background:${statusColor(f.status)}">${f.status}</span>
          <span class="badge bg-secondary">${f.category}</span>
        </div>
        <small class="text-muted">${new Date(f.timestamp).toLocaleDateString()}</small>
      </div>

      <p class="mb-1 fw-semibold">${f.text}</p>
      <small class="text-muted">By: ${f.submittedBy.slice(0,6)}...${f.submittedBy.slice(-4)}</small>

      <!-- VOTE SECTION -->
      <div class="d-flex align-items-center gap-3 mt-2">
        ${walletAddress && f.submittedBy.toLowerCase() === walletAddress.toLowerCase()
          ? `<span class="badge bg-secondary py-2">🚫 Your feedback</span>`
          : `
            <button class="btn btn-sm btn-outline-success" onclick="handleUpvote(${f.id})">
              👍 ${f.upvotes}
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="handleDownvote(${f.id})">
              👎 ${f.downvotes}
            </button>
          `
        }
        <span class="badge ${f.voteScore >= 0 ? 'bg-success' : 'bg-danger'}">
          Score: ${f.voteScore >= 0 ? '+' : ''}${f.voteScore}
        </span>
      </div>

      <!-- ACTION BUTTONS -->
<div class="d-flex gap-2 mt-2 flex-wrap">
  <button class="btn btn-sm btn-outline-primary" onclick="toggleResponses(${f.id})">
    💬 Responses ${f.responseCount > 0 ? `<span class="badge bg-primary ms-1">${f.responseCount}</span>` : ''}
  </button>
  <button class="btn btn-sm btn-outline-secondary" onclick="toggleHistory(${f.id})">
    🕐 Edit History
  </button>
  ${walletAddress && f.submittedBy.toLowerCase() === walletAddress.toLowerCase() && f.status === 'PENDING'
    ? `<button class="btn btn-sm btn-outline-warning" onclick="handleEditFeedback(${f.id}, \`${f.text}\`)">✏️ Edit</button>`
    : ''
  }
</div>

      <div id="responses-${f.id}" class="d-none mt-3"></div>
      <div id="history-${f.id}" class="d-none mt-3"></div>
    </div>
  `).join('');

  const pagination = totalPages > 1 ? `
    <div class="d-flex justify-content-center gap-2 mt-4">
      <button class="btn btn-outline-primary btn-sm"
        onclick="changePage(${page - 1})" ${page === 1 ? 'disabled' : ''}>← Previous</button>
      <span class="btn btn-light btn-sm">Page ${page} of ${totalPages}</span>
      <button class="btn btn-outline-primary btn-sm"
        onclick="changePage(${page + 1})" ${page === totalPages ? 'disabled' : ''}>Next →</button>
    </div>
  ` : '';

  container.innerHTML =
    `<h4 class="mb-3">📋 All Feedback (${feedbacks.length})</h4>` +
    cards + pagination;
};

// =====================
// FILTER & SORT
// =====================
const applyFilters = () => {
  // Save current filter values to state
  filterState.search = document.getElementById('searchInput')?.value.toLowerCase() || '';
  filterState.status = document.getElementById('statusFilter')?.value || 'ALL';
  filterState.category = document.getElementById('categoryFilter')?.value || 'ALL';
  filterState.sort = document.getElementById('sortFilter')?.value || 'NEWEST';

  let filtered = [...allFeedbackCache];

  if (filterState.search) {
    filtered = filtered.filter(f =>
      f.text.toLowerCase().includes(filterState.search)
    );
  }
  if (filterState.status !== 'ALL') {
    filtered = filtered.filter(f => f.status === filterState.status);
  }
  if (filterState.category !== 'ALL') {
    filtered = filtered.filter(f => f.category === filterState.category);
  }

  if (filterState.sort === 'NEWEST') filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  if (filterState.sort === 'OLDEST') filtered.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  if (filterState.sort === 'HIGHEST') filtered.sort((a, b) => b.voteScore - a.voteScore);
  if (filterState.sort === 'LOWEST') filtered.sort((a, b) => a.voteScore - b.voteScore);
  if (filterState.sort === 'MOST_UPVOTED') filtered.sort((a, b) => b.upvotes - a.upvotes);

  window.currentFeedbackPage = 1;
  renderFeedbackList(filtered);

  // Restore filter values after re-render
  restoreFilterValues();
};

const resetFilters = () => {
  // Reset state
  filterState.search = '';
  filterState.status = 'ALL';
  filterState.category = 'ALL';
  filterState.sort = 'NEWEST';

  window.currentFeedbackPage = 1;
  renderFeedbackList(allFeedbackCache);

  // Restore after re-render
  restoreFilterValues();
};

const restoreFilterValues = () => {
  const searchInput = document.getElementById('searchInput');
  const statusFilter = document.getElementById('statusFilter');
  const categoryFilter = document.getElementById('categoryFilter');
  const sortFilter = document.getElementById('sortFilter');

  if (searchInput) searchInput.value = filterState.search;
  if (statusFilter) statusFilter.value = filterState.status;
  if (categoryFilter) categoryFilter.value = filterState.category;
  if (sortFilter) sortFilter.value = filterState.sort;
};

const changePage = (page) => {
  window.currentFeedbackPage = page;
  applyFilters();
};

// =====================
// RESPONSES THREAD
// =====================
const toggleResponses = async (id) => {
  const container = document.getElementById(`responses-${id}`);

  if (!container.classList.contains('d-none')) {
    container.classList.add('d-none');
    return;
  }

  container.innerHTML = `<div class="spinner-border spinner-border-sm text-primary"></div>`;
  container.classList.remove('d-none');

  try {
    const result = await apiGetResponses(id);
    console.log('Responses result:', result); // debug line

    const responses = result.data || [];

    const responseList = responses.length === 0
      ? `<p class="text-muted small mb-2">No responses yet. Be the first!</p>`
      : responses.map((r, i) => `
          <div class="mb-2 p-2 rounded" style="background:#f8f9fa; border-left: 3px solid #4facfe">
            <div class="d-flex justify-content-between align-items-center">
              <small class="fw-bold text-primary">
                💬 #${i + 1} — ${r.adminWallet.slice(0,6)}...${r.adminWallet.slice(-4)}
              </small>
              <small class="text-muted">${new Date(r.timestamp).toLocaleDateString()}</small>
            </div>
            <p class="mb-0 small mt-1">${r.responseText}</p>
          </div>
        `).join('');

    const commentInput = walletAddress ? `
      <div class="mt-2 pt-2 border-top">
        <textarea id="commentText-${id}" class="form-control form-control-sm mb-1"
          rows="2" placeholder="Write a comment..."></textarea>
        <button class="btn btn-sm btn-outline-primary mt-1"
          onclick="submitComment(${id})">
          💬 Add Comment
        </button>
      </div>
    ` : `<small class="text-muted">Connect wallet to comment.</small>`;

    container.innerHTML = `
      <div class="border-start border-primary ps-3 mt-2">
        <p class="fw-bold small mb-2">
          💬 Responses & Comments
          <span class="badge bg-primary ms-1">${responses.length}</span>
        </p>
        ${responseList}
        ${commentInput}
      </div>
    `;

  } catch (err) {
    console.error('Toggle responses error:', err);
    container.innerHTML = `<div class="alert alert-danger small py-2">Error: ${err.message}</div>`;
  }
};

// =====================
// EDIT HISTORY TIMELINE
// =====================
const toggleHistory = async (id) => {
  const container = document.getElementById(`history-${id}`);
  if (!container.classList.contains('d-none')) {
    container.classList.add('d-none');
    return;
  }

  container.innerHTML = `<div class="spinner-border spinner-border-sm text-secondary"></div>`;
  container.classList.remove('d-none');

  try {
    const result = await apiGetEditHistory(id);
    const history = result.data || [];

    if (history.length === 0) {
      container.innerHTML = `<div class="alert alert-info small py-2">No edits made.</div>`;
      return;
    }

    container.innerHTML = `
      <div class="border-start border-warning ps-3">
        <p class="fw-bold small mb-2">🕐 Edit History Timeline:</p>
        ${history.map((h, i) => `
          <div class="mb-2 p-2 bg-light rounded">
            <small class="text-warning fw-bold">Edit #${i + 1} — ${new Date(h.timestamp).toLocaleDateString()}</small>
            <p class="mb-0 small text-danger mt-1">❌ Old: ${h.oldText}</p>
            <p class="mb-0 small text-success">✅ New: ${h.newText}</p>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger small py-2">Error loading history.</div>`;
  }
};

// =====================
// ADMIN PANEL
// =====================
const renderAdminPanel = async () => {
  const container = document.getElementById('page-admin');

  if (userRole !== 'admin') {
    container.innerHTML = `<div class="alert alert-danger">🔐 Admin access only.</div>`;
    return;
  }

  container.innerHTML = `<div class="loading-spinner"><div class="spinner-border text-primary"></div></div>`;

  try {
    const result = await apiGetAllFeedback();
    const feedbacks = result.data || [];
    const pending = feedbacks.filter(f => f.status === 'PENDING');
    const reviewed = feedbacks.filter(f => f.status === 'REVIEWED');

    const renderRows = (list) => list.map(f => `
      <tr>
        <td>${f.id}</td>
        <td>${f.text}</td>
        <td><span class="badge bg-secondary">${f.category}</span></td>
        <td>
          <span class="badge text-white" style="background:${statusColor(f.status)}">${f.status}</span>
        </td>
        <td>
          <span class="badge bg-success">👍 ${f.upvotes}</span>
          <span class="badge bg-danger">👎 ${f.downvotes}</span>
          <span class="badge bg-dark">Score: ${f.voteScore >= 0 ? '+' : ''}${f.voteScore}</span>
        </td>
        <td>
          <button class="btn btn-sm btn-primary me-1 mb-1"
            onclick="handleAdminRespond(${f.id})">💬 Respond</button>
          ${f.status !== 'RESOLVED'
            ? `<button class="btn btn-sm btn-success mb-1"
                onclick="handleUpdateStatus(${f.id}, '${f.status}')">⬆️ Update</button>`
            : '<span class="badge bg-secondary">Resolved</span>'
          }
        </td>
      </tr>
    `).join('');

    container.innerHTML = `
      <h4 class="mb-4">🔐 Admin Panel</h4>

      <!-- PENDING TAB -->
      <h6 class="text-danger fw-bold">⏳ Pending Feedback (${pending.length})</h6>
      <div class="table-responsive mb-4">
        <table class="table table-bordered table-hover bg-white">
          <thead class="table-dark">
            <tr><th>ID</th><th>Feedback</th><th>Category</th><th>Status</th><th>Votes</th><th>Actions</th></tr>
          </thead>
          <tbody>${pending.length > 0 ? renderRows(pending) : '<tr><td colspan="6" class="text-center text-muted">No pending feedback</td></tr>'}</tbody>
        </table>
      </div>

      <!-- REVIEWED TAB -->
      <h6 class="text-primary fw-bold">🔍 Reviewed Feedback (${reviewed.length})</h6>
      <div class="table-responsive mb-4">
        <table class="table table-bordered table-hover bg-white">
          <thead class="table-dark">
            <tr><th>ID</th><th>Feedback</th><th>Category</th><th>Status</th><th>Votes</th><th>Actions</th></tr>
          </thead>
          <tbody>${reviewed.length > 0 ? renderRows(reviewed) : '<tr><td colspan="6" class="text-center text-muted">No reviewed feedback</td></tr>'}</tbody>
        </table>
      </div>

      <div id="adminActionArea"></div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`;
  }
};

// =====================
// HELPER FUNCTIONS
// =====================
const statusColor = (status) => {
  if (status === 'PENDING') return '#f5576c';
  if (status === 'REVIEWED') return '#4facfe';
  if (status === 'RESOLVED') return '#43e97b';
  return '#6c757d';
};

const handleAdminRespond = (id) => {
  const area = document.getElementById('adminActionArea');
  area.innerHTML = `
    <div class="card p-3 mt-3 border-primary">
      <h6>💬 Respond to Feedback #${id}</h6>
      <textarea id="responseText" class="form-control mb-2" rows="3"
        placeholder="Write your response..."></textarea>
      <button class="btn btn-primary btn-sm" onclick="submitAdminResponse(${id})">
        Submit Response
      </button>
    </div>
  `;
  area.scrollIntoView({ behavior: 'smooth' });
};