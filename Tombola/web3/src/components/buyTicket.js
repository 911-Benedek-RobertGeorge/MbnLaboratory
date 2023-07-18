import React, { useEffect, useState } from "react";
import { getContract, getAccount, getContractAddress } from "../utils/utils";
import Web3 from "web3";
const { abi } = require("../contracts/Tombola.json");
const address = "0xf614BFFB39d754f6F1c5eA177A0FDD55B053FE7B";

const BuyTicket = () => {
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const web3 = new Web3("https://polygon-mumbai.g.alchemy.com/v2/FHamUV62HuF80ZQFQKBWzBlodJBYbvDN");

	const buyTicketHandle = async () => {
		setLoading(true);

		try {
			await window.ethereum.request({ method: "eth_requestAccounts" });

			// Get the connected account
			const web3 = new Web3(window.ethereum);
			const accounts = await web3.eth.getAccounts();
			const account = accounts[0];

			const contract = new web3.eth.Contract(abi, address);

			console.log("ADDRESS : " + address);
			console.log("ACCOUNT: " + account);
			const result = await contract.getState().call();

			console.log("Transaction hash:", result.transactionHash);
			console.log(result);

			const tx = await web3.eth.sendTransaction({
				from: account,
				to: address,
				value: 1000000000000000,
				gas: 2000000,
			});

			console.log(tx);
			setSuccess(true);
		} catch (e) {
			console.log("An error occurred while registering your email" + e);
		}

		setLoading(false);
	};

	return (
		<div>
			<button onClick={buyTicketHandle} className="">
				{loading ? "Loading" : "Buy Ticket"}
			</button>
			<p>{success && "SUCCESS"}</p>
		</div>
	);
};

export default BuyTicket;
