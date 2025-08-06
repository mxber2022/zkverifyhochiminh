// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IAnonPay {
    function isUserRegistered(address user) external view returns (bool);
}

contract AnonErc20 is ERC20, Ownable {
    IAnonPay public anonPay;

    constructor(address _anonPay) ERC20("IndianRupee", "INR") Ownable(msg.sender) {
        anonPay = IAnonPay(_anonPay);
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }

    function transfer(address to, uint256 amount) public override returns (bool) {
        require(anonPay.isUserRegistered(to), "Recipient not registered");
        return super.transfer(to, amount);
    }

    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        require(anonPay.isUserRegistered(to), "Recipient not registered");
        return super.transferFrom(from, to, amount);
    }

    function updateAnonPay(address _anonPay) external onlyOwner {
        anonPay = IAnonPay(_anonPay);
    }
}
