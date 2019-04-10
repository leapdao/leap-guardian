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
const { getRootNetworkProvider, waitForBalanceChange } = require('./utils');
const plasmaTransfer = require('./plasmaTransfer');
const getPlasmaWallet = require('./utils/wallet');

const exitHandlerAbi = require('../abis/exitHandlerAbi');
const tokenAbi = require('../abis/erc20Abi');

const privKey = process.env.PRIV_KEY;
const plasmaAddr = process.env.PLASMA_ADDR;

async function run() {
  const plasmaWallet = getPlasmaWallet();

  const nodeConfig = await plasmaWallet.provider.send('plasma_getConfig', []);
  
  const root = new ethers.providers.JsonRpcProvider(getRootNetworkProvider(nodeConfig));
  const wallet = new ethers.Wallet(privKey, root);
  
  const { exitHandlerAddr } = nodeConfig;

  const exitHandler = new ethers.Contract(exitHandlerAddr, exitHandlerAbi, wallet);
  const tokenAddr = await exitHandler.getTokenAddr(0);
  const token = new ethers.Contract(tokenAddr, tokenAbi, wallet);

  const amount = ethers.utils.parseEther('1.0');
  
  console.log('Fund account on plasma');
  console.log('   Minting..');
  await token.mint(wallet.address, amount).then(tx => tx.wait());
  console.log('   Approving..');
  await token.approve(exitHandlerAddr, amount).then(tx => tx.wait());

  console.log('   Depositing..');
  const currentBalance = await plasmaWallet.provider.getBalance(wallet.address).then(res => Number(res));
  await exitHandler.deposit(wallet.address, amount, 0).then(tx => tx.wait());
  await waitForBalanceChange(wallet.address, currentBalance, plasmaWallet.provider);  
  
  console.log('   Transfering..');
  await plasmaTransfer(plasmaAddr, amount, 0, plasmaWallet);
  console.log('✅ Done');
}

run().then(() => process.exit(0));
