#!/usr/bin/env node

/**
 * Copyright (c) 2019-present, Leap DAO (leapdao.org)
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

 /**
 * Watch for and print new periods on the root chain.
 * 
 * NODE_URL - JSON RPC endpoint of the Leap node
 * 
 * Example: NNODE_URL=http://localhost:8645 node scripts/printPeriods
 */

const ethers = require('ethers');

const OPERATOR_ABI = require('./../abis/operatorAbi');
const BRIDGE_ABI = require('./../abis/bridgeAbi');
const NODE_URL = process.env.NODE_URL || 'https://mainnet-node1.leapdao.org';
const provider = new ethers.providers.JsonRpcProvider(NODE_URL);

let currentBlockNumber = 0;

async function onSubmission(blocksRoot, slotId, owner, casBitmap, periodRoot, tx) {
  const blocksPassed = currentBlockNumber - tx.blockNumber;
  const minutesPassed = ((blocksPassed * 16) / 60).toFixed(1);

  console.log(`Ethereum block: ${tx.blockNumber} (~${minutesPassed} minutes ago) root: ${blocksRoot}`);
}

async function run() {
  const config = await provider.send('plasma_getConfig', []);
  console.log(config);

  const bridge = new ethers.Contract(config.bridgeAddr, BRIDGE_ABI, new ethers.providers.JsonRpcProvider(config.rootNetwork));
  const operator = new ethers.Contract(config.operatorAddr, OPERATOR_ABI, new ethers.providers.JsonRpcProvider(config.rootNetwork));
  const tipHash = await bridge.tipHash();

  operator.on(operator.filters.Submission(), onSubmission);
  currentBlockNumber = await operator.provider.getBlockNumber();

  console.log(`tipHash: ${tipHash}`);
  console.log('fetching events since genesis...');
  bridge.provider.resetEventsBlock(await bridge.genesisBlockNumber());
}

run();
