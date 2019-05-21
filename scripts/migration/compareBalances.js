const ethers = require('ethers');
const chunk = require('lodash.chunk');
const { checkBalance, readSnapshot } = require('./helpers');

const rpc = new ethers.providers.JsonRpcProvider(process.env.NODE_URL);
const snapshot = './snapshot.csv';

async function run() {
  const balances = await readSnapshot(snapshot);
  
  let results = [];
  const chunks = chunk(balances, 20);
  for (let i = 0; i < chunks.length; i++) {
    results = results.concat(await Promise.all(chunks[i].map(
        record => checkBalance(record.Address, record.Balance, rpc)
    )));
  }
  
  results.map(r =>
    console.log(`${r.addr} ${r.result ? 'OK' : 'FAIL'}, Balance: ${r.balance}`)
  );

  console.log(
    'Balance check:',
    results.find(r => !r.result) ? 'FAIL (see above)' : 'PASS'
  );
}

run();
