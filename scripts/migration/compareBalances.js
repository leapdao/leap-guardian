const ethers = require("ethers");
const fs = require("fs");
const csv = require("csv-parser");
const { getBalance } = require("./helpers");

const nodeUrl = process.argv[2]
  ? process.argv[2]
  : "https://testnet-node.leapdao.org";

const rpc = new ethers.providers.JsonRpcProvider(nodeUrl);
const snapshot = "./snapshot.csv";

async function run() {
  const balances = [];

  fs.createReadStream(snapshot)
    .pipe(csv())
    .on("data", row => {
      balances.push(row);
    })
    .on("end", async () => {
      balances.forEach(async record => {
        const balance = await getBalance(record.Address, rpc);
        if (String(balance) === record.Balance) {
          console.log(record.Address, "   OK");
        } else {
          console.log(
            record.Address,
            "   Mismatch! Expected:",
            record.Balance,
            "actual: ",
            String(balance)
          );
        }
      });
    });
}

run();
