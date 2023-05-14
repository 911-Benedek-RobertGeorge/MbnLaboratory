/ SPDX-License-Identifier: MIT
pragma solidity ^0.7.3;

import '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol';

contract Exchange {
    address private constant UNISWAP_V2_ROUTER =
        0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;

    address public constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address public constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address public constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;

    IUniswapV2Router02 private router = IUniswapV2Router02(UNISWAP_V2_ROUTER);
   //  IERC20 private weth = IERC20(WETH);
   //  IERC20 private dai = IERC20(DAI);



    // Swap WETH to USDC
    function swapSingleHopExactAmountOut(
    ) external payable returns (uint amountOut) {
      //   weth.transferFrom(msg.sender, address(this), amountInMax);
      //   weth.approve(address(router), amountInMax);

        address[] memory path;
        path = new address[](2);
        path[0] = router.WETH();
        path[1] = USDC;
        address sender = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;

      //   _approve(sender, address(uniswapV2Router02), amount);
        uint[] memory amounts = router.swapExactETHForTokens{value: msg.value}(
            0,
            path,
            sender,
            1686498662
        ); 
      //   IERC20(USDC).transfer(sender, amounts[1]);
        return amounts[1];
    }
}