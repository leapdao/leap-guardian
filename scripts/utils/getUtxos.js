const { Output, Outpoint } = require('leap-core');

module.exports = async (address, color, plasma) => 
  (await plasma.send('plasma_unspent', [address]))
    .filter(utxo => 
      utxo.output.color === color  
    ).map(utxo => ({
      outpoint: Outpoint.fromRaw(utxo.outpoint),
      output: Output.fromJSON(utxo.output),
    }));