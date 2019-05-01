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
 * NODE_URL  - JSON RPC endpoint of the Leap node
 * PRIV_KEY  - private key for the plasma account to machine gun from. This account should be funded with 100 LEAP cents.
 *            UTXO from this account will be spend to itself, so it is good for any number of transactions
 * NST_COLOR - Color of the NST token to be bread
 * QUEEN_ID  - Id of queen deposited into breeding condition and executing the breed
 * TO        - Receiver of created worker token
 * DATA      - data to set on created worker token
 * 
 * Example: NODE_URL=http://localhost:8645 PRIV_KEY= NST_COLOR=49153 QUEEN_ID=0x1234 TO=0x1234 DATA=0x1234 node scripts/breed.js
 */

const { Tx, Input, Output } = require('leap-core');
const utils = require('ethereumjs-util');
const getUtxos = require('./utils/getUtxos');
const { BigInt, subtract } = require('jsbi-utils');

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace.replace('0x', ''));
}

const NST_COLOR_BASE = 49153;
const BREED_COND = '6080604052348015600f57600080fd5b5060043610602b5760e060020a6000350463451da9f981146030575b600080fd5b605f60048036036060811015604457600080fd5b50803590600160a060020a0360208201351690604001356061565b005b6040805160e060020a63451da9f902815260048101859052600160a060020a038416602482015260448101839052905173123333333333333333333333333333333333333391829163451da9f99160648082019260009290919082900301818387803b15801560cf57600080fd5b505af115801560e2573d6000803e3d6000fd5b505050505050505056fea165627a7a72305820a41e3a0e694cf54b47c2c04a682a2894cd1d00fc915a711bd650de34c3288e060029';
const TOKEN_TEMPLATE = '1233333333333333333333333333333333333333';
const BREED_GAS_COST = BigInt(12054948);

const run = async (to, queenId, col, data, wallet) => {  
  const color = parseInt(col);
  // todo: require color > NST_COLOR_BASE

  const colors = await wallet.provider.send('plasma_getColors', [false, true]);
  const tokenAddr = colors[color - NST_COLOR_BASE].replace('0x', '').toLowerCase();
  const tmp = replaceAll(BREED_COND, TOKEN_TEMPLATE, tokenAddr);
  const script = Buffer.from(tmp, 'hex');
  const scriptHash = utils.ripemd160(script);
  const condAddr = `0x${scriptHash.toString('hex')}`;

  const queenUtxos = await getUtxos(condAddr, color, wallet.provider);
  // todo: better selection, check at least one
  const queenUtxo = queenUtxos[0];

  const gasUtxos = await getUtxos(condAddr, 0, wallet.provider);
  // todo: better selection
  // todo: check value > BREED_GAS_COST
  const gasUtxo = gasUtxos[0];

  const buffer = Buffer.alloc(64, 0);
  buffer.write(queenId.replace('0x', ''), 0, 'hex');
  buffer.write(queenUtxo.output.data.replace('0x', ''), 32, 'hex');
  const predictedId = utils.keccak256(buffer).toString('hex');

  const condition = Tx.spendCond(
    [
      new Input({
        prevout: gasUtxo.outpoint,
        script,
      }),
      new Input({
        prevout: queenUtxo.outpoint,
      }),
    ],
    [
      new Output(
        queenId,
        condAddr,
        color,
        '0x0000000000000000000000000000000000000000000000000000000000000002'
      ),
      new Output(
        `0x${predictedId}`,
        to,
        color,
        data,
      ),
      new Output(subtract(gasUtxo.output.value, BREED_GAS_COST), condAddr, 0),
    ]
  );

  const msgData = `0x451da9f9${queenId.replace('0x', '')}000000000000000000000000${to.replace('0x', '')}${data.replace('0x', '')}`;

  condition.inputs[0].setMsgData(msgData);
  condition.signAll(wallet.privateKey);

  // use this for testing / debugging
  // const rsp = await wallet.provider.send('checkSpendingCondition', [condition.hex()]);
  // console.log(rsp);

  await wallet.provider.send('eth_sendRawTransaction', [condition.hex()]);
}

module.exports = run;

if (require.main === module) {
  (async () => {

    const { plasmaWallet } = await require('./utils/wallet')();

    run(
      process.env.TO, 
      process.env.QUEEN_ID, 
      process.env.COLOR || 0,
      process.env.DATA,
      plasmaWallet,
    );
  })();
}
