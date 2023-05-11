// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.3;
 
contract Tombola {          /// TODO verify it on etherscan
     
    address payable public owner;

     
    modifier isAdmin(){
        require(  msg.sender  == owner, "Only owner is allowed to do this!");
        _;
    }

    struct TombolaStruct {
        string name;
        uint startTime;  //unix  Timestamp
        bool isRunning; 
        address[] tickets; //  made an array so it will be reseted when delete the struct, the mappings cant be deleted
        uint price;
    }

    TombolaStruct public tombola; 

    function getState() public view returns(bool) {
        return tombola.isRunning;
    }

    function getPrice() public view returns(uint) {
        return tombola.price;
    }

    function getPrizePool() public view returns(uint){
        return tombola.tickets.length * tombola.price;
    }



    constructor(){  
        owner = payable(msg.sender);
    }
    
   
    function startTombola(string memory _name, uint _startTime, uint  _ticketPrice) public isAdmin { 
        require(tombola.isRunning == false,"THere already is a tombola runnnig");

        delete tombola;  // reset the tombola to be ready for the next one
        tombola.name = _name;
        tombola.startTime = _startTime;  
        tombola.price = _ticketPrice;
        tombola.isRunning = true;
    }

    
    function buyTicket() internal {
         //cand apasa pe buton o sa trebuiasca sa i dea allowance la adresa  contract 
        require(tombola.isRunning == true, "Tombola has to be running");
        require(msg.value == tombola.price, "Check the ticket price. Send the exact amount.");
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


    event FinalizareTombola(address winner1, address winner2);

    function finalizareTombola() public isAdmin returns(address, address){
        //maybe add an oracle for random number 
        if(tombola.tickets.length == 0) 
        {
            delete tombola;
        
        }else{
        // require(block.timestamp > tombola.endTime , "The Tombola is still running.");
        uint nrOfParticipants = tombola.tickets.length;
        require(nrOfParticipants > 2, "Not enough participants.");
        
        uint prizePool = tombola.price * nrOfParticipants;

        uint randNr = uint (keccak256(abi.encodePacked (msg.sender, block.timestamp,  nrOfParticipants))) % nrOfParticipants;
        address winner1 = tombola.tickets[randNr];
        uint prize1 = (prizePool / 100 ) * 70 ; //overflow safe
        payable(winner1).transfer(prize1);

        uint randNr2 = uint (keccak256(abi.encodePacked (msg.sender, block.timestamp, randNr))) % nrOfParticipants;

        while(randNr == randNr2){
            randNr2 = uint (keccak256(abi.encodePacked (msg.sender, block.timestamp, randNr2))) % nrOfParticipants;
        }
        address winner2 = tombola.tickets[randNr2];
        uint prize2 = (prizePool / 100 ) * 25 ;  
        payable(winner2).transfer(prize2);

        tombola.isRunning = false;
       
        
        // maybe emit an event
            emit FinalizareTombola(winner1, winner2);
            return (winner1,winner2);
        }
    }
    


    function withdraw() public isAdmin{
        require(tombola.isRunning == false, "Can't withdraw while an tombola is running");
        owner.transfer(address(this).balance);
    }
}
