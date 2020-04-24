#!/usr/bin/env node

/**
 * Copyright (c) 2018-present, Leap DAO (leapdao.org)
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

/* eslint-disable no-await-in-loop, no-console */

/**
 * Transfer on plasma
 * 
 * NODE_URL - JSON RPC endpoint of the Leap node
 * PRIV_KEY - private key for the plasma account to machine gun from. This account should be funded with 100 LEAP cents.
 *            UTXO from this account will be spend to itself, so it is good for any number of transactions
 * TO       - Transfer to
 * AMOUNT   - Amount to transfr
 * COLOR    - (optional) Color of the token. Defaults to 0 (LEAP)
 * 
 * Example: TO=0xFbc827807D4E4F9574C546A5feE98abcd4e88b09 COLOR=4 AMOUNT=100000000000000000000 NODE_URL=https://testnet-node1.leapdao.org PRIV_KEY=0x00 node scripts/plasmaTransfer.js
 */

const { Tx } = require('leap-core');
const getUtxos = require('./utils/getUtxos');

const run = async (to, amount, color, wallet) => {  

  // this only works for color 0 :shrug:
  // const balance = await wallet.provider.getBalance(wallet.address).then(res => Number(res));
  // if (balance < amount) {
  //   throw new Error(`Not enough balance for transfer. Send some tokens to ${wallet.address}`);
  // }

  const utxos = await wallet.provider.getUnspent(wallet.address, parseInt(color));

  const tx = Tx.transferFromUtxos(
    utxos, wallet.address, to, amount.toString(), parseInt(color),
  ).signAll(wallet.privateKey);

  await wallet.provider.sendTransaction(tx).then(tx => tx.wait());
}

module.exports = run;

if (require.main === module) {
  (async () => {

    const { plasmaWallet } = await require('./utils/wallet')();

    run(
      process.env.TO, 
      process.env.AMOUNT, 
      process.env.COLOR || 0,
      plasmaWallet,
    );
  })();
}
