   // contracts/script/deploy.s.sol
   pragma solidity ^0.8.0;
   
   import "forge-std/Script.sol";
   import "../src/TransferContract.sol";
   import "../src/NFTDestroyer.sol";

   /**
    * @title DeployScript
    * @dev 使用 Foundry 部署 TransferContract 和 NFTDestroyer 合约的脚本。
    */
   contract DeployScript is Script {
       /**
        * @dev Foundry 的默认入口函数，用于部署合约。
        */
       function run() public {
           // 启动广播，开始记录交易
           vm.startBroadcast();

           // 部署 TransferContract 合约
           TransferContract transferContract = new TransferContract();
           console.log("TransferContract deployed at:", address(transferContract));

           // 部署 NFTDestroyer 合约，并传入 TransferContract 的地址
           NFTDestroyer nftDestroyer = new NFTDestroyer(payable(address(transferContract)));
           console.log("NFTDestroyer deployed at:", address(nftDestroyer));

           // 结束广播，停止记录交易
           vm.stopBroadcast();
       }
   }