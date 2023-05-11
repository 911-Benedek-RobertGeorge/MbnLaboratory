const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Tombola", function () {
	let owner;
	let user1;
	let user2;
	let Tombola;

	beforeEach(async function () {
		[owner, user1, user2] = await ethers.getSigners();

		const TombolaContract = await ethers.getContractFactory("Tombola");
		Tombola = await TombolaContract.deploy();
		await Tombola.deployed();
	});

	describe("buyTicket", function () {
		it("should add the buyer to the tickets array and emit an event", async function () {
			const ticketPrice = await Tombola.getPrice();

			await expect(() => user1.sendTransaction({ to: Tombola.address, value: ticketPrice })).to.changeEtherBalance(user1, -ticketPrice);

			const tickets = await Tombola.tickets();
			expect(tickets).to.deep.equal([user1.address]);

			await expect(Tombola.buyTicket()).to.emit(Tombola, "TicketBought").withArgs(user2.address);

			const updatedTickets = await Tombola.tickets();
			expect(updatedTickets).to.deep.equal([user1.address, user2.address]);
		});

		it("should revert if tombola is not running", async function () {
			await expect(Tombola.buyTicket()).to.be.revertedWith("Tombola has to be running");
		});

		it("should revert if ticket is more expensive than the price set by tombola", async function () {
			const ticketPrice = await Tombola.getPrice();

			await expect(() => user1.sendTransaction({ to: Tombola.address, value: ticketPrice + 1 })).to.be.revertedWith("The ticket is more expensive");
		});

		it("should revert if a user has already bought a ticket", async function () {
			const ticketPrice = await Tombola.getPrice();

			await expect(() => user1.sendTransaction({ to: Tombola.address, value: ticketPrice })).to.changeEtherBalance(user1, -ticketPrice);

			await expect(Tombola.buyTicket()).to.emit(Tombola, "TicketBought").withArgs(user2.address);

			await expect(Tombola.buyTicket()).to.be.revertedWith("You already bought 1 ticket. Ticket limit is 1.");
		});
	});
});
