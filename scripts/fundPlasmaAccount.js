/**
 * Copyright (c) 2018-present, Leap DAO (leapdao.org)
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

/* eslint-disable no-await-in-loop, no-console */


/**
 * Sets given validator slotId on the given network. Changes epochLength if needed.
 * 
 * Restrictions:
 * - network should be governed by MinGov
 * - proposal time for MinGov should be 0
 * 
 * Env params:
 * NODE_URL    - JSON RPC endpoint of the Leap node
 * PRIV_KEY    - private key for account with network's LEAPs
 * PLASMA_ADDR - plasma acocunt to fund
 * 
 * Example: PRIV_KEY=0xe0fb6e8a745d9f266410b51a9b2abb4f63ef7e6cd55a8328a76d095669088be2 node scripts/fundPlasmaAccount.js
 */

const ethers = require('ethers');
const { waitForBalanceChange } = require('./utils');
const plasmaTransfer = require('./plasmaTransfer');
const getWallet = require('./utils/wallet');

const exitHandlerAbi = require('../abis/exitHandlerAbi');
const tokenAbi = require('../abis/erc20Abi');

const plasmaAddr = process.env.PLASMA_ADDR;

async function run() {
  const { plasmaWallet, rootWallet, nodeConfig } = await getWallet();
  const { address } = rootWallet;

  const { exitHandlerAddr } = nodeConfig;

  const exitHandler = new ethers.Contract(exitHandlerAddr, exitHandlerAbi, rootWallet);
  const tokenAddr = await exitHandler.getTokenAddr(0);
  const token = new ethers.Contract(tokenAddr, tokenAbi, rootWallet);

  const amount = ethers.utils.parseEther('1.0');
  
  console.log('Fund account on plasma');
  console.log('   Minting..');
  await token.mint(address, amount).then(tx => tx.wait());
  console.log('   Approving..');
  await token.approve(exitHandlerAddr, amount).then(tx => tx.wait());

  console.log('   Depositing..');
  const currentBalance = await plasmaWallet.provider.getBalance(address).then(res => Number(res));
  await exitHandler.deposit(address, amount, 0).then(tx => tx.wait());
  await waitForBalanceChange(address, currentBalance, plasmaWallet.provider);  
  
  console.log('   Transfering..');
  await plasmaTransfer(plasmaAddr, amount, 0, plasmaWallet);
  console.log('✅ Done');
}

run().then(() => process.exit(0));
