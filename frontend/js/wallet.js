let walletAddress = null;
let userRole = 'student';

const connectWallet = async () => {
  if (typeof window.ethereum === 'undefined') {
    alert('MetaMask is not installed. Please install MetaMask.');
    window.open('https://metamask.io/download', '_blank');
    return;
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    walletAddress = accounts[0];

    // Get wallet balance
    const balanceWei = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [walletAddress, 'latest']
    });
    const balanceETH = (parseInt(balanceWei, 16) / 1e18).toFixed(4);

    // ✅ Correct admin check
    const adminCheck = await fetch('http://localhost:5000/api/auth/check-admin', {
      headers: { 'wallet-address': walletAddress }
    });
    const adminResult = await adminCheck.json();
    userRole = adminResult.isAdmin ? 'admin' : 'student';

    updateWalletUI(walletAddress, balanceETH, userRole);
    loadCurrentPage();

  } catch (error) {
    alert('Wallet connection failed: ' + error.message);
  }
};

const disconnectWallet = () => {
  walletAddress = null;
  userRole = 'student';
  document.getElementById('walletDisplay').textContent = '';
  document.getElementById('balanceDisplay').textContent = '';
  document.getElementById('roleDisplay').textContent = '';
  document.getElementById('connectBtn').classList.remove('d-none');
  document.getElementById('disconnectBtn').classList.add('d-none');
  document.getElementById('adminTab').classList.add('d-none');
  showPage('dashboard');
};

const updateWalletUI = (address, balance, role) => {
  const short = `${address.slice(0, 6)}...${address.slice(-4)}`;
  document.getElementById('walletDisplay').textContent = short;
  document.getElementById('balanceDisplay').textContent = `${balance} ETH`;
  document.getElementById('roleDisplay').textContent = role.toUpperCase();
  document.getElementById('connectBtn').classList.add('d-none');
  document.getElementById('disconnectBtn').classList.remove('d-none');

  if (role === 'admin') {
    document.getElementById('adminTab').classList.remove('d-none');
  }
};

const showTxModal = (txHash) => {
  document.getElementById('txHashDisplay').textContent = txHash;
  document.getElementById('etherscanLink').href =
    `https://sepolia.etherscan.io/tx/${txHash}`;
  const modal = new bootstrap.Modal(document.getElementById('txModal'));
  modal.show();
};