// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.3;
 
contract Tombola {
     
    address payable public owner;

    // Dan 
    // isAdmin modifier 

    struct TombolaStruct {
        string nume;
        uint startDate;  //unix  Timestamp
        bool isRunning; 
        // mapping(address => bool) tickets;
        mapping(uint => address) tickets; // 1->0x12321321 , 2 -> 0x1234
        uint nrOfParticipants; 
        uint price;
        uint prize;
        uint prizePool;
    }

    TombolaStruct public tombola; 

    constructor( ) payable {  // DAN 
        // sa ti dai seama cum sa selectezi owner ul 
      
    }
    
    // DAN 
    function startTombola( parametri startTime , endDate, price, prize) public isAdmin { 
        //require(isAdmin,"You have to be the owner of this contract");
        // check uri 
        // tombola.isRunning == false 
        tombola.startDate = startTime; 

    }


    function buyTicket() public {

    }
    
    //Beni 
    function finalizareTombola() public isAdmin{
        /// oracle un nr random 
        /// prizePool / 70 / 25 / 5
    }


    function withdraw() public isAdmin{
        owner.transfer(address(this).balance);
    }
}
