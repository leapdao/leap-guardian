#!/usr/bin/env node

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
 * PRIV_KEY    - private key for ethereum account owning the network governance
 * SLOT        - (optional) validator slotId to set. Defaults to 0
 * EPOCH_LENGTH - (optional) epoch length to set to. Default: SLOT if it is larger then current value, otherwise not used
 * TENDER_ADDR - (optional) tendermint validator address. If not specified, will be taken from the node
 * VAL_ADDR    - (optional) validator address. If not specified, will be taken from the node
 * 
 * Example: SLOT=1 PRIV_KEY=0xe0fb6e8a745d9f266410b51a9b2abb4f63ef7e6cd55a8328a76d095669088be2 node scripts/setValidator.js
 * Example: SLOT=1 EPOCH_LENGTH=2 PRIV_KEY=0xe0fb6e8a745d9f266410b51a9b2abb4f63ef7e6cd55a8328a76d095669088be2 node scripts/setValidator.js
 */

const ethers = require('ethers');
const { Tx } = require('leap-core');

const { operatorAbi, exitHandlerAbi, heartbeatTokenAbi, minGovAbi } = require('../abis');

const getValidatorDetails = async (plasma) => {
  if (process.env.TENDER_ADDR) {
    return { 
      ethAddress: process.env.VAL_ADDR, 
      tendermintAddress: process.env.TENDER_ADDR,
    };
  } else {
    return await plasma.send('validator_getAddress', []);
  }
};

async function run(slotId, tendermintAddress, ethAddress, newEpochLength = 0, { plasmaWallet, rootWallet, nodeConfig }) {
  const msg = `\r${' '.repeat(100)}\rSetting validator slot ${slotId}:`;
  const { operatorAddr, exitHandlerAddr } = nodeConfig;

  const operator = new ethers.Contract(operatorAddr, operatorAbi, rootWallet);
  const exitHandler = new ethers.Contract(exitHandlerAddr, exitHandlerAbi, rootWallet);
  const heartbeatColor = await operator.heartbeatColor();
  let heartbeatAddr, heartbeat;
  if (heartbeatColor) {
    [heartbeatAddr] = await exitHandler.tokens(heartbeatColor);
    heartbeat = new ethers.Contract(heartbeatAddr, heartbeatTokenAbi, rootWallet);
  }
  const governance = new ethers.Contract(await operator.admin(), minGovAbi, rootWallet);
  
  const epochLength = (await operator.epochLength()).toNumber();
  if (!newEpochLength && epochLength <= slotId) {
    newEpochLength = slotId + 1;
  }

  if (newEpochLength && newEpochLength !== epochLength) {
    process.stdout.write(`${msg} setting epoch length ${epochLength} → ${newEpochLength}`);
    const data = operator.interface.functions.setEpochLength.encode([newEpochLength])
    tx = await governance.propose(operatorAddr, data).then(tx => tx.wait());
    if (newEpochLength > epochLength) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      tx = await governance.finalize().then(tx => tx.wait());
    }
  }
  
  if (heartbeatColor) {
    process.stdout.write(`${msg} minting heartbeat token`);
    const rsp = await heartbeat.mint(rootWallet.address, ethAddress, slotId).then(tx => tx.wait());
    const tokenId = rsp.logs[0].topics[3];
    process.stdout.write(`${msg} depositing heartbeat token`);
    await heartbeat.approve(exitHandler.address, tokenId).then(tx => tx.wait());
    await exitHandler.depositBySender(tokenId, heartbeatColor).then(tx => tx.wait());
    let unspents = [];
    while (!unspents.length) {
      await new Promise(resolve => setInterval(resolve, 2000));    
      unspents = await plasmaWallet.provider.getUnspent(rootWallet.address, heartbeatColor);
    }
    let tx = Tx.transferFromUtxos(
      unspents, rootWallet.address, ethAddress, tokenId, heartbeatColor,
    ).signAll(rootWallet.privateKey);
    await plasmaWallet.provider.sendTransaction(tx).then(tx => tx.wait());
  }

  process.stdout.write(`${msg} setting slot`);
  
  const overloadedSlotId = `${operatorAddr}00000000000000000000000${slotId}`;
  await governance.setSlot(overloadedSlotId, ethAddress, `0x${tendermintAddress}`).then(tx => tx.wait());

  process.stdout.write(`${msg} funding validator account`);
  await rootWallet.sendTransaction({
    to: ethAddress,
    value: ethers.utils.parseEther('1.0')
  }).then(tx => tx.wait());;

  tx = await governance.finalize().then(tx => tx.wait());
  process.stdout.write(`${msg} done`);
  console.log('');
}

module.exports = run;

if (require.main === module) {
  (async () => {
    const env = await require('./utils/wallet')();
    const { ethAddress, tendermintAddress } = await getValidatorDetails(env.plasmaWallet.provider); 
    await run(process.env.SLOT, tendermintAddress, ethAddress, process.env.EPOCH_LENGTH, env);
  })();
}
