const ethers = require('ethers');
const { sendFunds, checkBalance, readSnapshot } = require('./helpers');

const nodeUrl = process.argv[2]
  ? process.argv[2]
  : 'https://testnet-node.leapdao.org';

const rpc = new ethers.providers.JsonRpcProvider(nodeUrl);

const dispenser = {
  address: 'PUT DISPENSER ADDRESS HERE',
  priv: '!!!NEVER COMMIT WITH MAINNET PRIVATE KEY HERE!!!' //!!!NEVER COMMIT WITH MAINNET PRIVATE KEY HERE!!!
};
const snapshot = './snapshot.csv';

async function run() {
  const balances = await readSnapshot(snapshot);
  for (let i = 0; i < balances.length; i += 15) {
    const record = balances[i];
    console.log('Dispensing', record.Balance, 'LEAP to', record.Address);
    let check = await checkBalance(record.Address, 0, rpc);
    if (!check.result) {
      console.log(` Address already funded(${check.balance}). Skipping.`);
      continue;
    }
    await sendFunds(dispenser, record.Address, record.Balance, rpc);
    check = await checkBalance(record.Address, record.Balance, rpc);
    if (!check.result) {
      console.log(
        ` Failed! Expected: ${record.balance}). Actual: ${check.balance}`
      );
      return;
    }
  }
}

run();
