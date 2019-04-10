module.exports = [
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "proposals",
    "outputs": [
      {
        "name": "subject",
        "type": "address"
      },
      {
        "name": "created",
        "type": "uint32"
      },
      {
        "name": "canceled",
        "type": "bool"
      },
      {
        "name": "msgData",
        "type": "bytes"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
    "signature": "0x013cf08b"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "proposalTime",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
    "signature": "0x184a0ae9"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "first",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
    "signature": "0x3df4ddf4"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0x715018a6"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
    "signature": "0x8da5cb5b"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "isOwner",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
    "signature": "0x8f32d59b"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "size",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function",
    "signature": "0x949d225d"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0xf2fde38b"
  },
  {
    "inputs": [
      {
        "name": "_proposalTime",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor",
    "signature": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "name": "subject",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "msgData",
        "type": "bytes"
      }
    ],
    "name": "NewProposal",
    "type": "event",
    "signature": "0x92a3e91e7044e002eca61ed01441e362200afd3ece797ff6c52ac23e254c1520"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "name": "subject",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "msgData",
        "type": "bytes"
      }
    ],
    "name": "Execution",
    "type": "event",
    "signature": "0xb5e2e91f4481e1c86a926413e0619387b6cfe0561ebcbcac4d17e4a71aa7cfed"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event",
    "signature": "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_subject",
        "type": "address"
      },
      {
        "name": "_msgData",
        "type": "bytes"
      }
    ],
    "name": "propose",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0x9d481848"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_proposalId",
        "type": "uint256"
      }
    ],
    "name": "cancel",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0x40e58ee5"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_token",
        "type": "address"
      }
    ],
    "name": "withdrawTax",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0x4c75b707"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "finalize",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0x4bb278f3"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_slotId",
        "type": "uint256"
      },
      {
        "name": "",
        "type": "address"
      },
      {
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "setSlot",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function",
    "signature": "0xe3c9e9b3"
  }
];