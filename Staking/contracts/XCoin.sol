//SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0 <0.9.0; // handles the overflow 
  
 
interface  IERC20 {
    function totalSupply() external view returns (uint);
    function balanceOf(address tokenOwner) external view returns (uint balance);
    function transfer(address to, uint tokens) external returns (bool success);
    
    function allowance(address tokenOwner, address spender) external view returns (uint remaining);
    function approve(address spender, uint tokens) external returns (bool success);
    function transferFrom(address from, address to, uint tokens) external returns (bool success);
    
 
    event Transfer(address indexed from, address indexed to, uint tokens);
    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
}


contract XCoin is IERC20 {

  
    uint public supply;
    address payable public founder;
    uint public tokenPrice = 10000000000;  ///pret in functie de decimale 

    mapping (address => uint) private balances;
    mapping (address => mapping(address => uint)) allowed;
     
    
    constructor()  {  // maybe transfer the supply to the owner
        supply = 0;
        founder = payable(msg.sender);
     }

 

    // returns the balance of the msg.sender
    function balanceOf(address   tokenOwner) public view override returns (uint balance){
        require(msg.sender == tokenOwner, "You can only see your balance");
        return balances[tokenOwner];
    }

     function decimals() public view virtual returns (uint8){
         return 10;
     }

    function symbol() public view virtual returns (string memory) {
        return "XCO";
    }

    function name() public view virtual returns (string memory) {
        return "XCoin";
    }

    function totalSupply() public view virtual override returns (uint256) {
            return supply;
    }

    function transfer(address   to, uint   tokens) public virtual override returns (bool success){
        require(balances[msg.sender] >= tokens);
        balances[to] += tokens;
        balances[msg.sender] -= tokens;

        emit Transfer(msg.sender,to,tokens);
        
        return true;
    }

    function allowance(address   tokenOwner, address   spender) view public override returns (uint){
        return allowed[tokenOwner][spender];
    }


    function approve(address spender, uint   tokens) public override returns (bool success){
        require(balances[msg.sender] >= tokens);
        require(tokens > 0);
        allowed[msg.sender][spender] = tokens;

        emit Approval(msg.sender, spender, tokens);

        return true;      
    }


    function transferFrom(address   from, address   to, uint  tokens) public virtual override returns (bool success){

        require(allowed[from][to] >= tokens, "You cant take the tokens form another wallet if not allowed.");
        require(balances[from] >= tokens, "Not enough balance!");
        balances[from] -= tokens;
        balances[to] += tokens;
        allowed[from][to] -= tokens;

        emit Transfer(from, to, tokens);
        
        return true;
    }

    event Mint(address   investor, uint   value, uint  tokens);

    // be carefull about sending matic 
    function mint() payable public returns(bool){

      uint tokens = msg.value / tokenPrice;
      supply += tokens;
      balances[msg.sender] += tokens;

      emit Mint(msg.sender, msg.value, tokens);

      return true;
    }

    
    // function mintFromContract(address sender, uint value) public returns(bool){
      
    //   uint tokens = value / tokenPrice;
    //   supply += tokens;
    //   balances[sender] += tokens;

    //   emit Mint(sender, value, tokens);

    //   return true;
    // }
    
    // withdraw the tokens you have
    function withdraw(uint tokens) public returns (bool){
        require (balances[msg.sender] >= tokens, "Not enough balance!");

        uint value = tokens * tokenPrice ;
        supply -= tokens;
        balances[msg.sender] -= tokens;
        payable(msg.sender).transfer(value);

        return true;
    }
    
    receive() payable external{
        mint();
    }
}
 