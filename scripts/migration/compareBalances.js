const ethers = require('ethers');
const fs = require('fs');
const csv = require('csv-parser');
const { getBalance } = require('./helpers');

const nodeUrl = process.argv[2]
  ? process.argv[2]
  : 'https://testnet-node.leapdao.org';

const rpc = new ethers.providers.JsonRpcProvider(nodeUrl);
const snapshot = './snapshot.csv';

const readSnapshot = () =>
  new Promise(resolve => {
    const balances = [];
    fs.createReadStream(snapshot)
      .pipe(csv())
      .on('data', row => {
        balances.push(row);
      })
      .on('end', () => resolve(balances));
  });

async function run() {
  const balances = await readSnapshot();

  let match = true;

  await Promise.all(
    balances.map(async record => {
      return getBalance(record.Address, rpc)
        .then(balance => {
          if (String(balance) === record.Balance) {
            console.log(record.Address, 'OK');
          } else {
            match = false;
            console.log(
              record.Address,
              'FAIL',
              `Expected: ${record.Balance}, Actual: ${balance}`,
            );
          }
        })
        .catch(e => {
          match = false;
          console.log(record.Address, 'FAIL', e);
        });
    })
  );

  console.log('Balance check:', match ? 'PASS' : 'FAIL (see above)');
}

run();
