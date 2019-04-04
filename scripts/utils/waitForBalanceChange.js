const ethers = require('ethers');

module.exports = async (addr, prevBalance, plasma) => {
  let currentBalance;
  let i = 0;
  do {
    i++;
    await new Promise(resolve => setInterval(resolve, 1000));    
    currentBalance = await plasma.getBalance(addr).then(res => Number(res));
    process.stdout.write(`\r   🕐 Waiting for plasma balance change. Seconds passed: ${i}`);
  } while(currentBalance === prevBalance)
  console.log(`\n   ✅ Plasma balance changed: ${ethers.utils.formatEther(currentBalance.toString())} LEAP`);

  return currentBalance;
}