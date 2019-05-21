const JSBI = require('jsbi');
const { BigInt, add } = JSBI;
const fs = require('fs');
const csv = require('csv-parser');
const { Tx, helpers, Output, Outpoint } = require('leap-core');
const { sendSignedTransaction } = helpers;

const checkBalance = (addr, expectedBalance, rpc) =>
    getBalance(addr, rpc)
        .then(balance => ({
            addr,
            result: String(balance) === String(expectedBalance),
            balance 
        }))
        .catch(e => {
          console.error(e);
          return { addr, result: false };
        });


const readSnapshot = (snapshotFile) =>
  new Promise(resolve => {
    const balances = [];
    fs.createReadStream(snapshotFile)
      .pipe(csv())
      .on('data', row => {
        balances.push(row);
      })
      .on('end', () => resolve(balances));
  });


async function getBalance(address, rpc) {
  const response = await rpc.send('plasma_unspent', [address]);
  const balance = response.reduce((sum, unspent) => {
    return unspent.output.color === 0
      ? JSBI.add(sum, JSBI.BigInt(unspent.output.value))
      : sum;
  }, JSBI.BigInt(0));

  return balance;
}

async function getBalancesAll(rpc) {
  const response = await rpc.send('plasma_unspent', []);
  let balances = new Map();
  let value;
  let address;
  response.forEach(unspent => {
    if (unspent.output.color === 0) {
      address = unspent.output.address;
      value = JSBI.BigInt(unspent.output.value);
      value = balances.get(address)
        ? JSBI.add(JSBI.BigInt(balances.get(address)), value)
        : value;
      balances.set(address, String(value));
    }
  });

  return balances;
}

async function sendFundsBatched(from, toArr, rpc) {
    
  const totalOutputValue = toArr.reduce((total, to) => {
      total = add(total, BigInt(to.value));
      return total;
  }, BigInt(0));

  // calc inputs
  const utxos = (await rpc.send("plasma_unspent", [from.address, 0]))
    .map(u => ({
      output: u.output,
      outpoint: Outpoint.fromRaw(u.outpoint),
    }));

  if (utxos.length === 0) {
    throw new Error('No tokens left in the dispenser wallet');
  }
  
  const inputs = helpers.calcInputs(utxos, from.address, totalOutputValue, 0);

  // create change output if needed
  let outputs = helpers.calcOutputs(utxos, inputs, from.address, from.address, totalOutputValue, 0);
  if (outputs.length > 1) { // if we have change output
    outputs = outputs.splice(-1); // leave only change
  } else {
    outputs = [];
  }

  // add output for each faucet request
  outputs = outputs.concat(toArr.map(to => new Output(to.value, to.address, 0)));
  
  const tx = Tx.transfer(inputs, outputs).signAll(from.priv);
  let txHash;
  // eslint-disable-next-line no-console
  if (!process.env.DRY_RUN) {
    txHash = await sendSignedTransaction(rpc, tx.hex());
  }
  console.log('txHash:', txHash);
}
  

async function sendFunds(from, to, amount, rpc) {
  const utxos = (await rpc.send('plasma_unspent', [from.address])).map(u => ({
    output: u.output,
    outpoint: Outpoint.fromRaw(u.outpoint)
  }));

  if (utxos.length === 0) {
    throw new Error('No tokens left in the dispenser wallet');
  }

  const inputs = helpers.calcInputs(utxos, from.address, amount, 0);

  let outputs = helpers.calcOutputs(utxos, inputs, from.address, to, amount, 0);

  const tx = Tx.transfer(inputs, outputs).signAll(from.priv);

  let txHash;
  // eslint-disable-next-line no-console
  if (!process.env.DRY_RUN) {
    txHash = await rpc.send('eth_sendRawTransaction', [tx.hex()]);
  }
  console.log('txHash:', txHash);
}

module.exports = { getBalance, getBalancesAll, sendFunds, readSnapshot, checkBalance, sendFundsBatched };
