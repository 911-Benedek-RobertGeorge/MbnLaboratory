import { ethers } from "ethers";
import React, { useState } from "react";
import "./App.css";
import { access } from "fs";
const { abi } = require("./Staking.json");

const { tokenABI } = require("./XCoin.json");

var signer;
var account;
var provider;
if (typeof window.ethereum !== "undefined" || typeof window.web3 !== "undefined") {
	// Web3 browser user detected. You can now use the provider.
	const accounts = await window.ethereum.enable();
	// const curProvider = window['ethereum'] || window.web3.currentProvider

	provider = new ethers.providers.Web3Provider(window.ethereum);

	console.log("accounts: ", accounts);
	console.log("provider: ", provider);
	account = accounts[0];
	signer = provider.getSigner(account);
}
const contractAddress = "0x98223247A13109f37C8118Ca669C18f41c89A8d8";
const tokenAddress = "0x1338f082E86Add5ED230AE308626997DC1c56Fe7";

console.log(abi);
const contract = new ethers.Contract(contractAddress, abi, signer);
const tokenContract = new ethers.Contract(tokenAddress, tokenABI, signer);

console.log(contract.address);

let contractOwnerAddress = 0;
let signerAddress = 0;
let signerStaked = 0;
let signerReward = 0;
let ownerAuth = false;

async function getSignerAddress() {
	signerAddress = signer._address;
}

async function getContractOwnerAddress() {
	contractOwnerAddress = 0;
	//contractOwnerAddress = await contract.m_owner();
}

async function getSignerMoney() {
	// time in seconds
	signerStaked = 20;
	signerReward = 5;
}

async function buyToken(_amount) {
	const tx = {
		from: account,
		to: tokenAddress,
		value: ethers.utils.parseEther(_amount),
	};
	const transaction = await signer.sendTransaction(tx);
	provider.sendTransaction(
		tx.then((transaction) => {
			console.log(transaction);
			alert("send Finished");
		})
	);
}

async function stake() {
	const amount = 10001;
	const approval = await tokenContract.approve(contractAddress, amount); // approve the spending of the contract
	console.log("APPROVAL :");
	console.log(approval);
	const tx = await contract.stake(amount);
	tx.wait();
	console.log(tx.receipt);
}

async function withdrawStake() {
	const tx = await contract.withdrawStake(1111);
	tx.wait();
	console.log(tx.receipt);
}

async function claimRewards() {
	return 0;
}

function StakingContract(props) {
	return (
		<div className="stake-container">
			<div className="stake-text">
				<h3>Staked: {signerStaked}</h3>
				<h3>Rewards: {signerReward}</h3>
			</div>
			<div className="stake-buttons">
				<button className="btn primary-btn" onClick={() => stake()}>
					Stake
				</button>
				<button className="btn secondary-btn" onClick={() => withdrawStake()}>
					Withdraw stake
				</button>
				<button className="btn secondary-btn" onClick={() => claimRewards()}>
					Claim rewards
				</button>
				<button className="btn secondary-btn" onClick={() => buyToken("0.01")}>
					Buy XCoin
				</button>
			</div>
		</div>
	);
}

class App extends React.Component {
	componentDidMount() {
		// before we render we do this
		this.setState({ loading: true });
		getContractOwnerAddress().then(() => {
			getSignerAddress().then(() => {
				if (signerAddress == contractOwnerAddress) {
					ownerAuth = true;
				}
			});
		});
		getSignerMoney().then(() => {
			// while loading is true we won't render
			this.setState({ loading: false });
		});
	}
	render() {
		return (
			<div className="App">
				<div className="container">
					<h1 className="head-text">Stake!</h1>
					<StakingContract />
				</div>
			</div>
		);
	}
}

export default App;
