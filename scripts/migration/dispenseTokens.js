const ethers = require('ethers');
const chunk = require('lodash.chunk');
const { bufferToHex, privateToAddress, toBuffer } = require('ethereumjs-util');
const { sendFundsBatched, checkBalance, readSnapshot } = require('./helpers');

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
  const chunks = chunk(balances, 8);
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    let toArr = await Promise.all(
      chunk
        .map(to => ({ address: to.Address, value: to.Balance }))
        .map(async to => {
          let check = await checkBalance(to.address, 0, rpc);
          if (!check.result) {
            console.log(to.address, 'Skipping — already funded (', String(check.balance), ')');
            return;
          } else {
            console.log(to.address, 'Dispensing ', to.value, 'LEAP');
            return to;
          }
        })
    );

    toArr = toArr.filter(to => !!to)

    if (toArr.length > 0) {
        await sendFundsBatched(dispenser, toArr, rpc);
    }
  }
}

run();
