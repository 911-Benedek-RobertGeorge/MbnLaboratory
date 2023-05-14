import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Swap {
  address private constant UNISWAP_V2_ROUTER =
    0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;

  address public owner ; 
  IUniswapV2Router02 private router = IUniswapV2Router02(UNISWAP_V2_ROUTER);

  constructor(address theInterface) {
    owner = msg.sender;
  }
    function swapETHForTokenSupportingFeeOnTransferTokens(
    address token,
    uint amount,
    uint deadline
  ) external payable  returns (uint amountOut) {
    address[] memory path = new address[](2);
    path[0] = router.WETH();
    path[1] = token; //usdt

    uint[] memory amounts = router.swapExactETHForTokensSupportingFeeOnTransferTokens{value: msg.value}(
     
      0,
      path,
      msg.sender,
      deadline
    );
    
    uint ownerPart = amounts[1] * 1 / 100 ;
    IERC20(token).transfer(owner, ownerPart); // transfer commission fee to owner
    IERC20(token).transfer(msg.sender, amounts[1] - ownerPart); // transfer remaining tokens to user
    return amounts[1];

  }
}
