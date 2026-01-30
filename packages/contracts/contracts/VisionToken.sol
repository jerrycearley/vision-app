// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * @title VisionToken
 * @dev ERC-20 token for the Vision platform with minting controls and minor protection features
 * @notice This contract is deployed on Sepolia testnet and is DISABLED by default
 */
contract VisionToken is ERC20, ERC20Burnable, Ownable, ERC20Permit {
    // Mapping to track locked balances for minors
    mapping(address => uint256) public lockedBalances;
    mapping(address => uint256) public unlockDates;
    mapping(address => bool) public isMinorAccount;

    // Authorized minters (backend services)
    mapping(address => bool) public authorizedMinters;

    // Events
    event TokensLocked(address indexed account, uint256 amount, uint256 unlockDate);
    event TokensUnlocked(address indexed account, uint256 amount);
    event MinorStatusSet(address indexed account, bool isMinor);
    event MinterAuthorized(address indexed minter);
    event MinterRevoked(address indexed minter);

    constructor(address initialOwner)
        ERC20("Vision Token", "VSN")
        Ownable(initialOwner)
        ERC20Permit("Vision Token")
    {
        // Mint initial supply to owner (for testing)
        _mint(initialOwner, 1000000 * 10 ** decimals());
    }

    modifier onlyAuthorizedMinter() {
        require(authorizedMinters[msg.sender] || msg.sender == owner(), "Not authorized to mint");
        _;
    }

    /**
     * @dev Authorize an address to mint tokens
     */
    function authorizeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = true;
        emit MinterAuthorized(minter);
    }

    /**
     * @dev Revoke minting authorization
     */
    function revokeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
        emit MinterRevoked(minter);
    }

    /**
     * @dev Mint tokens to an address
     * @param to Address to receive tokens
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyAuthorizedMinter {
        _mint(to, amount);
    }

    /**
     * @dev Mint and lock tokens for a minor account
     * @param to Minor's address
     * @param amount Amount of tokens to mint
     * @param unlockDate Unix timestamp when tokens can be unlocked
     */
    function mintAndLock(address to, uint256 amount, uint256 unlockDate) external onlyAuthorizedMinter {
        require(unlockDate > block.timestamp, "Unlock date must be in the future");

        _mint(address(this), amount);
        lockedBalances[to] += amount;

        if (unlockDates[to] < unlockDate) {
            unlockDates[to] = unlockDate;
        }

        isMinorAccount[to] = true;

        emit TokensLocked(to, amount, unlockDate);
    }

    /**
     * @dev Set minor status for an account
     */
    function setMinorStatus(address account, bool status) external onlyOwner {
        isMinorAccount[account] = status;
        emit MinorStatusSet(account, status);
    }

    /**
     * @dev Unlock tokens for an account that has reached the unlock date
     */
    function unlockTokens(address account) external {
        require(lockedBalances[account] > 0, "No locked tokens");
        require(block.timestamp >= unlockDates[account], "Tokens still locked");

        uint256 amount = lockedBalances[account];
        lockedBalances[account] = 0;
        isMinorAccount[account] = false;

        _transfer(address(this), account, amount);

        emit TokensUnlocked(account, amount);
    }

    /**
     * @dev Check if account has unlockable tokens
     */
    function canUnlock(address account) external view returns (bool) {
        return lockedBalances[account] > 0 && block.timestamp >= unlockDates[account];
    }

    /**
     * @dev Get total balance including locked tokens
     */
    function totalBalanceOf(address account) external view returns (uint256) {
        return balanceOf(account) + lockedBalances[account];
    }

    /**
     * @dev Override transfer to prevent minors from transferring
     */
    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        require(!isMinorAccount[msg.sender], "Minors cannot transfer tokens");
        return super.transfer(to, amount);
    }

    /**
     * @dev Override transferFrom to prevent minors from transferring
     */
    function transferFrom(address from, address to, uint256 amount) public virtual override returns (bool) {
        require(!isMinorAccount[from], "Minors cannot transfer tokens");
        return super.transferFrom(from, to, amount);
    }
}
