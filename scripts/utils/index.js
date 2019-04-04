const NETWORKS = require('./networks');
const waitForBalanceChange = require('./waitForBalanceChange');

const getRootNetworkProvider = (nodeConfig) => {
  const network = NETWORKS[nodeConfig.rootNetworkId];
  if (network) return network.provider.http;
  return nodeConfig.rootNetwork;
};

module.exports = { getRootNetworkProvider, waitForBalanceChange };