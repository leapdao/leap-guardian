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
 * Example: NUM=5 NODE_URL=http://localhost:8645 PRIV_KEY=0xbd54b17c48ac1fc91d5ef2ef02e9911337f8758e93c801b619e5d178094486cc node scripts/machineGun.js
 */

const { Tx } = require('leap-core');
const getUtxos = require('./utils/getUtxos');

const run = async (to, amount, color, wallet) => {  
  const balance = await wallet.provider.getBalance(wallet.address).then(res => Number(res));
  
  if (balance < amount) {
    throw new Error(`Not enough balance for transfer. Send some tokens to ${wallet.address}`);
  }

  const utxos = await getUtxos(wallet.address, color, wallet.provider);

  const tx = Tx.transferFromUtxos(
    utxos, wallet.address, to, amount.toString(), color,
  ).signAll(wallet.privateKey);

  wallet.provider.send('eth_sendRawTransaction', [tx.hex()]);
}

module.exports = run;

if (require.main === module) {
  run(process.env.TO, process.env.AMOUNT, process.env.COLOR || 0, require('./utils/wallet')());
}
