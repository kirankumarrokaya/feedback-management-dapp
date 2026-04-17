const { ethers } = require('ethers');
const contractABI = require('./contractABI.json');
require('dotenv').config();

const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  contractABI,
  wallet
);

const readContract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  contractABI,
  provider
);

module.exports = { contract, readContract, provider };