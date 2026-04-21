// =====================
// FILTER STATE
// =====================
const filterState = {
  search: '',
  status: 'ALL',
  category: 'ALL',
  sort: 'NEWEST'
};

let allFeedbackCache = [];

// =====================
// DASHBOARD PAGE
// =====================
const renderDashboard = async () => {
  const container = document.getElementById('page-dashboard');
  container.innerHTML = `
    <div class="loading-spinner">
      <div class="spinner-border text-primary"></div>
    </div>`;

  try {
    const result = await apiGetStats();
    const stats = result.data || { total: 0, pending: 0, reviewed: 0, resolved: 0, topVoted: [], mostDownvoted: [] };

    const topVotedHTML = stats.topVoted && stats.topVoted.length > 0
      ? stats.topVoted.map(f => `
          <div class="d-flex justify-content-between align-items-center border-bottom py-2">
            <span class="text-truncate me-2 small">${f.text}</span>
            <span class="badge bg-success">+${f.voteScore}</span>
          </div>`).join('')
      : '<p class="text-muted small mb-0">No votes yet</p>';

    const mostDownvotedHTML = stats.mostDownvoted && stats.mostDownvoted.length > 0
      ? stats.mostDownvoted.map(f => `
          <div class="d-flex justify-content-between align-items-center border-bottom py-2">
            <span class="text-truncate me-2 small">${f.text}</span>
            <span class="badge bg-danger">${f.voteScore}</span>
          </div>`).join('')
      : '<p class="text-muted small mb-0">No votes yet</p>';

    container.innerHTML = `

      <!-- STAT CARDS -->
      <div class="row g-4 mb-4">
        <div class="col-md-3">
          <div class="stat-card card-total">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <p class="mb-1 opacity-75">Total Feedback</p>
                <h2 class="mb-0">${stats.total}</h2>
              </div>
              <i data-lucide="message-square" style="width:32px;height:32px;opacity:0.7;"></i>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="stat-card card-pending">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <p class="mb-1 opacity-75">Pending</p>
                <h2 class="mb-0">${stats.pending}</h2>
              </div>
              <i data-lucide="clock" style="width:32px;height:32px;opacity:0.7;"></i>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="stat-card card-reviewed">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <p class="mb-1 opacity-75">Reviewed</p>
                <h2 class="mb-0">${stats.reviewed}</h2>
              </div>
              <i data-lucide="eye" style="width:32px;height:32px;opacity:0.7;"></i>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="stat-card card-resolved">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <p class="mb-1 opacity-75">Resolved</p>
                <h2 class="mb-0">${stats.resolved}</h2>
              </div>
              <i data-lucide="check-circle-2" style="width:32px;height:32px;opacity:0.7;"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- TOP VOTED -->
      <div class="row g-4 mb-4">
        <div class="col-md-6">
          <div class="card p-3 shadow-sm h-100">
            <div class="d-flex align-items-center gap-2 mb-3">
              <i data-lucide="trending-up" style="width:18px;height:18px;color:#10b981;"></i>
              <h6 class="fw-bold mb-0">Top Voted Feedback</h6>
            </div>
            ${topVotedHTML}
          </div>
        </div>
        <div class="col-md-6">
          <div class="card p-3 shadow-sm h-100">
            <div class="d-flex align-items-center gap-2 mb-3">
              <i data-lucide="trending-down" style="width:18px;height:18px;color:#ef4444;"></i>
              <h6 class="fw-bold mb-0">Most Downvoted Feedback</h6>
            </div>
            ${mostDownvotedHTML}
          </div>
        </div>
      </div>

      ${!walletAddress
        ? `<div class="alert alert-warning d-flex align-items-center gap-2">
            <i data-lucide="alert-triangle" style="width:18px;height:18px;"></i>
            Connect your wallet to submit feedback and vote.
           </div>`
        : `<div class="alert alert-info d-flex align-items-center gap-2">
            <i data-lucide="info" style="width:18px;height:18px;"></i>
            Connected as <strong class="ms-1">${userRole.toUpperCase()}</strong>
            <span class="ms-1 text-muted">— ${walletAddress.slice(0,6)}...${walletAddress.slice(-4)}</span>
           </div>`
      }
    `;
    if (window.lucide) lucide.createIcons();
  } catch (err) {
    container.innerHTML = `
      <div class="alert alert-danger d-flex align-items-center gap-2">
        <i data-lucide="x-circle" style="width:18px;height:18px;"></i>
        Error loading dashboard: ${err.message}
      </div>`;
    if (window.lucide) lucide.createIcons();
  }
};

// =====================
// SUBMIT PAGE
// =====================
const renderSubmitPage = () => {
  const container = document.getElementById('page-submit');

  if (!walletAddress) {
    container.innerHTML = `
      <div class="alert alert-warning d-flex align-items-center gap-2">
        <i data-lucide="alert-triangle" style="width:18px;height:18px;"></i>
        Please connect your wallet first.
      </div>`;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = `
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow-sm p-4" style="border-radius:14px;">
          <div class="d-flex align-items-center gap-2 mb-4">
            <i data-lucide="plus-circle" style="width:22px;height:22px;color:#4f46e5;"></i>
            <h5 class="mb-0 fw-bold">Submit Feedback</h5>
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold">Category</label>
            <select id="categoryInput" class="form-select">
              <option value="TEACHING">Teaching</option>
              <option value="FACILITIES">Facilities</option>
              <option value="ADMIN">Administration</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold">Your Feedback</label>
            <textarea id="feedbackText" class="form-control" rows="4"
              placeholder="Write your feedback here..."></textarea>
            <small class="text-muted d-flex align-items-center gap-1 mt-1">
              <i data-lucide="lock" style="width:12px;height:12px;"></i>
              Stored permanently and immutably on the blockchain.
            </small>
          </div>

          <button id="submitBtn" onclick="handleSubmitFeedback()"
            class="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2">
            <i data-lucide="send" style="width:16px;height:16px;"></i>
            Submit to Blockchain
          </button>
          <div id="submitStatus" class="mt-3"></div>
        </div>
      </div>
    </div>
  `;
  if (window.lucide) lucide.createIcons();
};

// =====================
// VIEW FEEDBACK PAGE
// =====================
const renderViewPage = async () => {
  const container = document.getElementById('page-view');
  container.innerHTML = `
    <div class="loading-spinner">
      <div class="spinner-border text-primary"></div>
    </div>`;

  try {
    const result = await apiGetAllFeedback();
    allFeedbackCache = result.data || [];

    filterState.search = '';
    filterState.status = 'ALL';
    filterState.category = 'ALL';
    filterState.sort = 'NEWEST';
    window.currentFeedbackPage = 1;

    container.innerHTML = `
      <!-- FILTER BAR — rendered once, never replaced -->
      <div class="card p-3 mb-4 shadow-sm" style="border-radius:12px;">
        <div class="row g-2 align-items-end">
          <div class="col-md-4">
            <label class="form-label fw-semibold small">
              <i data-lucide="search" style="width:14px;height:14px;display:inline;margin-right:4px;"></i>Search
            </label>
            <input type="text" id="searchInput" class="form-control"
              placeholder="Search feedback..." oninput="applyFilters()"/>
          </div>
          <div class="col-md-2">
            <label class="form-label fw-semibold small">Status</label>
            <select id="statusFilter" class="form-select" onchange="applyFilters()">
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="REVIEWED">Reviewed</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label fw-semibold small">Category</label>
            <select id="categoryFilter" class="form-select" onchange="applyFilters()">
              <option value="ALL">All Categories</option>
              <option value="TEACHING">Teaching</option>
              <option value="FACILITIES">Facilities</option>
              <option value="ADMIN">Admin</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label fw-semibold small">Sort By</label>
            <select id="sortFilter" class="form-select" onchange="applyFilters()">
              <option value="NEWEST">Newest First</option>
              <option value="OLDEST">Oldest First</option>
              <option value="HIGHEST">Highest Score</option>
              <option value="LOWEST">Lowest Score</option>
              <option value="MOST_UPVOTED">Most Upvoted</option>
            </select>
          </div>
          <div class="col-md-2">
            <button class="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2"
              onclick="resetFilters()">
              <i data-lucide="rotate-ccw" style="width:14px;height:14px;"></i>
              Reset
            </button>
          </div>
        </div>
      </div>

      <!-- ONLY CARDS UPDATE ON FILTER -->
      <div id="feedbackListContainer"></div>
    `;

    if (window.lucide) lucide.createIcons();
    renderFeedbackCards(allFeedbackCache);

  } catch (err) {
    container.innerHTML = `
      <div class="alert alert-danger d-flex align-items-center gap-2">
        <i data-lucide="x-circle" style="width:18px;height:18px;"></i>
        Error loading feedback: ${err.message}
      </div>`;
    if (window.lucide) lucide.createIcons();
  }
};

const renderFeedbackList = (feedbacks) => {
  renderFeedbackCards(feedbacks);
};

const renderFeedbackCards = (feedbacks) => {
  const container = document.getElementById('feedbackListContainer');
  if (!container) return;

  if (feedbacks.length === 0) {
    container.innerHTML = `
      <div class="alert alert-info d-flex align-items-center gap-2">
        <i data-lucide="info" style="width:18px;height:18px;"></i>
        No feedback found matching your filters.
      </div>`;
    if (window.lucide) lucide.createIcons();
    return;
  }

  const page = window.currentFeedbackPage || 1;
  const perPage = 10;
  const totalPages = Math.ceil(feedbacks.length / perPage);
  const paginated = feedbacks.slice((page - 1) * perPage, page * perPage);

  const cards = paginated.map(f => `
    <div class="card feedback-card p-3 mb-3" style="border-radius:12px;">

      <!-- HEADER ROW -->
      <div class="d-flex justify-content-between align-items-center mb-2">
        <div class="d-flex gap-2 align-items-center">
          <span class="badge text-white" style="background:${statusColor(f.status)};font-size:0.72rem;">
            ${statusIcon(f.status)} ${f.status}
          </span>
          <span class="badge bg-secondary" style="font-size:0.72rem;">${f.category}</span>
        </div>
        <small class="text-muted d-flex align-items-center gap-1">
          <i data-lucide="calendar" style="width:12px;height:12px;"></i>
          ${new Date(f.timestamp).toLocaleDateString()}
        </small>
      </div>

      <!-- FEEDBACK TEXT -->
      <p class="mb-1 fw-semibold">${f.text}</p>
      <small class="text-muted d-flex align-items-center gap-1">
        <i data-lucide="user" style="width:12px;height:12px;"></i>
        ${f.submittedBy.slice(0,6)}...${f.submittedBy.slice(-4)}
      </small>

      <!-- VOTE SECTION -->
      <div class="d-flex align-items-center gap-3 mt-2">
        ${walletAddress && f.submittedBy.toLowerCase() === walletAddress.toLowerCase()
          ? `<span class="badge bg-secondary py-2 d-flex align-items-center gap-1">
               <i data-lucide="lock" style="width:12px;height:12px;"></i> Your feedback
             </span>`
          : `<button class="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
               onclick="handleUpvote(${f.id})">
               <i data-lucide="thumbs-up" style="width:14px;height:14px;"></i> ${f.upvotes}
             </button>
             <button class="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
               onclick="handleDownvote(${f.id})">
               <i data-lucide="thumbs-down" style="width:14px;height:14px;"></i> ${f.downvotes}
             </button>`
        }
        <span class="badge ${f.voteScore >= 0 ? 'bg-success' : 'bg-danger'} d-flex align-items-center gap-1">
          <i data-lucide="bar-chart-2" style="width:12px;height:12px;"></i>
          Score: ${f.voteScore >= 0 ? '+' : ''}${f.voteScore}
        </span>
      </div>

      <!-- ACTION BUTTONS -->
      <div class="d-flex gap-2 mt-2 flex-wrap">
        <button class="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
          onclick="toggleResponses(${f.id})">
          <i data-lucide="message-circle" style="width:14px;height:14px;"></i>
          Responses
          ${f.responseCount > 0
            ? `<span class="badge bg-primary ms-1">${f.responseCount}</span>`
            : ''}
        </button>
        <button class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
          onclick="toggleHistory(${f.id})">
          <i data-lucide="history" style="width:14px;height:14px;"></i>
          Edit History
        </button>
        ${walletAddress && f.submittedBy.toLowerCase() === walletAddress.toLowerCase() && f.status === 'PENDING'
          ? `<button class="btn btn-sm btn-outline-warning d-flex align-items-center gap-1"
               onclick="handleEditFeedback(${f.id}, \`${f.text}\`)">
               <i data-lucide="pencil" style="width:14px;height:14px;"></i>
               Edit
             </button>`
          : ''
        }
      </div>

      <div id="responses-${f.id}" class="d-none mt-3"></div>
      <div id="history-${f.id}" class="d-none mt-3"></div>
    </div>
  `).join('');

  const pagination = totalPages > 1 ? `
    <div class="d-flex justify-content-center align-items-center gap-2 mt-4">
      <button class="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
        onclick="changePage(${page - 1})" ${page === 1 ? 'disabled' : ''}>
        <i data-lucide="chevron-left" style="width:14px;height:14px;"></i> Previous
      </button>
      <span class="btn btn-light btn-sm">Page ${page} of ${totalPages}</span>
      <button class="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
        onclick="changePage(${page + 1})" ${page === totalPages ? 'disabled' : ''}>
        Next <i data-lucide="chevron-right" style="width:14px;height:14px;"></i>
      </button>
    </div>
  ` : '';

  container.innerHTML =
    `<h5 class="mb-3 fw-semibold">All Feedback
       <span class="badge bg-secondary ms-2" style="font-size:0.8rem;">${feedbacks.length}</span>
     </h5>` + cards + pagination;

  if (window.lucide) lucide.createIcons();
};

// =====================
// FILTER & SORT
// =====================
const applyFilters = () => {
  filterState.search   = document.getElementById('searchInput')?.value.toLowerCase() || '';
  filterState.status   = document.getElementById('statusFilter')?.value || 'ALL';
  filterState.category = document.getElementById('categoryFilter')?.value || 'ALL';
  filterState.sort     = document.getElementById('sortFilter')?.value || 'NEWEST';

  let filtered = [...allFeedbackCache];

  if (filterState.search)
    filtered = filtered.filter(f => f.text.toLowerCase().includes(filterState.search));
  if (filterState.status !== 'ALL')
    filtered = filtered.filter(f => f.status === filterState.status);
  if (filterState.category !== 'ALL')
    filtered = filtered.filter(f => f.category === filterState.category);

  if (filterState.sort === 'NEWEST')       filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  if (filterState.sort === 'OLDEST')       filtered.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  if (filterState.sort === 'HIGHEST')      filtered.sort((a, b) => b.voteScore - a.voteScore);
  if (filterState.sort === 'LOWEST')       filtered.sort((a, b) => a.voteScore - b.voteScore);
  if (filterState.sort === 'MOST_UPVOTED') filtered.sort((a, b) => b.upvotes - a.upvotes);

  window.currentFeedbackPage = 1;
  renderFeedbackCards(filtered);
  restoreFilterValues();
};

const resetFilters = () => {
  filterState.search = '';
  filterState.status = 'ALL';
  filterState.category = 'ALL';
  filterState.sort = 'NEWEST';
  window.currentFeedbackPage = 1;
  renderFeedbackCards(allFeedbackCache);
  restoreFilterValues();
};

const restoreFilterValues = () => {
  const s = document.getElementById('searchInput');
  const st = document.getElementById('statusFilter');
  const c = document.getElementById('categoryFilter');
  const so = document.getElementById('sortFilter');
  if (s)  s.value  = filterState.search;
  if (st) st.value = filterState.status;
  if (c)  c.value  = filterState.category;
  if (so) so.value = filterState.sort;
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
    const responses = result.data || [];

    const responseList = responses.length === 0
      ? `<p class="text-muted small mb-2">No responses yet. Be the first!</p>`
      : responses.map((r, i) => `
          <div class="mb-2 p-2 rounded" style="background:#f8f9fa;border-left:3px solid #4f46e5;">
            <div class="d-flex justify-content-between align-items-center">
              <small class="fw-bold text-primary d-flex align-items-center gap-1">
                <i data-lucide="user-circle" style="width:13px;height:13px;"></i>
                #${i + 1} — ${r.adminWallet.slice(0,6)}...${r.adminWallet.slice(-4)}
              </small>
              <small class="text-muted">${new Date(r.timestamp).toLocaleDateString()}</small>
            </div>
            <p class="mb-0 small mt-1">${r.responseText}</p>
          </div>`).join('');

    const commentInput = walletAddress ? `
      <div class="mt-2 pt-2 border-top">
        <textarea id="commentText-${id}" class="form-control form-control-sm mb-1"
          rows="2" placeholder="Write a comment..."></textarea>
        <button class="btn btn-sm btn-outline-primary mt-1 d-flex align-items-center gap-1"
          onclick="submitComment(${id})">
          <i data-lucide="send" style="width:13px;height:13px;"></i>
          Add Comment
        </button>
      </div>` : `<small class="text-muted">Connect wallet to comment.</small>`;

    container.innerHTML = `
      <div class="border-start border-primary ps-3 mt-2">
        <p class="fw-semibold small mb-2 d-flex align-items-center gap-1">
          <i data-lucide="message-circle" style="width:14px;height:14px;color:#4f46e5;"></i>
          Responses &amp; Comments
          <span class="badge bg-primary ms-1">${responses.length}</span>
        </p>
        ${responseList}
        ${commentInput}
      </div>`;
    if (window.lucide) lucide.createIcons();

  } catch (err) {
    container.innerHTML = `
      <div class="alert alert-danger small py-2 d-flex align-items-center gap-2">
        <i data-lucide="x-circle" style="width:14px;height:14px;"></i>
        Error loading responses: ${err.message}
      </div>`;
    if (window.lucide) lucide.createIcons();
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
      container.innerHTML = `
        <div class="alert alert-info small py-2 d-flex align-items-center gap-2">
          <i data-lucide="info" style="width:14px;height:14px;"></i>
          No edits have been made to this feedback.
        </div>`;
      if (window.lucide) lucide.createIcons();
      return;
    }

    container.innerHTML = `
      <div class="border-start border-warning ps-3">
        <p class="fw-semibold small mb-2 d-flex align-items-center gap-1">
          <i data-lucide="history" style="width:14px;height:14px;color:#f59e0b;"></i>
          Edit History Timeline
        </p>
        ${history.map((h, i) => `
          <div class="mb-2 p-2 bg-light rounded">
            <small class="fw-bold text-warning d-flex align-items-center gap-1">
              <i data-lucide="git-commit" style="width:12px;height:12px;"></i>
              Edit #${i + 1} — ${new Date(h.timestamp).toLocaleDateString()}
            </small>
            <p class="mb-0 small text-danger mt-1 d-flex align-items-center gap-1">
              <i data-lucide="x" style="width:12px;height:12px;"></i>
              Old: ${h.oldText}
            </p>
            <p class="mb-0 small text-success d-flex align-items-center gap-1">
              <i data-lucide="check" style="width:12px;height:12px;"></i>
              New: ${h.newText}
            </p>
          </div>`).join('')}
      </div>`;
    if (window.lucide) lucide.createIcons();

  } catch (err) {
    container.innerHTML = `
      <div class="alert alert-danger small py-2 d-flex align-items-center gap-2">
        <i data-lucide="x-circle" style="width:14px;height:14px;"></i>
        Error loading history.
      </div>`;
    if (window.lucide) lucide.createIcons();
  }
};

// =====================
// ADMIN PANEL
// =====================
const renderAdminPanel = async () => {
  const container = document.getElementById('page-admin');

  if (userRole !== 'admin') {
    container.innerHTML = `
      <div class="alert alert-danger d-flex align-items-center gap-2">
        <i data-lucide="shield-off" style="width:18px;height:18px;"></i>
        Admin access only. Please connect with the admin wallet.
      </div>`;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = `
    <div class="loading-spinner">
      <div class="spinner-border text-primary"></div>
    </div>`;

  try {
    const result = await apiGetAllFeedback();
    const feedbacks = result.data || [];
    const pending  = feedbacks.filter(f => f.status === 'PENDING');
    const reviewed = feedbacks.filter(f => f.status === 'REVIEWED');

    const renderRows = (list) => list.map(f => `
      <tr>
        <td class="fw-semibold">#${f.id}</td>
        <td>${f.text}</td>
        <td><span class="badge bg-secondary">${f.category}</span></td>
        <td>
          <span class="badge text-white" style="background:${statusColor(f.status)};">
            ${statusIcon(f.status)} ${f.status}
          </span>
        </td>
        <td>
          <span class="badge bg-success d-inline-flex align-items-center gap-1">
            <i data-lucide="thumbs-up" style="width:11px;height:11px;"></i>${f.upvotes}
          </span>
          <span class="badge bg-danger d-inline-flex align-items-center gap-1 ms-1">
            <i data-lucide="thumbs-down" style="width:11px;height:11px;"></i>${f.downvotes}
          </span>
          <span class="badge bg-dark ms-1">
            ${f.voteScore >= 0 ? '+' : ''}${f.voteScore}
          </span>
        </td>
        <td>
          <button class="btn btn-sm btn-primary me-1 mb-1 d-inline-flex align-items-center gap-1"
            onclick="handleAdminRespond(${f.id})">
            <i data-lucide="message-square" style="width:13px;height:13px;"></i>
            Respond
          </button>
          ${f.status !== 'RESOLVED'
            ? `<button class="btn btn-sm btn-success mb-1 d-inline-flex align-items-center gap-1"
                onclick="handleUpdateStatus(${f.id}, '${f.status}')">
                <i data-lucide="arrow-up-circle" style="width:13px;height:13px;"></i>
                Update
               </button>`
            : `<span class="badge bg-success d-inline-flex align-items-center gap-1">
                 <i data-lucide="check-circle-2" style="width:11px;height:11px;"></i>Resolved
               </span>`
          }
        </td>
      </tr>`).join('');

    container.innerHTML = `
      <div class="d-flex align-items-center gap-2 mb-4">
        <i data-lucide="shield-check" style="width:22px;height:22px;color:#4f46e5;"></i>
        <h5 class="mb-0 fw-bold">Admin Panel</h5>
      </div>

      <div class="d-flex align-items-center gap-2 mb-2">
        <i data-lucide="clock" style="width:16px;height:16px;color:#ef4444;"></i>
        <h6 class="mb-0 fw-bold text-danger">Pending Feedback (${pending.length})</h6>
      </div>
      <div class="table-responsive mb-4">
        <table class="table table-bordered table-hover bg-white">
          <thead class="table-dark">
            <tr>
              <th>ID</th><th>Feedback</th><th>Category</th>
              <th>Status</th><th>Votes</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${pending.length > 0
              ? renderRows(pending)
              : '<tr><td colspan="6" class="text-center text-muted py-3">No pending feedback</td></tr>'}
          </tbody>
        </table>
      </div>

      <div class="d-flex align-items-center gap-2 mb-2">
        <i data-lucide="eye" style="width:16px;height:16px;color:#4f46e5;"></i>
        <h6 class="mb-0 fw-bold text-primary">Reviewed Feedback (${reviewed.length})</h6>
      </div>
      <div class="table-responsive mb-4">
        <table class="table table-bordered table-hover bg-white">
          <thead class="table-dark">
            <tr>
              <th>ID</th><th>Feedback</th><th>Category</th>
              <th>Status</th><th>Votes</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${reviewed.length > 0
              ? renderRows(reviewed)
              : '<tr><td colspan="6" class="text-center text-muted py-3">No reviewed feedback</td></tr>'}
          </tbody>
        </table>
      </div>

      <div id="adminActionArea"></div>
    `;
    if (window.lucide) lucide.createIcons();

  } catch (err) {
    container.innerHTML = `
      <div class="alert alert-danger d-flex align-items-center gap-2">
        <i data-lucide="x-circle" style="width:18px;height:18px;"></i>
        Error loading admin panel: ${err.message}
      </div>`;
    if (window.lucide) lucide.createIcons();
  }
};

// =====================
// HELPERS
// =====================
const statusColor = (status) => {
  if (status === 'PENDING')  return '#f5576c';
  if (status === 'REVIEWED') return '#4f46e5';
  if (status === 'RESOLVED') return '#10b981';
  return '#6c757d';
};

const statusIcon = (status) => {
  if (status === 'PENDING')  return '<i data-lucide="clock"          style="width:11px;height:11px;display:inline;margin-right:3px;"></i>';
  if (status === 'REVIEWED') return '<i data-lucide="eye"            style="width:11px;height:11px;display:inline;margin-right:3px;"></i>';
  if (status === 'RESOLVED') return '<i data-lucide="check-circle-2" style="width:11px;height:11px;display:inline;margin-right:3px;"></i>';
  return '';
};