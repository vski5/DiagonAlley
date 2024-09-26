// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TransferContract {
    address private owner;
    address payable private constant recipient = payable(0x000000c1E69e2923d330ACcbAa3F6B284eaF7840);

    // 修饰符，确保只有所有者可以调用
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    // 构造函数，在部署合约时设置所有者
    constructor() {
        owner = msg.sender; // 将部署合约的地址设置为所有者
    }

    // 接收ETH的函数
function transferEther() public payable onlyOwner {
    // 确保合约有足够的余额
    require(address(this).balance >= 0.01 ether, "Insufficient balance in contract");

    // 向指定地址转账0.01 ETH
    recipient.transfer(0.01 ether);
}

    // 撤销合约并发送余额到所有者
    // 移除此函数以避免使用 selfdestruct
    /*
    function destroyContract() public onlyOwner {
        selfdestruct(payable(owner));
    }
    */

    // 接收以太币的回退函数
    receive() external payable {}

    // 合约余额查询
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}