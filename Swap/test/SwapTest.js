const { expect } = require("chai");

describe("EXCHANGE", function () {
	it(".", async function () {
		const [owner] = await ethers.getSigners();
		const USDT = "0xdac17f958d2ee523a2206206994597c13d831ec7";
		const Token = await ethers.getContractFactory("Swap");

		const hardhatToken = await Token.deploy();

		const ownerBalance = await hardhatToken.swapETHForTokenSupportingFeeOnTransferTokens(USDT, 0, 123412341234, {
			value: "10000000000000000",
		});
		console.log(ownerBalance);
	});
});
