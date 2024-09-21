   // scripts/deploy.s.sol
   pragma solidity ^0.8.0;

   import "forge-std/Script.sol";
   import "../src/TransferContract.sol"; // 确保导入路径正确，如果合约名称为 TransferContract，建议重命名文件或调整导入路径

   contract DeployScript is Script {
       function run() public {
           vm.startBroadcast();
           new TransferContract(); // 部署 TransferContract 合约
           vm.stopBroadcast();
       }
   }