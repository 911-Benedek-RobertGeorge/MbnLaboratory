// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RewardToken is ERC20 {
	constructor() ERC20("DevToken", "DVT") {
		_mint(msg.sender, 10000 * 10 ** 18);
	}
}
