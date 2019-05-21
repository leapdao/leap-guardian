const ethers = require('ethers');
const { checkBalance, readSnapshot } = require('./helpers');

const nodeUrl = process.argv[2]
  ? process.argv[2]
  : 'https://testnet-node.leapdao.org';

const rpc = new ethers.providers.JsonRpcProvider(nodeUrl);
const snapshot = './snapshot.csv';

async function run() {
  const balances = await readSnapshot(snapshot);

  const results = await Promise.all(
    balances.map(record => checkBalance(record.Address, record.Balance, rpc))
  );

  results.map(r =>
    console.log(`${r.addr} ${r.result ? 'OK' : 'FAIL'}, Balance: ${r.balance}`)
  );

  console.log(
    'Balance check:',
    results.find(r => !r.result) ? 'FAIL (see above)' : 'PASS'
  );
}

run();
