module.exports = [
  {
    "constant": false,
    "inputs": [
      {
        "name": "newImplementation",
        "type": "address"
      }
    ],
    "name": "upgradeTo",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0x3659cfe6"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "newImplementation",
        "type": "address"
      },
      {
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "upgradeToAndCall",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function",
    "signature": "0x4f1ef286"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "implementation",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0x5c60da1b"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "newAdmin",
        "type": "address"
      }
    ],
    "name": "changeAdmin",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0x8f283970"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "applyProposal",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0xa45fee5b"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "admin",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
    "signature": "0xf851a440"
  },
  {
    "inputs": [
      {
        "name": "_implementation",
        "type": "address"
      },
      {
        "name": "_data",
        "type": "bytes"
      }
    ],
    "payable": true,
    "stateMutability": "payable",
    "type": "constructor",
    "signature": "constructor"
  },
  {
    "payable": true,
    "stateMutability": "payable",
    "type": "fallback"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "previousAdmin",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "newAdmin",
        "type": "address"
      }
    ],
    "name": "AdminChanged",
    "type": "event",
    "signature": "0x7e644d79422f17c01e4894b5f4f588d331ebfa28653d42ae832dc59e38c9798f"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "implementation",
        "type": "address"
      }
    ],
    "name": "Upgraded",
    "type": "event",
    "signature": "0xbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b"
  }
];
