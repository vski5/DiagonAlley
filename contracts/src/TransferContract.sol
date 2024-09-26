// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol"; // 引入ERC721标准

contract TransferContract is ERC721 {
    address payable private constant recipient = payable(0x00000f6a1D910f733Ebf01647DAD8c4CbED82ba2);
    uint256 private _tokenIdCounter;

    constructor() ERC721("MyNFT", "MNFT") {}

    // 铸造NFT的函数
    function mintNFT() public {
        _safeMint(msg.sender, _tokenIdCounter);
        _tokenIdCounter++;
    }

    // 接收ETH并铸造NFT的函数
    function transferAndMint() public payable {
        require(msg.value >= 0.01 ether, "Need to send at least 0.01 ETH");
        recipient.transfer(0.01 ether); // 向指定地址转账0.01 ETH
        mintNFT(); // 铸造NFT
    }

    // 接收以太币的回退函数
    receive() external payable {}

    // 合约余额查询
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}