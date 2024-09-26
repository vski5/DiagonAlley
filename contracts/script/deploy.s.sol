   // contracts/script/deploy.s.sol
   pragma solidity ^0.8.0;
   
   import "forge-std/Script.sol";
   import "../src/TransferContract.sol";

   contract DeployScript is Script {
       function run() public {
           vm.startBroadcast();
           // 部署合约，不保存实例
           new TransferContract();
           vm.stopBroadcast();
       }
   }