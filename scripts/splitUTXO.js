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


const to = [ 
  '0x7b5b9137ebbd45bb8c2e5302772686bc24dfb71b',
  '0x516b68f095a072f3ea52ba2a538fa64db4ecbbc9',
  '0x1185e1e5dee16d97df612a7fc9e3d5677ce04c3a',
  '0xfa0aec4a9e6a391cd470d059adae942fe51d9d48',
  '0x8cbf0aa104cbc691ab9f098c7726d263e55c20a5',
  '0x8d438848d92ab1a5c30fb06f5e96231459946bfa',
  '0x15f46c3cb7cf684fb3ab62e210708d4b8a0f8e77',
  '0xfbc671244e2ca824a2061f5e854099512a0e6d74',
  '0x8a9e9b959f3515f7c938684e1977008d9ba6a659',
  '0x5d615b0f891f6173d5dc5a82137337385a4d75bd',
  '0x8c49f5c2342166d58e45f2fd1eac1f136559dff1',
  '0x2cd8a527c4c35846b9fbc8dc5c59f64ba91e975b',
  '0x61a9d7e475e2cbc9fcaa525499df87b9d73d2668',
  '0x26c62480d7e03acec1115b18f1262e88465b73c5',
  '0x4562990659801c1b562e0082f408e9dce753141e',
  '0x657b3b6f20facde4a1160e4be278ccd37fbd0ac6',
  '0x63da24b68789cd9168dc2b9481f22f76224c05e2',
  '0x86cf8dfd2b159e825b985e361707b7e3f18c1c5a',
  '0xac30279e415c6c66e6c121f122b0593cdb789af0',
  '0xe574bf96e4b3df948ea9e27472940b9e2882da2f',
  '0x073b76cc22cebecdf6ea5a319ada5196d008b943',
  '0xd86c36111eaa2677e045c465788bdce51ef33319',
  '0x1c1d7eb1346fb7ad027e51f2bd19298e0f5e9b15',
  '0x0e73cb07c166a81d06f2e82813d130e209481136',
  '0xbb6aed0d3737707800ba9701f2bc123ea9418e22',
  '0x2f83ce02d3cd21ea9ec5354743891fa90e89e4e0',
  '0xcc918652f1640f711227d341a1f7bcaf53ef8ea0',
  '0xfa8f30134f1766af923822b141442f2569b379a6',
  '0x725a5c76d40cdf69ca9042e6685c1acf23e29cdb',
  '0x752a5d8be89e63a548ca1d64233f0a37874259d0',
  '0xea7bebcd2b0fecec226e9f52f744b23a1292bbb0',
  '0x150b6bba39aa5d254d415397c8a763ced7d017b4',
  '0xa790e77522b2d65fcde57c4a0f0284fdacde9154',
  '0xe446101ae1591c7fc4d53f230954101186072d57',
  '0x1330d1f79b4dac8693259dcb4a67d2a4239cce70',
  '0xacb26ee2bedcdf9721068ee062b052bb405e307b',
  '0x3dbe4091665fa581817a8f33f8e52e6fe3064fae',
  '0x95b76098e71d85f810bd5f0fc0c02c890af11a7a',
  '0x84753d72a23dd2a76b0170cc3bcbe39b42de729a',
  '0x99f11d6250bb77e2687b6c2893e139f230fd729e',
  '0xd2010de21e4079b72117c9e0d6789182c902e3be',
  '0xf254ca73c3d257b61ac2453e875bf784c106503d',
  '0x81b9274505db923884ae68fb63c9b1ce9d6fc703',
  '0x9fb402fa9bbff87590b2e1d45e3f2b99bac3df39',
  '0x88b095ccbfdc8c2428edb772c4e1eed04a76bfa8',
  '0x29e55560c30d7511850fc87895b0eaba95fa7af9',
  '0x46f6b02a7fcf32285336b82e005be4701195a0d3',
  '0x2e460b5a62a779a7831179065a05a562e995226f',
  '0xe792756113a27dd543b3f87181e5cce898d5ca67',
  '0xd3725b650c68465098971eb59ae253ed494da227',
  '0x2758fdd1986bd9d17f4c419479c75653e64706ea',
  '0x68b2c94107e1037d6540239ef159a06595554d06',
  '0xf21a75bcce99a44c023582292e28194de443e6c9',
  '0xabf517b04e3149dd70b7e27bb80c599858f46f03',
  '0x9ffaea8e6c8d0ea55cf52a83445fe4662af883a8',
  '0xbd1a1ea2bd041c97c57b84736850fbe850471a29',
  '0xfc704c8ae104330d645275be1d49ddea130cdc88',
  '0x9dc970efeb3ad71f53b2bd4ae197cc77df14d60a',
  '0x9c01c9bfd93820fe4d859d54c3cfe3ee8d17fdec',
  '0x97aa4b0bf5a78bab6c2fc6850d9e275650eb43c1',
  '0x7121798e53cd01067ffdb279793adef098da8716',
  '0x7b6e6910516453eaa6488736f1645fe602987636',
  '0xec8b15e67fb629fd3a9016fd631331bb3c60d8df',
  '0x759efbd90656d6de03ddcfc141a81d715acf62ff',
  '0xbde4dfee908e9e0c0fbfcefe222c1c55b442d285',
  '0x94a7112f50d9e4e5cf8974f0c9de34eec96ce05e',
  '0x460139521bb4bc5576a18b3e797dbafab5473ed7',
  '0xe159da83bbf2a496fe342229961fda9c2c5d9259',
  '0x28e9e53dac5df03f3fce92b926fce5b7cd52a6ad',
  '0x5c7c70a781ce876cc4aaba43d0caef499d30db68',
  '0xd7841ffc64c89ab16cd5d3e27cd5bb0b6366db63',
  '0xca6e556fd375f1471a55075e00350d3bffd79330',
  '0x32b11a1bad2c8005f54346a7d2aa4aff8d7e58bf',
  '0xb8a311a9058b0f1690e2072481396813973eaff1',
  '0x124256814898b85c62b8c78c0065f5a5a8a7e95b',
  '0x105f82735ecc5759464cb09609f89014e55b4a23',
  '0x77d2f8420b6e55c4ef8d82ea70ac45da0cfe6e91',
  '0x4d6034f2062b78edc9bc96ec1d5e6107dd9dae71',
  '0x697f01f8a14f94a585c4be48aa307c64e5243e58',
  '0x6206e99b81b9ef427d993f8fcb9beba957d5892f',
  '0xc82875032ceb66e76d36f661b9fb64cfffd02495',
  '0xdd51cdc23cb1f4c8dd07944041c5c2bd117ed110',
  '0x91332a23b4e8b7ca92bade9d9a89711a21cae810',
  '0x43ec51f0c4ae63a5e3439e2678c23b2434a1100a',
  '0x9014aa33d2dc2a2cb9ccd2819a30dd88e8815d89',
  '0x5544b8d30e00b3229df2b3e47d2b005ff8cefb0e',
  '0x08c79b54bcbeeff45352c5b97a6c06e26ae5b044',
  '0x3e6b0f17c963590e1d1cd2f5f62aa564d4f7b0e8',
  '0x4c5870c878c9a7193af3c6c6a93389c5428a1058',
  '0x5e636a9680fdb4f168802740bda3cabc6467772a',
  '0xbe274a2bc8140a781d9541e97b9ec220176e68e5',
  '0xda3d69cd53af1cccba01fd38f48ec0b43869bffe',
  '0x3628c23ae99315d0d991bbdd7e47f82a7d49d714',
  '0xf81c50f46c1940589165b7845cda7949b7b225a0',
  '0x77635541cdd01cdc316c6d5623e440d6727fc7bc',
  '0xb417f4ff6b6087c39267145d01892b01409f0e1e'
];

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

    console.log(plasmaWallet.address);

    for (let i = 0; i < to.length; i++) {
      const addr = to[i];
      await run(
        process.env.AMOUNT, 
        process.env.NUM, 
        plasmaWallet,
        process.env.COLOR,
        addr
      );  
    }
  })();
}
