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

const { Tx, helpers, Output } = require('leap-core');
const { divide, bi } = require('jsbi-utils');
const getUtxos = require('./utils/getUtxos');

const { sendSignedTransaction, calcInputs, calcOutputs } = helpers;

const maybeChangeOutput = (utxos, inputs, addr, amount, color) => {
  const outputs = calcOutputs(utxos, inputs, addr, addr, amount, color);

  if (outputs.length > 1) {
    return outputs.slice(-1)[0];
  }
};

const run = async (amount, num, wallet, color = 0, to) => {  
  to = to || wallet.address;
  color = parseInt(color, 0);
  num = parseInt(num, 10);
  amount = bi(amount);
  const utxos = await getUtxos(wallet.address, color, wallet.provider);

  const inputs = calcInputs(utxos, wallet.address, amount, color);

  const outAmount = divide(bi(amount), bi(num));
  // num outputs
  const outputs = [...(new Array(num))].map(() => 
    new Output(outAmount, to, color)
  );

  const changeOutput = maybeChangeOutput(utxos, inputs, wallet.address, amount, color);
  if (changeOutput) {
    outputs.push(changeOutput);
  }
  const tx = Tx.transfer(inputs, outputs).signAll(wallet.privateKey);
  console.log(JSON.stringify(tx.toJSON(), null, 2));
  await sendSignedTransaction(wallet.provider, tx.hex());
}

module.exports = run;

if (require.main === module) {
  (async () => {

    const { plasmaWallet } = await require('./utils/wallet')();

    run(
      process.env.AMOUNT, 
      process.env.NUM, 
      plasmaWallet,
      process.env.COLOR,
      process.env.TO
    );
  })();
}
