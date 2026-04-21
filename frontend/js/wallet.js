let walletAddress = null;
let userRole = 'student';

// =====================
// CONNECT WALLET
// =====================
const connectWallet = async () => {
  if (typeof window.ethereum === 'undefined') {
    showToast('MetaMask is not installed. Redirecting to download...', 'warning');
    setTimeout(() => window.open('https://metamask.io/download', '_blank'), 1500);
    return;
  }

  const btn = document.getElementById('connectBtn');
  btn.disabled = true;
  btn.innerHTML = `
    <span class="spinner-border spinner-border-sm me-2"></span>
    Connecting...
  `;

  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    walletAddress = accounts[0];

    // Get wallet balance
    const balanceWei = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [walletAddress, 'latest']
    });
    const balanceETH = (parseInt(balanceWei, 16) / 1e18).toFixed(4);

    // Check admin role via backend
    const adminCheck = await fetch('http://localhost:5000/api/auth/check-admin', {
      headers: { 'wallet-address': walletAddress }
    });
    const adminResult = await adminCheck.json();
    userRole = adminResult.isAdmin ? 'admin' : 'student';

    updateWalletUI(walletAddress, balanceETH, userRole);
    showToast(`Connected as ${userRole.toUpperCase()}`, 'success');
    loadCurrentPage();

    // Listen for account changes
    window.ethereum.on('accountsChanged', handleAccountChanged);
    window.ethereum.on('chainChanged', () => window.location.reload());

  } catch (error) {
    showToast('Wallet connection failed: ' + error.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `
      <i data-lucide="wallet" style="width:15px;height:15px;"></i>
      Connect Wallet
    `;
    if (window.lucide) lucide.createIcons();
  }
};

// =====================
// HANDLE ACCOUNT SWITCH
// =====================
const handleAccountChanged = async (accounts) => {
  if (accounts.length === 0) {
    disconnectWallet();
    showToast('Wallet disconnected.', 'warning');
    return;
  }
  showToast('Account changed — reconnecting...', 'info');
  await connectWallet();
};

// =====================
// DISCONNECT WALLET
// =====================
const disconnectWallet = () => {
  walletAddress = null;
  userRole = 'student';

  // Remove listeners
  if (window.ethereum?.removeListener) {
    window.ethereum.removeListener('accountsChanged', handleAccountChanged);
  }

  // Reset UI fields
  document.getElementById('walletDisplay').textContent  = '';
  document.getElementById('balanceDisplay').textContent = '';
  document.getElementById('roleDisplay').textContent    = '';

  document.getElementById('connectBtn').classList.remove('d-none');
  document.getElementById('disconnectBtn').classList.add('d-none');
  document.getElementById('adminTab').classList.add('d-none');

  showToast('Wallet disconnected.', 'info');
  showPage('dashboard');
};

// =====================
// UPDATE WALLET UI
// =====================
const updateWalletUI = (address, balance, role) => {
  const short = `${address.slice(0, 6)}...${address.slice(-4)}`;

  document.getElementById('walletDisplay').innerHTML = `
    <i data-lucide="wallet" style="width:13px;height:13px;display:inline;margin-right:4px;"></i>
    ${short}
  `;

  document.getElementById('balanceDisplay').innerHTML = `
    <i data-lucide="coins" style="width:13px;height:13px;display:inline;margin-right:4px;"></i>
    ${balance} ETH
  `;

  document.getElementById('roleDisplay').innerHTML = `
    <span class="badge ${role === 'admin' ? 'bg-danger' : 'bg-primary'} d-inline-flex align-items-center gap-1">
      <i data-lucide="${role === 'admin' ? 'shield-check' : 'user'}"
        style="width:11px;height:11px;"></i>
      ${role.toUpperCase()}
    </span>
  `;

  document.getElementById('connectBtn').classList.add('d-none');
  document.getElementById('disconnectBtn').classList.remove('d-none');

  if (role === 'admin') {
    document.getElementById('adminTab').classList.remove('d-none');
  }

  if (window.lucide) lucide.createIcons();
};

// =====================
// TX CONFIRMATION MODAL
// =====================
const showTxModal = (txHash) => {
  const display = document.getElementById('txHashDisplay');
  const link    = document.getElementById('etherscanLink');

  // Truncated display but full hash in link
  display.textContent = `${txHash.slice(0, 16)}...${txHash.slice(-10)}`;
  display.title = txHash; // show full on hover

  link.href = `https://sepolia.etherscan.io/tx/${txHash}`;
  link.innerHTML = `
    <i data-lucide="external-link" style="width:14px;height:14px;display:inline;margin-right:4px;"></i>
    View on Etherscan
  `;

  const modal = new bootstrap.Modal(document.getElementById('txModal'));
  modal.show();
  if (window.lucide) lucide.createIcons();
};

// =====================
// TOAST NOTIFICATION
// =====================
const showToast = (message, type = 'info') => {
  const colorMap = {
    success: '#10b981',
    error:   '#ef4444',
    warning: '#f59e0b',
    info:    '#4f46e5'
  };
  const iconMap = {
    success: 'check-circle-2',
    error:   'x-circle',
    warning: 'alert-triangle',
    info:    'info'
  };

  // Remove any existing toast
  const existing = document.getElementById('globalToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'globalToast';
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 9999;
    background: ${colorMap[type] || colorMap.info};
    color: #fff;
    padding: 12px 20px;
    border-radius: 10px;
    font-size: 0.875rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.18);
    animation: slideInToast 0.3s ease;
    max-width: 340px;
  `;

  toast.innerHTML = `
    <i data-lucide="${iconMap[type] || 'info'}" style="width:18px;height:18px;flex-shrink:0;"></i>
    <span>${message}</span>
  `;

  // Inject animation keyframes once
  if (!document.getElementById('toastStyle')) {
    const style = document.createElement('style');
    style.id = 'toastStyle';
    style.textContent = `
      @keyframes slideInToast {
        from { transform: translateY(30px); opacity: 0; }
        to   { transform: translateY(0);    opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);
  if (window.lucide) lucide.createIcons();

  // Auto-dismiss after 3.5s
  setTimeout(() => {
    toast.style.transition = 'opacity 0.4s ease';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
};