#!/usr/bin/env node

/**
 * Copyright (c) 2019-present, Leap DAO (leapdao.org)
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

const ethers = require('ethers');

const ExitHandlerABI = require('./../abis/exitHandlerAbiV2');
const Mint = require('./ERC1948Mint.json');

const nodeUrl = process.env.NODE_URL;
const provider = new ethers.providers.JsonRpcProvider(nodeUrl);

async function run() {
  const config = await provider.send('plasma_getConfig', []);
  console.log(config);

  const rootProvider = new ethers.providers.JsonRpcProvider(config.rootNetwork);
  const wallet = new ethers.Wallet(process.env['PRIV_KEY'], rootProvider);
  const exit = new ethers.Contract(config.exitHandlerAddr, ExitHandlerABI, wallet);

  const nftTokenCount = await exit.nftTokenCount();
  const nstTokenCount = await exit.nstTokenCount();

  console.log({ nftTokenCount, nstTokenCount });

  exit.on(exit.filters.ExitStarted, console.log);
  exit.on(exit.filters.ExitStartedV2, console.log);
  exit.on(exit.filters.NewDeposit, console.log);
  exit.on(exit.filters.NewDepositV2, console.log);
  exit.on(exit.filters.NewToken, console.log);

  const cmd = process.argv[2];
  const nstAddr = process.argv[3] || cmd;
  const nst = new ethers.Contract(nstAddr, Mint.abi, wallet);

  let res;

  if (cmd === 'deploy') {
    const _factory = new ethers.ContractFactory(
      Mint.abi,
      Mint.bytecode,
      wallet
    );

    console.log('deploying');
    res = await _factory.deploy({ gasLimit: '0xfffff' });
    console.log('waiting for deploy txHash:', res.deployTransaction.hash);
    res = await res.deployed();
    console.log(res);
    console.log(_factory.address);
    return;
  }

  if (cmd === 'mint') {
    let tokenId = process.argv[3];
    let newData = process.argv[4];

    console.log({ tokenId, newData });

    res = await nst.mint(wallet.address, tokenId, newData);
    console.log('mint', res);
    await res.wait();
    console.log('minted');

    res = await nst.approve(exit.address, tokenId);
    await res.wait();
    console.log('approved');

    let color = (2**15 + 2**14) + 1;
    res = await exit.depositBySender(tokenId, color);
    console.log(res);
    await res.wait();
    console.log('deposit');

    return;
  }

  if (cmd === 'propose') {
    res = exit.interface.functions.registerToken.encode([nstAddr]);
    console.log({ subject: exit.address, msgData: res });
    return;
  }

  let color = await provider.send('plasma_getColor', [nstAddr]);
  let address;// = wallet.address;

  res = await provider.send('plasma_unspent', [address, parseInt(color.replace('0x', ''), 16)]);
  console.log(res);
}

run();
