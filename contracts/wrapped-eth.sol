pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "hardhat/console.sol";

contract WrappedEth is Ownable, ERC20 {
    constructor() ERC20("Wrapped-Eth", "WETH") {}

    function faucet(uint256 _amount) external {
        super._mint(msg.sender, _amount);
    }
}
