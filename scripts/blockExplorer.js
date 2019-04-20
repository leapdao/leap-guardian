#!/usr/bin/env node
/**
 * Copyright (c) 2019-present, Leap DAO (leapdao.org)
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

const ethers = require('ethers');
const { helpers, Tx, Output, Outpoint } = require('leap-core');

const nodeUrl = process.env.NODE_URL;
let current = 0;

function printBlock (block) {
  global.block = block;
  console.log(block);
}

function onException (e) {
  console.error(e);
}

process.on('uncaughtException', onException);
process.on('unhandledRejection', onException);

global.provider = new ethers.providers.JsonRpcProvider(nodeUrl);

global.l = function () {
  provider.getBlockNumber().then((v) => console.log('latest block', v));
}

global.p = function () {
  provider.send('eth_getBlockByNumber', [--current, true]).then((v) => printBlock(v));
}

global.n = function () {
  provider.send('eth_getBlockByNumber', [++current, true]).then((v) => printBlock(v));
}

global.j = function (blockNumber) {
  current = blockNumber;
  provider.send('eth_getBlockByNumber', [blockNumber, true]).then((v) => printBlock(v));
}

global.w = async function () {
  let lastBlockNum = await provider.getBlockNumber();

  setInterval(
    async () => {
      const blockNum = await provider.getBlockNumber();

      if (blockNum > lastBlockNum) {
        let i = lastBlockNum + 1;

        lastBlockNum = blockNum;

        for (; i <= blockNum; i++) {
          const block = await provider.send('eth_getBlockByNumber', [i]);
          console.log(`new block ${i} numTxs=${block.transactions.length}`);
        }

      }
    },
    1000
  );
}

// set default block
provider.getBlockNumber().then((v) => { console.log('latest block', v); current = v; });

require('repl').start({ useGlobal: true });
