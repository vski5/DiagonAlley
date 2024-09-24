## Foundry

**Foundry 是一个用 Rust 编写的针对以太坊应用开发的快速、便携和模块化工具包。**

Foundry 包括：

-   **Forge**：以太坊测试框架（类似于 Truffle、Hardhat 和 DappTools）。
-   **Cast**：用于与 EVM 智能合约交互、发送交易和获取链上数据的多功能工具。
-   **Anvil**：本地以太坊节点，类似于 Ganache、Hardhat Network。
-   **Chisel**：快速、实用且详细的 Solidity REPL。

## 文档

https://book.getfoundry.sh/

## 使用方法

### 设置
设置RPC:

先用export sepolia="xxxxxxxxx"

[rpc_endpoints]

needs_undefined_env_var = "${UNDEFINED_RPC_URL_PLACEHOLDER}""

私钥的环境变量

先用export SEPOLIA_PRIVATE_KEY="xxxxxxxxx"

或者直接在toml里面写private_key = "xxxxxx"

[default]

private_key = "${SEPOLIA_PRIVATE_KEY}"

### 构建

contracts\src为合约所在
contracts\script\deploy.s.sol为部署的脚本



### 部署合约在ETH上：
forge script script/Deploy.s.sol:DeployScript --rpc-url sepolia --private-key SEPOLIA_PRIVATE_KEY --broadcast -vv

用作实验的两个（一样的代码的）合约，V1版本，没有撤销合约功能，只给固定的地址转账：

##### sepolia
✅  [Success]Hash: 0xe8d5bd2abdd3c8eb36c9f49fd051fbd1fc91854308401e00d0e370240564159d
Contract Address: 0x293980E34AaAc27Ac5c7508e1a4c5ada1687FF73
Block: 6731059
Paid: 0.001896247850932582 ETH (184534 gas * 10.275872473 gwei)

##### sepolia
✅  [Success]Hash: 0x2a5bb1c9e950e7088d4e5fb4c5fe5fc557a72f16fc8d3d920ebc1ba92a4023cb
Contract Address: 0x8C7Af88a3af4A51986DE9fA3d91cE399B35B4729
Block: 6731067
Paid: 0.001739041513436266 ETH (158678 gas * 10.959562847 gwei)

✅ Sequence #1 on sepolia | Total Paid: 0.001739041513436266 ETH (158678 gas * avg 10.959562847 gwei)



## NeoX测试网的部署

forge script script/Deploy.s.sol:DeployScript --rpc-url https://neoxt4seed1.ngd.network --private-key NEOX_PRIVATE_KEY --broadcast -vv

TestNet Configuration


| Name      | Value                                        |
|-----------|----------------------------------------------|
| TestNet   | NeoX T4                                      |
| Chain ID  | 12227332                                     |
| RPC Endpoint | [https://neoxt4seed1.ngd.network](https://neoxt4seed1.ngd.network) |
| WSS Endpoint | [wss://neoxt4wss1.ngd.network](wss://neoxt4wss1.ngd.network) |
| Block Explorer | [https://xt4scan.ngd.network/](https://xt4scan.ngd.network/) |
| Currency Symbol | GAS                                    |
