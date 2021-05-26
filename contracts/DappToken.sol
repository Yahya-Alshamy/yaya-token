// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract DappToken {
    uint256 public totalSupply;
    string public name = "DApp Token";
    string public symbol ="DAPP";
    string public standard ="DApp Token v1.0";

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );
    //Approval event
    event Approval (
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    mapping(address => uint256) public balanceOf;
    //allowance
    mapping(address => mapping(address =>uint256))public allowance;

    constructor (uint256 _initialSupply) public {
        totalSupply = _initialSupply;
        // allocate the initial supply
        balanceOf[msg.sender] = totalSupply;
    }
    
    function transfer(address _to,uint256 _value) public returns (bool success){
        require(balanceOf[msg.sender] >= _value );
        //transfer the balance
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        // event
        emit Transfer(msg.sender,_to,_value);
        //return a boolean
        return true;
    }

    //approve
    function approve(address _spender,uint256 _value) public returns (bool success) {
        // handle the allowance
        allowance[msg.sender][_spender] = _value;
        //handle the apporvement
        emit Approval(msg.sender,_spender,_value);
        return true;
    }

    //transfer from
    function transferFrom(address _from,address _to,uint256 _value) public returns (bool success){
        // require _from has enough tokens
        require(_value <= balanceOf[_from]);
        //require that allowance is big enough
        require(_value <= allowance[_from][msg.sender]);
        //change the balance
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        //update the allowance
        allowance[_from][msg.sender] -= _value;
        //transfer event
        emit Transfer(_from,_to,_value);
        //return a boolean
        return true;
    }
}
