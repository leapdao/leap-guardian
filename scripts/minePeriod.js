#!/usr/bin/env node

/**
 * Copyright (c) 2018-present, Leap DAO (leapdao.org)
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

/* eslint-disable no-await-in-loop, no-console */

/**
 * Split a given amount of tokens to given number of UTXOs (evenly). 
 * This allows to fragment the UTXO set if necessary
 * 
 * AMOUNT   - amount to split
 * NUM      - number of outputs
 * NODE_URL - JSON RPC endpoint of the Leap node. Defaults to http://localhost:8645
 * PRIV_KEY - private key for the plasma account to machine gun from. This account should be funded with 100 LEAP cents.
 *            UTXO from this account will be spend to itself, so it is good for any number of transactions
 * COLOR    - (optional) Color of the token. Defaults to 0 (LEAP)
 * TO       - (optional) destination for split UTXOs. Defaults to sender
 * 
 * Example: AMOUNT=100 NUM=14 NODE_URL=http://localhost:8645 PRIV_KEY=0xbd54b17c48ac1fc91d5ef2ef02e9911337f8758e93c801b619e5d178094486cc node scripts/splitUTXO.js
 */

const ethers = require('ethers');
const { Tx, Period } = require('leap-core');
const splitUtxo = require('./splitUTXO');
const machineGun = require('./machineGun');

const run = async ({ plasmaWallet, rootWallet, nodeConfig }) => {
  const fromTime = Date.now();
  const address = plasmaWallet.address;
  await splitUtxo(10, 10, plasmaWallet, 0, address);

  const operator = new ethers.Contract(
    nodeConfig.operatorAddr,
    require('./../abis/operatorAbi'), 
    rootWallet
  );

  let fromPlasmaBlock = Number((await plasmaWallet.provider.getBlock('latest')).number);
  const [, lastBlockInPeriod] = Period.periodBlockRange(fromPlasmaBlock);

  const blocksTillNextPeriod = lastBlockInPeriod - fromPlasmaBlock + 2;

  const submissions = [];
  operator.on("Submission", (...args) => {
    submissions.push(args);
  });

  let round = 0;

  const msg = `\r${' '.repeat(100)}\rPushing network till the next period:`;
  
  let currentBlock = fromPlasmaBlock;
  while (round < blocksTillNextPeriod / 10) {
    process.stdout.write(`${msg} submitting txs. Blocks: ${currentBlock - fromPlasmaBlock}`);
    const utxos = await plasmaWallet.provider.getUnspent(address, 0);

    for (let i = 0; i < Math.min(10, utxos.length); i++) {
      await new Promise((resolve) => setTimeout(() => resolve(), 700));

      if (submissions.length > 0) {
        round = 1000;
        break;
      }
      const tx = Tx
        .transferFromUtxos([utxos[i]], address, address, 1, 0)
        .signAll(plasmaWallet.privateKey);

      plasmaWallet.provider.sendTransaction(tx).then(tx => tx.wait())
        .then((rcp) => { 
          currentBlock = Math.max(currentBlock, rcp.blockNumber);
         });
    }
  }

  if (!submissions.length) {
    process.stdout.write(`${msg} 🔴No period in time. Something is wrong\n`);
    return;
  }

  
  let periodData;
  process.stdout.write(`${msg} waiting for node to catch up the period`);
  while (!periodData) {
    await new Promise((resolve) => setTimeout(() => resolve(), 6000));
    await machineGun(1, plasmaWallet, { silent: true });
    currentBlock = Number((await rootWallet.provider.getBlock('latest')).number);

    periodData = await plasmaWallet.provider.getPeriodByBlockHeight(fromPlasmaBlock);
  }
  process.stdout.write(`${msg} ✅ (${(Math.floor(Date.now() - fromTime) / 1000)} sec)\n`);
}

module.exports = run;

if (require.main === module) {
  (async () => {
    await run(await require('./utils/wallet')());  
  })();
}