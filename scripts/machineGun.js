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

const Web3 = require('web3');
const { helpers, Tx } = require('leap-core');

const nodeUrl = process.env.NODE_URL;
const privKey = process.env.PRIV_KEY;
const numberOfTx = process.env.NUM || 1;

async function run() {
  const plasmaWeb3 = helpers.extendWeb3(new Web3(nodeUrl));
  const account = plasmaWeb3.eth.accounts.wallet.add(privKey);

  for (let i = 0; i < numberOfTx; i += 1) {
    const utxos = await plasmaWeb3.getUnspent(account.address);

    if (utxos.length === 0) {
      throw new Error(`Not enough balance for machine gun. Send some LEAPs to ${account.address}`);
    }

    const tx = Tx.transferFromUtxos(utxos, account.address, account.address, 100, 0).signAll(privKey);

    process.stdout.write(`\r🔫 Machinegunning: ${i + 1}/${numberOfTx}`);

    await plasmaWeb3.eth.sendSignedTransaction(tx.hex())
  }
  console.log();
}

run();
