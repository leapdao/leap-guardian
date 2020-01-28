#!/usr/bin/env node

/**
 * Copyright (c) 2020-present, Leap DAO (leapdao.org)
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

const OPERATOR_ABI = require('../abis/operatorAbi');
const BRIDGE_ABI = require('../abis/bridgeAbi');

async function run({ plasmaWallet, rootWallet, nodeConfig }) {
  const blockHeight = await plasmaWallet.provider.getBlockNumber();
  console.log('Block height:', blockHeight);

  console.log('\nPeriod data');
  for (let i = 1; blockHeight - i * 32 > 0; i++) {
    const height = blockHeight - i * 32;
    const data = await plasmaWallet.provider.getPeriodByBlockHeight(height) || {};
    console.log(`\t${JSON.stringify(data)}`);
  }

}

module.exports = run;

if (require.main === module) {
  (async () => {
    await run(await require('./utils/wallet')());  
  })();
}
