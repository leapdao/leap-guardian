const Web3 = require('web3');
const { Tx, Input, Output, Outpoint, Period, helpers, Util } = require('leap-core');

const exitHandlerAbi = require('./exitHandler');


module.exports = async function(exitTxHash, spendTxHash, nodeUrl, providerUrl, privKey, validatorAddr) {
  const web3 = new Web3(providerUrl);
  const plasmaWeb3 = helpers.extendWeb3(new Web3(nodeUrl));
  const account = web3.eth.accounts.wallet.add(privKey);

  const nodeConfig = await plasmaWeb3.getConfig();
  const exitHandler = new web3.eth.Contract(exitHandlerAbi, nodeConfig.exitHandlerAddr);

  console.log(`exitHandler=${nodeConfig.exitHandlerAddr}`);
  console.log(`exitTxHash=${exitTxHash}`);
  console.log(`spendTx=${spendTxHash}`);
  console.log(`validatorAddr=${validatorAddr}`);

  let outputIndex;
  let inputIndex;
  let exitTx = await plasmaWeb3.eth.getTransaction(exitTxHash);
  let spendingTx = await plasmaWeb3.eth.getTransaction(spendTxHash);

  spendingTxObject = Tx.fromRaw(spendingTx.raw);

  for (let i = 0; i < spendingTxObject.inputs.length; i++) {
    let input = spendingTxObject.inputs[i];
    if (Util.toHexString(input.prevout.hash) == exitTxHash) {
      inputIndex = i;
      outputIndex = input.prevout.index;
      break;
    }
  }

  const exitProof = await helpers.getProof(plasmaWeb3, exitTx, 0, validatorAddr);
  const spendProof = await helpers.getProof(plasmaWeb3, spendingTx, 0, validatorAddr);
  const res = await exitHandler.methods.challengeExit(
      spendProof,
      exitProof,
      outputIndex,
      inputIndex
  ).send({from: account.address, gas: 2000000});

  console.log(res);
}
