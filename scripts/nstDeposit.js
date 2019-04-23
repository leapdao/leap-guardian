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

  require('repl').start().context.exit = exit;

  exit.on(exit.filters.ExitStarted, console.log);
  exit.on(exit.filters.ExitStartedV2, console.log);
  exit.on(exit.filters.NewDeposit, console.log);
  exit.on(exit.filters.NewDepositV2, console.log);
  exit.on(exit.filters.NewToken, console.log);

  let res;
  //const _factory = new ethers.ContractFactory(
  //  foo.abi,
  //  foo.bytecode,
  //  wallet
  // );
  //const nst = await _factory.deploy({ gasLimit: '0xfffff' });
  //const c = await nst.deployed();
  //console.log(c);
  //console.log(nst);

  const cmd = process.argv[2];
  const nstAddr = '0xda62386f177f7b493176ffe66352235589a78610';
  const nst = new ethers.Contract(nstAddr, Mint.abi, wallet);

  if (cmd === 'mint') {
    const nstAddr = '0xda62386f177f7b493176ffe66352235589a78610';
    const nst = new ethers.Contract(nstAddr, Mint.abi, wallet);

    let tokenId = process.argv[3];
    let newData = process.argv[4];
    res = await nst.mint(wallet.address, tokenId, newData);
    console.log(res);
    await res.wait();
    res = await nst.approve(exit.address, tokenId);
    let color = (2**15 + 2**14) + 1;
    res = await exit.depositBySender(tokenId, color);
    console.log(res);
    await res.wait();

    return;
  }

  // propose
  // res = exit.interface.functions.registerNST.encode([nstAddr]);
  let tokenId = '0x1111111111111111111111111111111111111111111111111111111111111111';
  let newData = '0xfafafafafafafafafafafafafafafafafafafafafafafafafafafafafafafafa';
  /*res = await bla.mint(wallet.address, tokenId, newData);
  console.log(res);
  await res.wait();
  res = await bla.approve(exit.address, tokenId);
  console.log(res);
  await res.wait();*/

  //let color = (2**15 + 2**14) + 1;
  //res = await exit.depositBySender(tokenId, color);
  //console.log(res);
  //await res.wait();

  let color = await provider.send('plasma_getColor', [nstAddr]);
  let address;// = wallet.address;
  res = await provider.send('plasma_unspent', [address, parseInt(color.replace('0x', ''), 16)]);
  console.log(res);
}

run();
