// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import './XCoin.sol';

contract Staking {

    IERC20 public xCoinContract ;

    uint currentROI; 
    uint stakePeriod = 60 * 60 * 24 * 7 * 4 * 3 ;
    // change ROI  get set 
    uint totalStakes = 0 ;
    uint rewardRate ; 
    struct Stake{
        uint id; 
        uint amount;
        //uint roi; // return of investment 
        address owner; 
        uint endPeriod;
    }

    struct credit{
        uint amount;
        uint dobanda; 
    }   
    
    Stake[] stakes; 

    mapping(address => uint) rewards;
    mapping (address => Stake[]) public staked;

    constructor(address payable tokenAddress,uint _rewardRate, uint _stakingPeriod){
        xCoinContract = XCoin(tokenAddress);
        rewardRate = _rewardRate;
        stakePeriod = _stakingPeriod;
        /// staking period
        /// reward rate = 0.05 
    }

    function stake(uint _amount) public {
        // approve (give allowance )
        require( xCoinContract.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        require(xCoinContract.balanceOf(msg.sender) >= _amount, "Not enough balance!");
        Stake memory currentStake = Stake(totalStakes,_amount,currentROI,msg.sender,block.timestamp + lockPeriod);
        staked[msg.sender].push(currentStake);
        ++totalStakes;
    }

    function withdrawStake(uint index) public{
        require(staked[msg.sender].length > index, "You have less staked.");
        require(staked[msg.sender][index].endPeriod <= block.timestamp,"You have to wait longer.");
        // save roi ? ? 
        xCoinContract.transfer(msg.sender,staked[msg.sender][index].amount);
        delete staked[msg.sender][index]; 
    }
     
    function claim() public{
        require(rewards[msg.sender] > 0);
        // calculate the reward ;
        xCoinContract.transfer(msg.sender,rewards[msg.sender]);
    }


    // Alex 
     /// 1. Foloseste banii pusi la staking pentru a da credite altor utilizatori 
     // (aceste credite pot fi credite cu garantii sau flash loans... la alegere)

    function applyForCredit() public { 

    }
    
function calculateTotalRewards(address _account) internal view returns (uint256) {
        uint256 totalRewards = 0;
        Stake[] storage userStakes = stakes[_account];

        for (uint256 i = 0; i < userStakes.length; i++) {
            Stake memory userStake = userStakes[i];
            uint256 stakingDuration = block.timestamp - userStake.timestamp;
            uint256 reward = (userStake.amount * rewardRate * stakingDuration) / stakingPeriod;
            totalRewards += reward;
        }
        return totalRewards;
    }
}
    // banii totali 





 /// user  = > credit - 2 luni  
// user inapoiaza 
// aici calculam rewardu pt fiecare participant in parte 


