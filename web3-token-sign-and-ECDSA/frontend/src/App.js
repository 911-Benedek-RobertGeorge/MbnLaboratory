import { ethers } from "ethers";
import { useEffect, useState } from "react";
import Web3Token from "web3-token";
import "./App.css";
import contract from "./contracts/ThreeNft.json";

import { sign, verify } from "web3-token";

const contractAddress = "0x580A49363c5d94cEA77098ffbE4B09715341073b"; // old "0xdC52ae55bdd5E1192883dD6df9777E5d2423132f";
const abi = contract.abi;
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

function App() {
	const [currentAccount, setCurrentAccount] = useState(null);
	const [token, setToken] = useState(null);
	const [inputValue, setInputValue] = useState("");
	const [isPresale, setIsPresale] = useState(false);
	const [contract, setContract] = useState();
	const [owner, setOwner] = useState(false);
	const [nftId, setNftId] = useState(0);
	const [price, setPrice] = useState(0);
	const handleInputChange = (e) => {
		const value = e.target.value;

		// Remove any non-digit characters
		const sanitizedValue = value.replace(/\D/g, "");

		// Restrict the value to a range of 1 to 5
		const restrictedValue = Math.max(1, Math.min(sanitizedValue, 5));

		setInputValue(restrictedValue);
	};
	const handleInputId = (e) => {
		const value = e.target.value;
		// Remove any non-digit characters
		const sanitizedValue = value.replace(/\D/g, "");
		setNftId(value);
	};
	const checkWalletIsConnected = async () => {
		const { ethereum } = window;

		if (!ethereum) {
			console.log("Make sure you have Metamask installed!");
			return;
		} else {
			console.log("Wallet exists! We're ready to go!");
		}

		const accounts = await ethereum.request({ method: "eth_accounts" });

		if (accounts.length !== 0) {
			const account = accounts[0];
			console.log("Found an authorized account: ", account);
			setCurrentAccount(account);
		} else {
			console.log("No authorized account found");
		}
	};

	const connectWalletHandler = async () => {
		const { ethereum } = window;

		if (!ethereum) {
			alert("Please install Metamask!");
		}

		try {
			const accounts = await ethereum.request({
				method: "eth_requestAccounts",
			});
			console.log("Found an account! Address: ", accounts[0]);
			setCurrentAccount(accounts[0]);
		} catch (err) {
			console.log(err);
		}
	};

	const mintNftHandler = async () => {
		try {
			console.log(token);
			const response = await fetch(`http://localhost:3001/check-address`, {
				method: "GET",
				headers: {
					Authorization: token,
				},
			});

			const { messageHash, signature } = await response.json();
			console.log("response", messageHash, signature);

			if (!response) {
				return;
			}
			var valueEth = String(price * Number(inputValue));
			console.log(price, inputValue);

			var nftTxn;
			if (isPresale) {
				console.log("Initialize payment presale ");
				nftTxn = await contract.preSale(Number(inputValue), messageHash, signature, {
					value: ethers.utils.parseEther(valueEth),
				});
			} else {
				console.log("Initialize payment mint");
				nftTxn = await contract.mint(Number(inputValue), {
					value: ethers.utils.parseEther(valueEth),
				});
			}
			console.log("Mining... please wait");
			await nftTxn.wait();
			contract &&
				contract.on("PresaleFinalized", (address, quantity) => {
					console.log("Minted : " + quantity + " on address : " + address);
				});
			console.log(`Mined, see transaction: https://sepolia.etherscan.io/tx/${nftTxn.hash}`);
		} catch (err) {
			console.log(err);
		}
	};

	const connectWalletButton = () => {
		return (
			<button onClick={connectWalletHandler} className="cta-button connect-wallet-button">
				Connect Wallet
			</button>
		);
	};

	const loginButton = () => {
		return (
			<button onClick={loginHandler} className="cta-button connect-wallet-button">
				Log in
			</button>
		);
	};

	const loginHandler = async () => {
		const { ethereum } = window;

		if (!ethereum) {
			alert("Please install Metamask!");
		}

		try {
			const accounts = await ethereum.request({
				method: "eth_requestAccounts",
			});
			console.log("Found an account! Address: ", accounts[0]);
			setCurrentAccount(accounts[0]);
		} catch (err) {
			console.log(err);
		}

		try {
			const newToken = await Web3Token.sign(async (msg) => await signer.signMessage(msg), "1d");
			setToken(newToken);
		} catch (err) {
			console.log(err);
		}
	};

	const mintNftButton = () => {
		return (
			<button onClick={mintNftHandler} className="cta-button mint-nft-button">
				{isPresale ? "Presale mint NFT" : "Mint NFT"}
			</button>
		);
	};

	const stopPresale = async () => {
		try {
			await contract._unpause();
		} catch (err) {
			console.log(err);
		}
	};
	useEffect(() => {
		const checkPresale = async () => {
			try {
				const { ethereum } = window;

				if (ethereum) {
					const nftContract = new ethers.Contract(contractAddress, abi, signer);
					setContract(nftContract);
					console.log("check presale");
					var txn = await nftContract.paused();
					var theOwner = await nftContract.owner();
					if (theOwner === signer._address) {
						setOwner(true);
					}

					console.log(theOwner);
					let thePrice = await nftContract.PRICE();

					const valueEth = ethers.utils.formatEther(thePrice.toNumber());
					setPrice(valueEth);
					setIsPresale(txn);
				} else {
					console.log("Ethereum object does not exist");
				}
			} catch (err) {
				console.log(err);
			}
		};
		checkPresale();
		checkWalletIsConnected();
	}, []);

	const claimReward = async () => {
		console.log("Start Claiming");
		try {
			const response = await fetch(`http://localhost:3001/web3-token/${nftId}`, {
				method: "GET",
				headers: {
					Authorization: token,
				},
			});

			const { reward, cooldown, signature } = await response.json();
			console.log("response", reward, cooldown, signature);

			if (!response) {
				console.log("NO response from server");
				return;
			}
			console.log("Call Claim reward SC");
			const claimTx = contract.claimReward(Number(nftId), Number(reward), Number(cooldown), signature, { from: currentAccount });

			console.log("Reward claimed" + (await claimTx));
		} catch (err) {
			console.log("SOMETHING FAILED");
			console.log(err);
		}
	};

	return (
		<div className="main-app">
			{owner && isPresale && (
				<button onClick={stopPresale} className="cta-button">
					Stop presale
				</button>
			)}
			<div className="container">
				<div className="input-container">
					<h1>Assignment 3</h1>
					<h3>Price : {price} Eth</h3>
					<label htmlFor="my-input">How many nfts?</label>

					<input type="text" className="round-input" id="my-input" value={inputValue} onChange={handleInputChange} pattern="[1-5]" maxLength="1" />

					{/* {currentAccount ? mintNftButton() : connectWalletButton()} */}

					{token ? mintNftButton() : loginButton()}

					<label for="my-input1">Nft id?</label>
					<input type="text" class="round-input" id="my-input1" value={nftId} onChange={handleInputId} />
					<button className="claim-reward-button" onClick={claimReward}>
						Claim reward
					</button>
				</div>
			</div>
		</div>
	);
}

export default App;
