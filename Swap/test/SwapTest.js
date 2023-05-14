const { expect } = require("chai");

describe("EXCHANGE", function () {
	it(".", async function () {
		const [owner] = await ethers.getSigners();

		const Token = await ethers.getContractFactory("Exchange");

		const hardhatToken = await Token.deploy();

		const ownerBalance = await hardhatToken.swapSingleHopExactAmountOut({
			value: "10000000000000000",
		});
		console.log(ownerBalance);
	});
});
