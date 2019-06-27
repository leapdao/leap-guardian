const ethers = require('ethers');
const getRootNetworkProvider = require('./getRootNetworkProvider');

module.exports = async (params = {}) => {
  const nodeUrl = params.nodeUrl || process.env.NODE_URL || 'http://localhost:8645';
  const privKey = params.privKey || process.env.PRIV_KEY || '0x0000000000000000000ef2ef02e9911337f8758e93c801b619e5d178094486cc';
  console.log('Leap node: ', nodeUrl);
  const plasmaWallet = new ethers.Wallet(
    privKey, 
    new ethers.providers.JsonRpcProvider(nodeUrl),
  );
  const nodeConfig = await plasmaWallet.provider.send('plasma_getConfig', []);
  const rootWallet = new ethers.Wallet(
    privKey, 
    new ethers.providers.JsonRpcProvider(getRootNetworkProvider(nodeConfig)),
  );

  return { plasmaWallet, rootWallet, nodeConfig };
};