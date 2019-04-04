# leap-guardian
Contains scripts to keep the angels busy...

## Challenge exit script
Example command:
```
SPENT_HASH=0x6f9632e11fafe13f8703ddf62c13266000e7ba5561cd6a4d584c85ba002f181f EXIT_HASH=0x61ec4d8ceac63120902b8a29dc7d0c4f2efaec07e49b3b8ed1ff1129d0c697f1 NODE_URL=https://testnet-node1.leapdao.org/ PRIV_KEY=0x4c5d8ebb1dbbf45779f21354bff9d5e80914ed3ba62680df4bba0878123c8407 VALIDATOR_ADDR=0xde42468b9ba193384ea76e337bae1676932133cf node scripts/challengeExit.js
```

## Machine gun
Script to add more transactions to the given network (usually to incite the next period submission). 

**Env params:**
- NODE_URL - JSON RPC endpoint of the Leap node
- PRIV_KEY - private key for the plasma account to machine gun from. This account should be funded with 100 LEAP cents.
UTXO from this account will be spend to itself, so it is good for any number of transactions
- NUM - Number of trnsactions to send. Default is 1
  
**Example:**
 
```
NUM=5 NODE_URL=http://localhost:8645 PRIV_KEY=0xbd54b17c48ac1fc91d5ef2ef02e9911337f8758e93c801b619e5d178094486cc node scripts/machineGun.js
```

## set validator

Sets given validator slotId on the given network. Changes epochLength if needed.

**Restrictions:**
- network should be governed by MinGov
- proposal time for MinGov should be 0

**Env params:**
- NODE_URL    - JSON RPC endpoint of the Leap node
- PRIV_KEY    - private key for ethereum account owning the network governance
- SLOT        - (optional) validator slotId to set. Defaults to 0
- TENDER_ADDR - (optional) tendermint validator address. If not specified, will be taken from the node
- VAL_ADDR    - (optional) validator address. If not specified, will be taken from the node

**Example:**

```
SLOT=1 PRIV_KEY=0xe0fb6e8a745d9f266410b51a9b2abb4f63ef7e6cd55a8328a76d095669088be2 node scripts/setValidator.js
```