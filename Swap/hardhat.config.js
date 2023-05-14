require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	solidity: "0.8.18",
	networks: {
		hardhat: {
			forking: {
				url: "https://mainnet.infura.io/v3/75ddfe5a9a3a410bb719bf36f2c6f2f5",
				blockNumber: 17238696,
			},
		},
	},
};
