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
 * TENDER_ADDR - (optional) tendermint validator address. If not specified, will be taken from the node
 * VAL_ADDR    - (optional) validator address. If not specified, will be taken from the node
 * 
 * Example: SLOT=1 PRIV_KEY=0xe0fb6e8a745d9f266410b51a9b2abb4f63ef7e6cd55a8328a76d095669088be2 node scripts/setValidator.js
 */

const ethers = require('ethers');
const { getRootNetworkProvider } = require('./utils');

const operatorAbi = require('../abis/operatorAbi');
const governanceAbi = require('../abis/minGovAbi');

const nodeUrl = process.env.NODE_URL || 'http://localhost:8645';

const slotId = parseInt(process.env.SLOT) || 0;
const privKey = process.env.PRIV_KEY;

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

async function run() {
  const plasma = new ethers.providers.JsonRpcProvider(nodeUrl);
  const nodeConfig = await plasma.send('plasma_getConfig', []);
  const root = new ethers.providers.JsonRpcProvider(getRootNetworkProvider(nodeConfig));
  const wallet = new ethers.Wallet(privKey, root);

  const { operatorAddr } = nodeConfig;

  const operator = new ethers.Contract(operatorAddr, operatorAbi, wallet);
  const governance = new ethers.Contract(await operator.admin(), governanceAbi, wallet);
  
  const epochLength = (await operator.epochLength()).toNumber();
  console.log('Current epoch length', epochLength);  
  if (epochLength <= slotId) {
    console.log(`Setting epoch length to ${slotId + 1}..`);
    const data = operator.interface.functions.setEpochLength.encode([slotId + 1])
    tx = await governance.propose(operatorAddr, data).then(tx => tx.wait());
  }
  
  console.log(`Setting slot ${slotId}..`);
  
  const { ethAddress, tendermintAddress } = await getValidatorDetails(plasma); 
  const overloadedSlotId = `${operatorAddr}00000000000000000000000${slotId}`;
  await governance.setSlot(overloadedSlotId, ethAddress, `0x${tendermintAddress}`);

  console.log(`Funding validator account..`);
  await wallet.sendTransaction({
    to: ethAddress,
    value: ethers.utils.parseEther('1.0')
  });

  tx = await governance.finalize().then(tx => tx.wait());
  console.log('✅ Done');
  console.log('Current epoch length', (await operator.epochLength()).toNumber());
  console.log(`Slot ${slotId}`, await operator.slots(slotId));
}

run();
