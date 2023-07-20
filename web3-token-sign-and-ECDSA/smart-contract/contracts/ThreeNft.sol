// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./RewardToken.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract ThreeNft is ERC721A, Ownable, Pausable {
	using SafeMath for uint256;

	uint256 public constant MAX_SUPPLY = 10000;
	uint256 public constant PRICE = 0.005 ether;
	uint256 public constant MAX_PER_MINT = 5;

	IERC20 rewardToken;

	string public baseTokenURI;

	uint256 private mintedNfts;

	uint256 private rewardAmount;
	uint256 private claimCooldown;

	mapping(bytes => bool) public signatureUsed;
	mapping(address => mapping(uint256 => uint256)) private lastClaimTimes; //address -> tokenID -> timestamp when claimed

	constructor(string memory baseURI, address contractTokenAddress) ERC721A("Team Three NFT", "THREENFT") {
		baseTokenURI = baseURI;
		rewardToken = IERC20(contractTokenAddress);
		claimCooldown = 60 * 60 * 24; // one day
		rewardAmount = 100;
		_pause();
	}

	//add the web3 token to check if the address is of the owner and add an address argument or idk
	function claimReward(uint256 _tokenId, uint256 _reward, uint256 _cooldown, bytes calldata signature) external {
		// address nftOwner = ownerOf(_tokenId);
		// require(nftOwner == msg.sender, "Only the NFT owner can claim the reward"); //solvved in b ackend logic

		bytes32 _hash = keccak256(abi.encodePacked(msg.sender, _tokenId, _reward, _cooldown));
		bytes32 message = ECDSA.toEthSignedMessageHash(_hash);

		address receivedAddress = ECDSA.recover(message, signature);

		require(owner() == receivedAddress, "Signer address missmatch");
		// require(recoverSignerClaimReward(_reward, _cooldown, hash, signature) == owner(), "The attributes or the signer might be different"); // should be same if sig and attributes are the same

		require(!signatureUsed[signature], "Signature has already been used.");
		signatureUsed[signature] = true;

		uint256 lastClaimTime = lastClaimTimes[msg.sender][_tokenId]; /// maybe add this to the backend logic too
		if (lastClaimTime > 0) require(block.timestamp >= lastClaimTime + _cooldown, "Cooldown period has not passed");

		// not sure if required, maybe ill get an error from token contract however
		require(rewardToken.balanceOf(address(this)) >= _reward, "Insufficient reward balance in the contract");

		lastClaimTimes[msg.sender][_tokenId] = block.timestamp;
		require(rewardToken.transfer(msg.sender, _reward), "Transfer was not succesful");
	}

	function _baseURI() internal view virtual override returns (string memory) {
		return baseTokenURI;
	}

	function mint(uint256 quantity) external payable whenNotPaused {
		require(quantity > 0, "Quantity cannot be zero");
		uint256 totalMinted = totalSupply();
		require(quantity <= MAX_PER_MINT, "Cannot mint that many at once");
		require(totalMinted.add(quantity) < MAX_SUPPLY, "Not enough NFTs left to mint");
		require(PRICE * quantity <= msg.value, "Insufficient funds sent");

		mintedNfts += quantity;
		_safeMint(msg.sender, quantity);
	}

	function preSale(uint256 quantity, bytes32 hash, bytes memory signature) public payable {
		uint256 totalMinted = mintedNfts;

		require(totalMinted.add(quantity) <= MAX_SUPPLY, "Not enough NFTs left!");
		require(quantity > 0 && quantity <= MAX_PER_MINT, "Cannot mint specified number of NFTs.");
		require(msg.value >= PRICE.mul(quantity), "Not enough ether to purchase NFTs.");
		require(recoverSigner(hash, signature) == owner(), "Address is not allowlisted");
		require(!signatureUsed[signature], "Signature has already been used.");

		mintedNfts += quantity;
		_safeMint(msg.sender, quantity);

		signatureUsed[signature] = true;
	}

	function recoverSigner(bytes32 hash, bytes memory signature) public pure returns (address) {
		bytes32 messageDigest = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
		return ECDSA.recover(messageDigest, signature);
	}

	function withdraw() public onlyOwner {
		uint256 balance = address(this).balance;

		payable(msg.sender).transfer(balance);
	}

	function pause() public onlyOwner {
		_pause();
	}

	function unpause() public onlyOwner {
		_unpause();
	}

	function claimRewards() public {}
}
