const express = require("express");
const bodyParser = require("body-parser");
const { ethers } = require("ethers");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const Web3Token = require("web3-token");

const { verify } = require("web3-token");

const allowlistedAddresses = [
	"0x90e1D7dfEE6168c8cc4F7Ff3581E7CD149B86FE9",
	"0x9d1aAF184154E9d6Fc7d138Ee560134732427f7E",
	"0x9CF84Fb0578BEBfE067eef28fe7C4b7C66D31ef7",
	"0x90f79bf6eb2c4f870365e785982e1f101e93b906",
	"0x15d34aaf54267db7d7c367839aaf71a00a2c6a65",
	"0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc",
	"0x856198132db00d985fa5ade0b762c7dd6651d60d",
];

const nftRarity = { 1: "130", 2: "301", 3: "50", 4: "250" }; // id : rarity
const add = "0xf5d35429997Bf1977D7c570E81d2Cba17EDAF7f1".toLowerCase;
console.log();
const holders = {
	"0x9cf84fb0578bebfe067eef28fe7c4b7c66d31ef7": 1,
	"0x9d1aaf184154e9d6fc7d138ee560134732427f7e": 2,
	add: 3,
};
// defining the Express app
const app = express();
// defining an array to work as the database (temporary solution)
const ads = [{ title: "Hello, world (again)!" }];

// adding Helmet to enhance your Rest API's security
// app.use(helmet());

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
// app.use(morgan('combined'));

//  log in, sign web3-token
app.get("/check-address", cors(), async (req, res) => {
	console.log(req.params);
	const privateKey = "74ee0505ea39b740c26e72bcc62e2d1687db783f4861c03f57af4a80f029bc98";
	const signer = new ethers.Wallet(privateKey);

	const token = req.headers["authorization"];
	console.log(token);
	const { address, body } = await Web3Token.verify(token);
	console.log("Address", address);
	console.log("body", body);

	// async verifyMessage(messageHash, signedMessage){
	//     const pubkey = ethers.utils.recoverPublicKey(
	//         ethers.utils.arrayify(
	//             ethers.utils.hashMessage(ethers.utils.arrayify(messageHash))
	//         ),
	//         signedMessage
	//     )
	//     const address = ethers.utils.computeAddress(pubkey)
	// }
	let messageHash, signature;

	// Check if selected address is in allowlist
	// If yes, sign the wallet's address
	if (allowlistedAddresses.find((address) => address.toLowerCase() === address.toLowerCase())) {
		console.log("Address is allowlisted! Minting should be possible."); //maybe its not ok to be lowercase

		// Compute message hash
		messageHash = ethers.id(address);
		console.log("Message Hash: ", messageHash);

		// Sign the message hash
		let messageBytes = ethers.getBytes(messageHash);
		signature = await signer.signMessage(messageBytes);
		console.log("Signature: ", signature, "\n");

		res.json({ messageHash, signature });
	} else {
		console.log("Address is not allowlisted!");
		res.send({});
	}
});

///CHECK IF WALLET ACC IN PRESALE LIST
app.get("/hash-signature/:walletAddress", cors(), async (req, res) => {
	console.log(req.params);
	const walletAddress = req.params.walletAddress;
	const privateKey = "74ee0505ea39b740c26e72bcc62e2d1687db783f4861c03f57af4a80f029bc98";
	const signer = new ethers.Wallet(privateKey);

	let messageHash, signature;

	// Check if selected address is in allowlist
	// If yes, sign the wallet's address
	if (allowlistedAddresses.find((address) => address.toLowerCase() === walletAddress.toLowerCase())) {
		console.log("Address is allowlisted! Minting should be possible.");

		// Compute message hash
		messageHash = ethers.id(walletAddress);
		console.log("Message Hash: ", messageHash);

		// Sign the message hash
		let messageBytes = ethers.getBytes(messageHash);
		signature = await signer.signMessage(messageBytes);
		console.log("Signature: ", signature, "\n");

		res.json({ messageHash, signature });
	} else {
		console.log("wtf");
		res.send({});
	}
});

///SIGN TO CALL CLAIM REWARD FUNCTION
app.get("/web3-token/:nftId", cors(), async (req, res) => {
	console.log(req.params);

	const nftId = req.params.nftId;
	const privateKey = "0x32aa1dddb91766408a9cb818d6b4cc4e28eff9fabfc007f5ef9e2e21132fb262"; // beni
	// web3-token
	const signer = new ethers.Wallet(privateKey);

	const token = req.headers["authorization"];
	console.log(token);
	const { address, body } = await Web3Token.verify(token);
	console.log("Address", address);
	console.log("body", body);
	// check if expired

	const walletAddress = address;

	var score = 0;
	var cooldown = 24 * 60 * 60; // 1 day
	if (holders[walletAddress] == nftId) {
		score = nftRarity[nftId];
	} else {
		console.log("The wallet does not have the NFT");
		return;
	}
	if (score < 100) {
		cooldown = cooldown / 3; // once every 8 hours
	}
	if (score > 300) {
		cooldown = cooldown * 2;
	}

	let messageHash, signature;
	const reward = (100 * score) / 100;
	const theId = Number(nftId);
	// Compute message hash
	messageHash = ethers.utils.solidityPack(["address", "uint256", "uint256", "uint256"], [walletAddress, theId, reward, cooldown]);

	console.log("Message Hash: ", messageHash);

	// Sign the message hash
	let messageBytes = ethers.utils.solidityKeccak256(["bytes"], [messageHash]);

	signature = await signer.signMessage(ethers.utils.arrayify(messageBytes));
	console.log("Signature: ", signature, "\n");

	res.json({ reward, cooldown, signature });
});

// starting the server
app.listen(3001, () => {
	console.log("listening on port 3001");
});
