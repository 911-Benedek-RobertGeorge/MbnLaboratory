import Web3 from "web3";

const contractAddress = "0xf614BFFB39d754f6F1c5eA177A0FDD55B053FE7B";

///console.log("THE ADDRESS " + contractAddress);
const { abi } = require("../contracts/Tombola.json");

//console.log("THE ABI " + abi);
let account = "";
let web3 = undefined;
let contract = undefined;

const getWeb3 = async () => {
	// Modern dapp browsers
	if (web3 !== undefined) return web3;
	if (window.ethereum) {
		web3 = new Web3(window.ethereum);
		try {
			// Request account access if needed
			await window.ethereum.enable();
			return web3;
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	// Legacy dapp browsers
	else if (window.web3) {
		// Use Mist/MetaMask's provider
		web3 = window.web3;
		console.log("Injected web3 detected.");
		return web3;
	}
	// Fallback to localhost; use dev console port by default...
	else {
		const provider = new Web3.providers.HttpProvider("http://127.0.0.1:8545");
		web3 = new Web3(provider);
		console.log("No web3 instance injected, using Local web3.");
		return web3;
	}
};

const getContract = async () => {
	try {
		if (contract === undefined) {
			web3 = await getWeb3();
			contract = new web3.eth.Contract(abi, contractAddress);
		}

		return contract;
	} catch (error) {
		console.error(error);
		return null;
	}
};

const getContractAddress = () => {
	return contractAddress;
};

const getContractABI = () => {
	return abi;
};

const getAccount = async () => {
	if (account === "") {
		const accounts = await web3.eth.getAccounts();
		account = accounts[0];
	}
	return account;
};

export { getWeb3, getContract, getContractAddress, getContractABI, getAccount };
