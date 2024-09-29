// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TransferContract
 * @dev ERC721合约，支持押金管理和时间条件下的NFT销毁。
 */
contract TransferContract is ERC721, Ownable, ReentrancyGuard {
    address payable private constant recipient = payable(0x00000f6a1D910f733Ebf01647DAD8c4CbED82ba2);
    uint256 private _tokenIdCounter;

    // 记录每个tokenId的铸造时间
    mapping(uint256 => uint256) private _mintTimestamps;

    // 记录每个tokenId的铸造者
    mapping(uint256 => address) private _minters;

    // 事件记录NFT的销毁
    event NFTDestroyed(uint256 indexed tokenId, address indexed destroyedBy, address indexed refundTo);

    /**
     * @dev 构造函数，初始化ERC721合约名称和符号。
     */
    constructor() ERC721("MyNFT", "MNFT") Ownable(msg.sender) {}

    /**
     * @dev 铸造NFT并存储押金。
     * @notice 用户需支付0.01 ETH作为押金。
     */
    function mintNFT() public payable nonReentrant {
        require(msg.value == 0.01 ether, "Deposit must be 0.01 ETH");

        _safeMint(msg.sender, _tokenIdCounter);
        _mintTimestamps[_tokenIdCounter] = block.timestamp;
        _minters[_tokenIdCounter] = msg.sender;
        emit Transfer(address(0), msg.sender, _tokenIdCounter);
        _tokenIdCounter++;
    }


    /**
     * @dev 销毁NFT函数，根据调用者和时间条件确定是否允许销毁。
     * @param tokenId 要销毁的NFT的ID。
     */
    function destroyNFT(uint256 tokenId) external nonReentrant {
        require(_exists(tokenId), "NFT does not exist");

        uint256 mintTime = _mintTimestamps[tokenId];
        address minter = _minters[tokenId];
        require(minter != address(0), "Invalid minter address");

        if (block.timestamp < mintTime + 10 minutes) {
            // 铸造后10分钟内，只有铸造者可以销毁
            require(msg.sender == minter, "Only minter can destroy NFT within 10 minutes");
        } else {
            // 超过10分钟，任何人都可以销毁
            // 无需额外权限
        }

        _burn(tokenId);

        // 根据销毁时间，将押金退还给铸造者或指定地址
        if (block.timestamp < mintTime + 10 minutes) {
            // 10分钟内，退还押金给铸造者
            (bool sent, ) = payable(minter).call{value: 0.01 ether}("");
            require(sent, "Failed to refund deposit to minter");
            emit NFTDestroyed(tokenId, msg.sender, minter);
        } else {
            // 超过10分钟，押金退还给指定地址
            (bool sent, ) = recipient.call{value: 0.01 ether}("");
            require(sent, "Failed to refund deposit to recipient");
            emit NFTDestroyed(tokenId, msg.sender, recipient);
        }
    }

    /**
     * @dev 更新指定NFT的铸造者地址。
     * @notice 仅所有者可调用，防止恶意修改铸造者地址。
     * @param tokenId 要更新的NFT的ID。
     * @param newMinter 新的铸造者地址。
     */
    function updateMinter(uint256 tokenId, address newMinter) external onlyOwner {
        require(_exists(tokenId), "NFT does not exist");
        require(newMinter != address(0), "New minter address is invalid");
        _minters[tokenId] = newMinter;
    }

    /**
     * @dev 撤销所有代币，并发送余额到所有者。
     * @notice 仅所有者可调用。
     */
    function emergencyWithdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "Contract has no balance to withdraw");
        (bool sent, ) = owner().call{value: balance}("");
        require(sent, "Withdrawal failed");
    }

    /**
     * @dev 合约余额查询。
     * @return 合约当前余额（以Wei为单位）。
     */
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev 获取指定NFT的铸造时间。
     * @param tokenId 要查询的NFT的ID。
     * @return 指定NFT的铸造时间（Unix时间戳）。
     */
    function getMintTimestamp(uint256 tokenId) public view returns (uint256) {
        require(_exists(tokenId), "NFT does not exist");
        return _mintTimestamps[tokenId];
    }

    /**
     * @dev 获取指定NFT的铸造者地址。
     * @param tokenId 要查询的NFT的ID。
     * @return 指定NFT的铸造者地址。
     */
    function getMinter(uint256 tokenId) external view returns (address) {
        require(_exists(tokenId), "NFT does not exist");
        return _minters[tokenId];
    }

    /**
     * @dev 接收以太币的回退函数。
     */
    receive() external payable {}

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
}