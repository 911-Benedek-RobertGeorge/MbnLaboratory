// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import './XCoin.sol';

contract Staking {

    XCoin public xCoinContract ;

    uint interestRate;

    mapping(address => uint) public staked;
    mapping(address => uint) public rewards;
    address[] public users; 
    uint public currentRewards;
    uint public totalStaked;
    
    struct Loan {
            address borrower;
            uint256 loanAmount;
            uint256 rate;
            uint256 repaymentPeriod;
            uint256 collateralAmount;
            bool isActive;
        }

    mapping(address => uint256) public collateralBalancesETH;
    mapping(address => Loan) public loans; //1 loan per person 
 
    address public lender;
    uint256 public totalCollateral;

    uint256 public liquidationRatio; 

    modifier onlyLender() {
        require(msg.sender == lender, "Only the lender can call this function.");
        _;
    }

    constructor(address payable tokenAddress){
        lender = msg.sender;
        xCoinContract = XCoin(tokenAddress);
        interestRate = 10;
    }
    
    function setInterestRate(uint _rate) public onlyLender {
        interestRate = _rate;
    }

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

    function verifyUser(address origin) public view returns(bool) {
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
        staked[msg.sender] -= _amount;
        totalStaked -= _amount;  
        xCoinContract.transfer(msg.sender,_amount);
       
    }
     
    function claim() public{
        require(rewards[msg.sender] > 0);
        rewards[msg.sender] = 0;
        xCoinContract.transfer(msg.sender,rewards[msg.sender]);
        
    }
    
    function addCollateral() payable public {
        require(msg.value > 0,  "You have to send some eth");
        collateralBalancesETH[msg.sender] += msg.value;
    }

    function withdrawCollateral(uint _amount) public{
        require(collateralBalancesETH[msg.sender] > _amount, "You have less collateral");
        
        //require(payable(msg.sender).transfer(_amount) ,"Transfer has failed");
        payable(msg.sender).transfer(_amount);
        collateralBalancesETH[msg.sender] -= _amount;
    }

    /// get XCoin loan based on ETH collateral
    function requestLoan(uint256 _loanAmount,  uint256 _repaymentPeriod ) external { 
        uint oneYear = 60 * 60 * 24 * 7 * 4 * 12;
        require(_repaymentPeriod < oneYear, "The period must be less than a year");  // less than a year
        uint interest = interestRate * _loanAmount; 
        interest = interest + interest * (_repaymentPeriod / oneYear); // add some extra fee related to time 
        uint collateralAmountRequired = (_loanAmount + interest) * xCoinContract.tokenPrice(); // get value in eth
        require(collateralBalancesETH[msg.sender] >=  collateralAmountRequired, "Insufficient collateral.");
        
        // Lock collateral
        collateralBalancesETH[msg.sender] -= collateralAmountRequired;
        totalCollateral += collateralAmountRequired;

        require(xCoinContract.transfer(msg.sender,_loanAmount)); //send Xcoin to the user

        loans[msg.sender] = Loan({
            borrower: msg.sender,
            loanAmount: _loanAmount,
            rate: interestRate,
            repaymentPeriod: _repaymentPeriod,
            collateralAmount: collateralAmountRequired,
            isActive: true
        });
    
    }

    function repayLoan() public { 
        require(loans[msg.sender].loanAmount > 0, "You dont have any loans");
        uint oneYear = 60 * 60 * 24 * 7 * 4 * 12;

        Loan storage loan = loans[msg.sender];
        uint interest = interestRate * loan.loanAmount; 
        interest = interest + interest * (loan.repaymentPeriod / oneYear);
        if(loan.repaymentPeriod > block.timestamp){
            interest = interest * 2; // for delay of payment 
        }

        collateralBalancesETH[msg.sender] += loan.collateralAmount; // relase collateral
        totalCollateral -= loan.collateralAmount;

        // give allowance first 
        require(xCoinContract.transferFrom(msg.sender, address(this), loan.loanAmount + interest), "Failed Transfer");
     
    }
    
    function liquidate() public {
        
    }
     receive() payable external{
        addCollateral();
    }

     
    
    
}
    

