#!/usr/bin/env node

/**
 * Copyright (c) 2018-present, Leap DAO (leapdao.org)
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

/* eslint-disable no-await-in-loop, no-console */

/**
 * Machine gun - script to add more transactions to the given network (usually to incite the next period submission).
 * 
 * NODE_URL - JSON RPC endpoint of the Leap node
 * PRIV_KEY - private key for the plasma account to machine gun from. This account should be funded with 100 LEAP cents.
 *            UTXO from this account will be spend to itself, so it is good for any number of transactions
 * NUM      - Number of trnsactions to send. Default is 1
 * 
 * Example: NUM=5 NODE_URL=http://localhost:8645 PRIV_KEY=0xbd54b17c48ac1fc91d5ef2ef02e9911337f8758e93c801b619e5d178094486cc node scripts/machineGun.js
 */

const plasmaTransfer = require('./plasmaTransfer');

const defaultOpts = { silent: false };

module.exports = run = async (numberOfTx, wallet, { silent } = defaultOpts) => {
  for (let i = 0; i < numberOfTx; i += 1) {
    !silent && process.stdout.write(`\r🔫 Machinegunning: ${i}/${numberOfTx}`);
    await plasmaTransfer(wallet.address, 1, 0, wallet);
  }
  !silent && console.log();
};

if (require.main === module) {
  (async () => {
    const { plasmaWallet } = await require('./utils/wallet')();
    run(process.env.NUM || 1, plasmaWallet);
  })();
}
