#!/usr/bin/env node

/**
 * Copyright (c) 2019-present, Leap DAO (leapdao.org)
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

const fs = require('fs');
const ethers = require('ethers');

const ExitHandlerProxyABI = require('./../abis/exitHandlerProxy');
const MinGovABI = require('./../abis/minGovAbi');

async function run() {
  const newExitHandler = JSON.parse(fs.readFileSync(process.env['EXIT_CONTRACT']));
  const provider = new ethers.providers.JsonRpcProvider(process.env['NODE_URL']);
  const config = await provider.send('plasma_getConfig', []);
  const rootProvider = new ethers.providers.JsonRpcProvider(config.rootNetwork);
  const wallet = new ethers.Wallet(process.env['PRIV_KEY'], rootProvider);
  const exitProxy = new ethers.Contract(config.exitHandlerAddr, ExitHandlerProxyABI, wallet);
  const oldContract = new ethers.Contract(config.exitHandlerAddr, newExitHandler.abi, wallet);

  let newContract;
  const newContractAddr = process.env['NEW_ADDRESS'];
  if (!newContractAddr) {
    const _factory = new ethers.ContractFactory(
      newExitHandler.abi,
      newExitHandler.bytecode,
      wallet
    );

    console.log('deploying');
    newContract = await _factory.deploy({ gasLimit: 7000000 });
    console.log('waiting for deploy, txHash:', newContract.deployTransaction.hash);
    await newContract.deployed();
    console.log('contract address', newContract.address);
  } else {
    newContract = new ethers.Contract(newContractAddr, newExitHandler.abi, wallet);
  }

  // const exitDuration = await oldContract.exitDuration();
  // const exitStake = await oldContract.exitStake();
  // const msgData = newContract.interface.functions.initializeWithExit.encode([config.bridgeAddr, exitDuration, exitStake]);
  // const upgradeMsg = exitProxy.interface.functions.upgradeTo.encode([newContract.address]);
  // console.log('old values for ExitHandler\n', { exitDuration, exitStake, bridgeProxy: config.bridgeAddr });

  const upgradeMsg = exitProxy.interface.functions.upgradeTo.encode([newContract.address]);
  console.log('Please use MinGov.propose with\n', { subject: exitProxy.address, msgData: upgradeMsg });
  console.log('ExitProxy.admin', await exitProxy.admin());
  const minGovInterface = new ethers.utils.Interface(MinGovABI);
  console.log('propose ABI:');
  console.log(JSON.stringify([minGovInterface.functions.propose]));
}

run();
