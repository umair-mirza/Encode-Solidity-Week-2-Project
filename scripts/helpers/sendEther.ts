// import ethers.js
const ethers = require('ethers')// network: using the Rinkeby testnet
let network = 'ropsten'// provider: Infura or Etherscan will be automatically chosen
let provider = ethers.getDefaultProvider(network)// Sender private key: 
// correspondence address 0xb985d345c4bb8121cE2d18583b2a28e98D56d04b
let privateKey = '0x27be643901baa2e6ffc088d5332179b423d3b1f42cee7c5bfd7c0950adb68d56'// Create a wallet instance
let wallet = new ethers.Wallet(privateKey, provider)// Receiver Address which receives Ether
let receiverAddress = '0x32B3fd7A2b878e12d1B9502383c074a7E69AD7e0'// Ether amount to send
let amountInEther = '2'// Create a transaction object
let tx = {
    to: receiverAddress,
    // Convert currency unit from ether to wei
    value: ethers.utils.parseEther(amountInEther)
}// Send a transaction
wallet.sendTransaction(tx)
.then((txObj: any) => {
    console.log('txHash', txObj.hash)
    // => 0x9c172314a693b94853b49dc057cf1cb8e529f29ce0272f451eea8f5741aa9b58
    // A transaction result can be checked in a etherscan with a transaction hash which can be obtained here.
})