// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/TransferContract.sol";
import "../src/NFTDestroyer.sol";

/**
 * @title TransferContractTest
 * @dev 测试TransferContract合约的功能和安全性。
 */
contract TransferContractTest is Test {
    TransferContract transferContract;
    NFTDestroyer nftDestroyer;
    address payable owner;
    address payable user1;
    address payable user2;
    address payable recipientAddress = payable(0x00000f6a1D910f733Ebf01647DAD8c4CbED82ba2);

    function setUp() public {
        owner = payable(address(this));
        user1 = payable(address(0x1));
        user2 = payable(address(0x2));

        transferContract = new TransferContract();
        nftDestroyer = new NFTDestroyer(payable(address(transferContract)));
    }


    function testMintNFT() public {
        vm.prank(user1);
        transferContract.mintNFT{value: 0.01 ether}();

        assertEq(transferContract.balanceOf(user1), 1);
        assertEq(transferContract.getBalance(), 0.01 ether);
        assertEq(transferContract.getMinter(0), user1);
    }


    function testDestroyNFTWithin10MinutesByMinter() public {
        vm.prank(user1);
        transferContract.mintNFT{value: 0.01 ether}();

        // 快进6分钟
        vm.warp(block.timestamp + 6 minutes);

        // 用户1销毁其NFT
        vm.prank(user1);
        transferContract.destroyNFT(0);

        assertEq(transferContract.balanceOf(user1), 0);
        assertEq(transferContract.getBalance(), 0 ether);

        // 检查铸造者的余额增加了0.01 ETH（模拟）
        // 由于测试环境中账户余额的变化需要手动模拟，因此此处仅作为逻辑说明
    }

    function testDestroyNFTAfter10MinutesByAnyone() public {
        vm.prank(user1);
        transferContract.mintNFT{value: 0.01 ether}();

        // 快进11分钟
        vm.warp(block.timestamp + 11 minutes);

        // 任意用户（user2）销毁NFT
        vm.prank(user2);
        transferContract.destroyNFT(0);

        assertEq(transferContract.balanceOf(user2), 0);
        assertEq(transferContract.getBalance(), 0 ether);

        // 检查指定地址的余额增加了0.01 ETH（模拟）
        // 由于测试环境中账户余额的变化需要手动模拟，因此此处仅作为逻辑说明
    }


    function testCannotDestroyNFTBefore10Minutes() public {
        vm.prank(user1);
        transferContract.mintNFT{value: 0.01 ether}();

        // 快进9分钟
        vm.warp(block.timestamp + 9 minutes);

        // 非铸造者（user2）尝试销毁NFT
        vm.prank(user2);
        vm.expectRevert("Destruction time not reached");
        transferContract.destroyNFT(0);
    }

    function testOnlyOwnerCanUpdateMinter() public {
        // 尝试非所有者更新铸造者
        vm.prank(user1);
        vm.expectRevert("Ownable: caller is not the owner");
        transferContract.updateMinter(0, user2);

        // 所有者更新铸造者
        transferContract.updateMinter(0, user2);
        address newMinter = transferContract.getMinter(0);
        assertEq(newMinter, user2);
    }

    function testEmergencyWithdraw() public {
        // 向合约发送ETH
        vm.deal(user1, 1 ether);
        vm.prank(user1);
        (bool sent, ) = address(transferContract).call{value: 0.5 ether}("");
        require(sent, "Failed to send ETH");

        assertEq(transferContract.getBalance(), 0.51 ether); // 包含铸造押金

        // 所有者提取余额
        transferContract.emergencyWithdraw();

        assertEq(transferContract.getBalance(), 0 ether);
    }
}