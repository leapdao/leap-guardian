const ethers = require('ethers');
const { bufferToHex, privateToAddress, toBuffer } = require('ethereumjs-util');
const { sendFunds, checkBalance, readSnapshot } = require('./helpers');

const rpc = new ethers.providers.JsonRpcProvider(process.env.NODE_URL);

const PRIV_KEY = process.env.PRIV_KEY;
const from = bufferToHex(privateToAddress(toBuffer(PRIV_KEY)));

const dispenser = {
  address: from,
  priv: PRIV_KEY
};
const snapshot = './snapshot.csv';

async function run() {
  const balances = await readSnapshot(snapshot);
  for (let i = 0; i < balances.length; i++) {
    const record = balances[i];
    console.log('Dispensing', record.Balance, 'LEAP to', record.Address);
    let check = await checkBalance(record.Address, 0, rpc);
    if (!check.result) {
      console.log(` Address already funded(${check.balance}). Skipping.`);
      continue;
    }    
    await sendFunds(dispenser, record.Address, record.Balance, rpc);
    check = await checkBalance(record.Address, process.env.DRY_RUN ? 0 : record.Balance, rpc);
    if (!check.result) {
      console.log(
        ` Failed! Expected: ${record.Balance}). Actual: ${check.balance}`
      );
      return;
    }
  }
}

run();
