// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.3;
 
contract Tombola {          /// TODO verify it on etherscan
     
    address payable public owner;

    // Dan 
    // isAdmin modifier 

    struct TombolaStruct {
        string nume;
        uint startTime;  //unix  Timestamp
        uint endTime;
        bool isRunning; 
        // mapping(address => bool) tickets;
        address[] tickets; //  made an array so it will be reseted when delete the struct, the mappings cant be deleted
         // uint nrOfParticipants;  // delete bcs tickets.length
        uint price;
        // uint prizePool;  // we can delete this bcs is equal to nrOfParticipants*price
    }

    TombolaStruct public tombola; 

    function getPrice() public returns(uint) {
        return tombola.price;
    }
    function getPrizePool() public returns(uint){
        return tombola.tickets.length * tombola.price;
    }

    constructor() payable {  // DAN 
        // sa ti dai seama cum sa selectezi owner ul 
      
    }
    
    // DAN 
    function startTombola( parametri startTime , endDate, price, prize) public isAdmin { 
        //require(isAdmin,"You have to be the owner of this contract");
        // check uri 
        // tombola.isRunning == false 
        tombola.startDate = startTime;  

    }

    //beni
    function buyTicket() internal {
         //cand apasa pe buton o sa trebuiasca sa i dea allowance la contract 
        require(tombola.isRunning == true, "Tombola has to be running");
        require(msg.value == tombola.price, "The ticket is more expensive");
        for(uint i = 0; i < tombola.tickets.length; ++i) {
            if(tombola.tickets[i] == msg.sender){
                revert("You already bought 1 ticket. Ticket limit is 1.");
            }
        }
        tombola.tickets.push(msg.sender);

    }

    receive() external payable {
        buyTicket();
    }
    //Beni 
    function finalizareTombola() public isAdmin returns(address, address){
        //maybe add an oracle for random number 
        require(block.timestamp > tombola.endTime , "The Tombola is still running.");
        require(tombola.nrOfParticipants > 2, "Not enough participants.");
        uint nrOfParticipants = tombola.tickets.length;
        uint prizePool = tombola.price * tombola.nrOfParticipants;
        uint randNr = uint (keccak256(abi.encodePacked (msg.sender, block.timestamp,  nrOfParticipants))) % nrOfParticipants;
        
        address winner1 = tombola.tickets[randNr];
        randNr = uint (keccak256(abi.encodePacked (msg.sender, block.timestamp, randNr))) % nrOfParticipants;
        uint prize1 = (prizePool / 100 ) * 70 ; //overflow safe

        payable(winner1).transfer(prize1);

        address winner2 = tombola.tickets[randNr];
        uint prize2 = (prizePool / 100 ) * 25 ;  

        payable(winner2).transfer(prize2);

        delete tombola;  // reset the tombola to be ready for the next one

        // maybe emit an event
        return (winner1,winner2);

    }


    function withdraw() public isAdmin{
        require(tombola.isRunning == false, "Can't withdraw while an tombola is running");
        owner.transfer(address(this).balance);
    }
}
