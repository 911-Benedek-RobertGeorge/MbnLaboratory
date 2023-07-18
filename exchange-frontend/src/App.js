import CheckIcon from "@mui/icons-material/Check";
import { TextField } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import { ethers } from "ethers";
import React, { useState } from "react";
import "./App.css";
const { abi } = require("./Staking.json");
const { tokenABI } = require("./XCoin.json");

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const contractAddress = "0xe12088d6Db47716018b9Fe0720341d1488064Ae3";
const tokenAddress = "0x1338f082E86Add5ED230AE308626997DC1c56Fe7";

const contract = new ethers.Contract(contractAddress, abi, signer);
const tokenContract = new ethers.Contract(tokenAddress, tokenABI, signer);

let contractOwnerAddress = 0;
let signerAddress = 0;
let signerStaked = 0;
let signerReward = 0;
let ownerAuth = false;
let xcoinbalance = 0;

async function getSignerAddress() {
	signerAddress = await signer.getAddress();
}

async function getContractOwnerAddress() {
	contractOwnerAddress = 0;
	//contractOwnerAddress = await contract.m_owner();
}

async function getSignerMoney() {
	if (!isUserInList()) {
		return;
	}
	signerStaked = String(await contract.staked(signerAddress));
	signerReward = String(await contract.rewards(signerAddress));
}

async function getBalance() {
	return await tokenContract.balanceOf(signerAddress);
}

async function isUserInList() {
	return !(await contract.verifyUser(signerAddress));
}

async function buyToken(_amount) {
	const tx = {
		from: signerAddress,
		to: tokenAddress,
		value: ethers.utils.parseEther(_amount),
	};
	await signer.sendTransaction(tx).then((transaction) => {
		alert("Transaction approved.");
	});
}

async function stake(amount, setLoading, setfinished) {
	setfinished(false);
	setLoading(true);
	const approval = await tokenContract.approve(contractAddress, amount); // approve the spending of the contract
	await approval.wait();
	const tx = await contract.stake(amount);
	await tx.wait();
	setLoading(false);
	setfinished(true);
}

async function withdrawStake(amount) {
	const tx = await contract.withdrawStake(amount);
	tx.wait();
	console.log(tx.receipt);
}

async function claimRewards() {
	const tx = await contract.claim();
	tx.wait();
	console.log(tx.receipt);
}

function CircularDeterminate() {
	const [loading, setLoading] = React.useState(false);
	const [finished, setfinished] = React.useState(false);
	const [value, setValue] = useState(0);
	const handleModifyState = async (value) => {
		await stake(value, setLoading, setfinished);
	};
	return (
		<>
			<div className="row-flex-div">
				<input type="number" className="value-input stake-input" value={value} onChange={(e) => setValue(e.target.value)} />
				<button className="btn primary-btn" onClick={() => handleModifyState(value)}>
					Stake
				</button>
			</div>
			{loading && (
				<Stack spacing={2} direction="row">
					<CircularProgress style={{ color: "#e7e7e7" }} />
				</Stack>
			)}
			{finished && <CheckIcon style={{ color: "#e7e7e7" }} />}
		</>
	);
}

function StakingContract(props) {
	const [withdrawAmount, setWithdrawAmount] = useState(0);
	const [buy, setBuy] = useState(0);
	return (
		<div className="stake-container">
			<div className="stake-text">
				<h3>Staked: {signerStaked} XCOIN</h3>
				<h3>Rewards: {signerReward} XCOIN</h3>
			</div>
			<div className="stake-buttons">
				<CircularDeterminate></CircularDeterminate>
				<div className="row-flex-div">
					<input
						type="number"
						className="value-input withdraw-stake-input"
						value={withdrawAmount}
						onChange={(e) => setWithdrawAmount(e.target.value)}
					/>
					<button className="btn secondary-btn" onClick={() => withdrawStake(withdrawAmount)}>
						Withdraw stake
					</button>
				</div>
				<button className="btn secondary-btn" onClick={() => claimRewards()}>
					Claim rewards
				</button>
				<div className="row-flex-div">
					<input type="number" className="value-input withdraw-stake-input" placeholder="ETH" onChange={(e) => setBuy(e.target.value)} />
					<button className="btn secondary-btn" onClick={() => buyToken(buy)}>
						Buy XCoin
					</button>
					{<h4>Balance: {xcoinbalance}</h4>}
				</div>
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
				getBalance();
				getSignerMoney().then(() => {
					// while loading is true we won't render
					this.setState({ loading: false });
				});
			});
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
