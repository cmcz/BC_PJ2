# ERC721-code-template
Code template for a ERC721 Dapp.

Project: Build CryptoStar Dapp on Ethereum

* ERC-721 Token Name : "Starry Coin"
* ERC-721 Token Symbol "STR"
* Version of the Truffle and OpenZeppelin used:
    * Truffle v5.11.5 (core: 5.11.5)
    * @openzeppelin/contracts@4.5.0
    * Node v20.13.1

* Token Address on the sepolia Network
https://sepolia.etherscan.io/address/0x31dfadff177b0281a3d23f7afaec1f1ec0061cd0

# Requirements

```json
    "@openzeppelin/contracts": "^4.5.0",
    "@truffle/hdwallet-provider": "^2.0.4",
    "web3": "^1.7.1",
    "webpack-dev-server": "^4.7.4"
```

```
    Truffle v5.5.3
    Solidity Compiler:  0.8.12+commit.f00d7308
```

# Install packages

```bash
    cd app
    npm install 
```

# Truffle contracts
```bash
   truffle develop
   compile
   migrate --reset
   test
```

# Run Dapp
```bash
   cd app
   npm run dev
```