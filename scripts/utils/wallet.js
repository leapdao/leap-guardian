const ethers = require('ethers');

module.exports = () => {
  const nodeUrl = process.env.NODE_URL || 'http://localhost:8645';
  const privKey = process.env.PRIV_KEY;
  const plasma = new ethers.providers.JsonRpcProvider(nodeUrl);
  return new ethers.Wallet(privKey, plasma);
};