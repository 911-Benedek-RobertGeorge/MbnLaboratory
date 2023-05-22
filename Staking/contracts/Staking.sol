// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import './XCoin.sol';

contract Staking {

    IERC20 public xCoinContract ;

    mapping(address => uint) public staked;
    mapping(address => uint) public rewards;
    address[] public users; 
    uint public currentRewards;
    uint public totalStaked;


    
    constructor(address payable tokenAddress){
        xCoinContract = XCoin(tokenAddress);
    }
    
    // make a function to verify is a new address is in users vector

    function stake(uint _amount) public {
        // approve (give allowance ) call from the Xcoin contract 
    require(xCoinContract.transferFrom(msg.sender, address(this), _amount), "Transfer failed");

        if(currentRewards > 0){
            shareRewards();
        }

        if(verifyUser(msg.sender)){ 
            users.push(msg.sender);
        }   
        staked[msg.sender] += _amount;
        totalStaked += _amount;
    }

    function verifyUser(address origin) internal view returns(bool) {
        for(uint i = 0; i < users.length; ++i){
            if(users[i] == origin) return false;
        }
        return true;
    }


    function shareRewards() internal
    {
        uint amountStaked;
        uint personalReward;
        address user ; 
        for(uint i = 0; i < users.length; ++i){
            user = users[i];
            amountStaked = staked[user];
            personalReward =  currentRewards * amountStaked  / totalStaked ; // check this formula
            rewards[user] += personalReward;
        }
        currentRewards = 0;
    }

    function withdrawStake(uint _amount) public{
        require(staked[msg.sender] >= _amount, "You have less staked.");
          
        xCoinContract.transfer(msg.sender,_amount);
        staked[msg.sender] -= _amount;
        totalStaked -= _amount;
    }
     
    function claim() public{
        require(rewards[msg.sender] > 0);
         
        xCoinContract.transfer(msg.sender,rewards[msg.sender]);
        rewards[msg.sender] = 0;
    }
 
    function getLoan() public { 
        currentRewards = 1000;
    }
    
 
}
    

