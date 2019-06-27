#!/usr/bin/env node

/**
 * Copyright (c) 2018-present, Leap DAO (leapdao.org)
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

/* eslint-disable no-await-in-loop, no-console */


/**
 * Creates an encoded governance proposal to register token.
 * 
 * Restrictions:
 * - network should be governed by MinGov
 * 
 * Env params:
 * NODE_URL    - JSON RPC endpoint of the Leap node. Default to local node
 * PRIV_KEY    - private key for ethereum account owning the network governance
 * 
 * Example: NODE_URL=https://testnet-node.leapdao.org node scripts/registerToken.js -a 0x06f187da6a2b0f5255e7e27aa96575987074648e -t nst
 */

const ethers = require('ethers');
const program = require('commander');
const { isValidAddress } = require('ethereumjs-util');

const exitHandlerAbi = require('../abis/exitHandlerAbi');
const governanceAbi = require('../abis/minGovAbi');
const getWallet = require('./utils/wallet');

async function run(tokenAddr, tokenType) {
  const { rootWallet, nodeConfig } = await getWallet();
  const { exitHandlerAddr } = nodeConfig;

  const exitHandler = new ethers.Contract(exitHandlerAddr, exitHandlerAbi, rootWallet);
  const governance = new ethers.Contract(await exitHandler.admin(), governanceAbi, rootWallet);
  const govOwner = await governance.owner();

  let data;

  if (tokenType === 'nst') {
    console.log(`registerNST("${tokenAddr}"`);
    data = exitHandler.interface.functions.registerNST.encode([tokenAddr]);
  } else {
    console.log(`registerToken("${tokenAddr}", ${tokenType === 'nft'})`);
    data = exitHandler.interface.functions.registerToken.encode([tokenAddr, tokenType === 'nft']);
  }
  console.log();
  console.log('MinGov: ', governance.address);
  console.log('Owner of MinGov: ', govOwner);
  console.log();
  console.log(`Tx to send: propose("${exitHandlerAddr}", "${data}")`);
}


const halt = (msg) => {
  console.error(msg);
  return program.outputHelp();
}


program
  .option('-a, --addr <addr>', 'Token address')
  .option('-t, --type <type>', 'Token type: ERC20, NFT, NST');

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  return program.outputHelp();
}

const { addr, type } = program;

if (!addr) return halt('Missing token address');

if (!isValidAddress(addr)) return halt('Address is not valid Ethereum address'); 
if (!type) return halt('Missing token type: ERC20, NFT or NST'); 
if (['erc20', 'nst', 'nft'].indexOf(type.toLowerCase()) < 0) return halt('Invalid token type: ERC20, NFT or NST'); 

run(addr, type.toLowerCase());
