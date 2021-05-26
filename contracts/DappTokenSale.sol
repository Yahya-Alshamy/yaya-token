// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "./DappToken.sol";

contract DappTokenSale {
    address payable admin;
    DappToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(address _buyer,uint256 _amount);

    constructor(DappToken _tokenContract,uint256 _tokenPrice) public {
        //assign an admin
        admin = msg.sender;
        //token contract
        tokenContract = _tokenContract;
        // set the token price
        tokenPrice = _tokenPrice;
    }

    // multiply function
    function multiply(uint x, uint y) internal pure returns(uint z) {
        require(y==0 || (z= x*y) / y == x );
    }

    // buy Tokens 
    function buyTokens(uint256 _numberOfTokens) public payable {
        // require that value is equal to the token price
        require(msg.value == multiply(_numberOfTokens,tokenPrice));
        // require that the contract has enough tokens
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens );
        // require that the transfer is successful
        require(tokenContract.transfer(msg.sender,_numberOfTokens));
        // keep track of number of tokens sold
        tokensSold += _numberOfTokens;
        // emit the sell event
        emit Sell(msg.sender,_numberOfTokens);
    }
    function endSale() public {
        // require that only an admin can do this
        require(msg.sender == admin);
        // transfer the remaining tokens to the admin
        require(tokenContract.transfer(admin,tokenContract.balanceOf(address(this))));
        // destroy contract 
        admin.transfer(address(this).balance);
    }
}