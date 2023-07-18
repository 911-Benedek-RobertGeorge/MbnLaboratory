pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract FourToken is ERC20, Ownable {
  
  using ECDSA for bytes32;
  uint256 totalCap ;
    constructor(uint256 _totalSupply) ERC20("Four", "FOUR") {

        totalCap = _totalSupply;
    }
         

  function mint(address account, uint256 amount,bytes calldata signature) external  {
       
       
       bytes32 _messageHash = keccak256(abi.encodePacked(msg.sender, amount));

        require(
            owner() == _messageHash.toEthSignedMessageHash().recover(signature),
            "Signer address mismatch."
        );

        super._mint(account, amount);
        
    }
}