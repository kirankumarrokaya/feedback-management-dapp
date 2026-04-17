const ADMIN_WALLET = process.env.ADMIN_WALLET_ADDRESS;

const checkAdmin = (req, res, next) => {
  const walletAddress = req.headers['wallet-address'];

  if (!walletAddress) {
    return res.status(401).json({ error: 'Wallet address required' });
  }

  if (walletAddress.toLowerCase() !== ADMIN_WALLET.toLowerCase()) {
    return res.status(403).json({ error: 'Unauthorized: Admin access only' });
  }

  next();
};

const checkWallet = (req, res, next) => {
  const walletAddress = req.headers['wallet-address'];

  if (!walletAddress) {
    return res.status(401).json({ error: 'Wallet address required' });
  }

  next();
};

module.exports = { checkAdmin, checkWallet };