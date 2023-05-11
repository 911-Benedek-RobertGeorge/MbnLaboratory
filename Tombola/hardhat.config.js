/**
 * @type import('hardhat/config').HardhatUserConfig
 */

require("dotenv").config();
require("@nomiclabs/hardhat-ethers");

const { API_URL, PRIVATE_KEY } = process.env;
// https://hardhat.org/guides/create-task.html
// task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
// 	const accounts = await hre.ethers.getSigners();

// 	for (const account of accounts) {
// 		console.log(account.address);
// 	}
// });

module.exports = {
	solidity: "0.8.4",
	defaultNetwork: "mumbai",
	networks: {
		hardhat: {},
		sepolia: {
			url: API_URL,
			accounts: [`0x${PRIVATE_KEY}`],
		},
		mumbai: {
			url: API_URL,
			accounts: [`0x${PRIVATE_KEY}`],
		},
	},
};
