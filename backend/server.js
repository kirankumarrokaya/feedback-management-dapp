const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const feedbackRoutes = require('./routes/feedbackRoutes');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(rateLimiter);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Feedback Management DApp API is running' });
});

// ✅ Admin check route — MUST be before feedbackRoutes
app.get('/api/auth/check-admin', (req, res) => {
  const walletAddress = req.headers['wallet-address'];
  if (!walletAddress) {
    return res.json({ isAdmin: false });
  }
  const isAdmin = walletAddress.toLowerCase() ===
    process.env.ADMIN_WALLET_ADDRESS.toLowerCase();
  res.json({ isAdmin });
});

// Feedback routes
app.use('/api/feedback', feedbackRoutes);

// Error Handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;