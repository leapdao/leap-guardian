/**
 * Copyright (c) 2019-present, Leap DAO (leapdao.org)
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

const ethers = require('ethers');

const BRIDGE_ABI = require('./../abis/bridgeAbi');
const NODE_URL = process.env.NODE_URL || 'https://mainnet-node1.leapdao.org';
const provider = new ethers.providers.JsonRpcProvider(NODE_URL);

let currentBlockNumber = 0;

async function onNewHeight(height, root, tx) {
  const blocksPassed = currentBlockNumber - tx.blockNumber;
  const minutesPassed = ((blocksPassed * 16) / 60).toFixed(1);

  console.log(`Ethereum block: ${tx.blockNumber} (~${minutesPassed} minutes ago) height: ${height.toString()} root: ${root}`);
}

async function run() {
  const config = await provider.send('plasma_getConfig', []);
  console.log(config);

  const bridge = new ethers.Contract(config.bridgeAddr, BRIDGE_ABI, new ethers.providers.JsonRpcProvider(config.rootNetwork));
  const tipHash = await bridge.tipHash();

  bridge.on(bridge.filters.NewHeight(), onNewHeight);
  currentBlockNumber = await bridge.provider.getBlockNumber();

  console.log(`tipHash: ${tipHash}`);
  console.log('fetching events since genesis...');
  bridge.provider.resetEventsBlock(await bridge.genesisBlockNumber());
}

run();
