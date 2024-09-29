// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./TransferContract.sol";

/**
 * @title NFTDestroyer
 * @dev 负责销毁TransferContract中的NFT，基于时间条件。
 */
contract NFTDestroyer {
    TransferContract private transferContract;

    /**
     * @dev 构造函数，设置TransferContract的地址。
     * @param transferContractAddress TransferContract的部署地址。
     */
    constructor(address payable transferContractAddress) {
        require(transferContractAddress != address(0), "TransferContract address cannot be zero");
        transferContract = TransferContract(transferContractAddress);
    }

    /**
     * @dev 检查并销毁指定的NFT。
     * @param tokenId 要销毁的NFT的ID。
     */
    function checkAndDestroy(uint256 tokenId) external {
        // 直接调用TransferContract的destroyNFT函数
        transferContract.destroyNFT(tokenId);
    }

    /**
     * @dev 批量检查并销毁多个NFT。
     * @param tokenIds 要销毁的NFT ID数组。
     */
    function batchCheckAndDestroy(uint256[] calldata tokenIds) external {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            try transferContract.destroyNFT(tokenId) {
                // 销毁成功
            } catch {
                // 处理失败的情况，例如忽略或记录错误
            }
        }
    }

    /**
     * @dev 更新TransferContract的地址。
     * @param newTransferContractAddress 新的TransferContract地址。
     */
    function updateTransferContract(address payable newTransferContractAddress) external /* 需要权限控制，如onlyOwner */ {
        require(newTransferContractAddress != address(0), "New TransferContract address cannot be zero");
        transferContract = TransferContract(newTransferContractAddress);
    }
}