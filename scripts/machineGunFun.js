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

const ethers = require('ethers');
const { helpers, Tx, Output, Outpoint } = require('leap-core');

const nodeUrl = process.env.NODE_URL;
const privKey = process.env.PRIV_KEY;
const numberOfTx = process.env.NUM || 1;

async function run() {
  const provider = new ethers.providers.JsonRpcProvider(process.env['NODE_URL']);
  const account = new ethers.Wallet(privKey);

  let lastUTXOLen = 0;

  for (let i = 0; i < numberOfTx; i += 1) {
    const utxos = await provider.send('plasma_unspent', [account.address]);

    if (utxos.length === 0) {
      throw new Error(`Not enough balance for machine gun. Send some LEAPs to ${account.address}`);
    }

    if (lastUTXOLen == utxos.length) {
      process.stdout.write(`\x1b[1K\x1b[1G🔫 Machinegunning: no new UTXOs yet Round(${i + 1}/${numberOfTx})`);
      i--;
      continue;
    }
    lastUTXOLen = utxos.length;

    for (let x = 0; x < utxos.length; x++) {
      const utxo = utxos[x];
      const outpoint = Outpoint.fromRaw(utxo.outpoint);
      const output = Output.fromJSON(utxo.output);
      const tx = Tx.transferFromUtxos(
        [{ output, outpoint }], account.address, account.address, 1, output.color
      ).signAll(privKey);

      process.stdout.write(`\x1b[1K\x1b[1G🔫 Machinegunning: UTXO(${x + 1}/${utxos.length}) Round(${i + 1}/${numberOfTx})`);

      // const txHash = await provider.send('eth_sendRawTransaction', [tx.hex()]);
      provider.send('eth_sendRawTransaction', [tx.hex()]);
    }
  }
  console.log();
}

run();
