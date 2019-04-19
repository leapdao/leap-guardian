const ethers = require('ethers');
const file = JSON.parse(require('fs').readFileSync(process.argv[2]));
const contract = new ethers.ContractFactory(
  file.abi,
  file.bytecode,
);

const funcs = contract.interface.functions;

for (const obj in funcs) {
  const func = funcs[obj];
  console.log(`${func.signature} = ${func.sighash}`);
}
console.log(`\nbytecode:\n\n${file.deployedBytecode}`);
