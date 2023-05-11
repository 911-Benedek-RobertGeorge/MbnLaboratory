async function main() {
	const Tombola = await ethers.getContractFactory("Tombola");

	// Start deployment, returning a promise that resolves to a contract object
	const tombola = await Tombola.deploy();
	console.log("Contract deployed to address:", tombola.address);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
