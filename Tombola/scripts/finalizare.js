// interact.js
const hre = require("hardhat");

const API_KEY = process.env.API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const contractJson = require("../artifacts/contracts/Tombola.sol/Tombola.json");

console.log("Provider : ");
// Provider
const alchemyProvider = new hre.ethers.providers.AlchemyProvider("maticmum", API_KEY);
//console.log(alchemyProvider);

console.log("Signer : ");
// Signer
const signer = new hre.ethers.Wallet(PRIVATE_KEY, alchemyProvider);
console.log(signer.address);

// Contract
console.log("Contract Address : ");
const Tombola = new hre.ethers.Contract(CONTRACT_ADDRESS, contractJson.abi, signer);
console.log(Tombola.address);

async function main() {
	const tx = await Tombola.finalizareTombola();
	await tx.wait();
	console.log(tx);
}

main();
