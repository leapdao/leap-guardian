const NETWORKS = require('./networks');

module.exports = (nodeConfig) => {
  const network = NETWORKS[nodeConfig.rootNetworkId];
  if (network) return network.provider.http;
  return nodeConfig.rootNetwork;
};