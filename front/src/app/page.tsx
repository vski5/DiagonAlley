'use client'

import { useState, useEffect } from 'react';
import { BrowserProvider, Contract, parseEther, formatEther } from 'ethers';  // 使用 BrowserProvider 替代 Web3Provider
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast, ToastContainer } from 'react-toastify'; // 使用 react-toastify
import 'react-toastify/dist/ReactToastify.css'; // 引入 react-toastify 样式
import TransferABI from '@/abi/TransferABI.json'; // 引入Transfer合约ABI

const contractAddress = '0x1C876eB2106aB84BFBbF6417Fe3313D0B62C3447'; // Transfer合约地址
const productPriceGAS = '0.01'; // 产品价格，0.0001 GAS
const productPrice = parseEther(productPriceGAS); // 将GAS转换为Wei

const nftContractAddress = '0x1C876eB2106aB84BFBbF6417Fe3313D0B62C3447'; // NFT合约地址
const nftABI = TransferABI; // 使用Transfer合约的ABI

export default function Home() {
  const [account, setAccount] = useState('');
  const [connected, setConnected] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nfts, setNfts] = useState([]);

  const neoXT4ChainId = 12227332; // NeoX T4测试网的Chain ID 数值形式

  useEffect(() => {
    checkWalletConnection();
    if (connected) {
      fetchNFTs();
    }
  }, [account, connected]);
  

  useEffect(() => {
    checkWalletConnection();
    if (connected) {
      fetchNFTs();
    }
  }, [account, connected]);

  async function checkWalletConnection() {
    if (typeof window !== 'undefined' && (window as any).ethereum !== undefined) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setConnected(true);
          await checkNetwork();
        }
      } catch (error) {
        console.error('获取账户失败', error);
      }
    }
  }

  async function checkNetwork() {
    try {
      const chainIdHex = await (window as any).ethereum.request({ method: 'eth_chainId' });
      const chainIdNum = parseInt(chainIdHex, 16);
      if (chainIdNum !== neoXT4ChainId) {
        setNetworkError(true);
      } else {
        setNetworkError(false);
      }
    } catch (error) {
      console.error('获取网络失败', error);
    }
  }

  async function switchToNeoXT4() {
    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xBA4B4C' }], // 保持链ID为16进制字符串
      });
      setNetworkError(false);
    } catch (error) {
      console.error('切换网络失败', error);
      toast.error("无法切换到NeoX T4网络。请在钱包中手动切换。");
    }
  }

  async function connectWallet() {
    if (typeof window !== 'undefined' && (window as any).ethereum !== undefined) {
      try {
        await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
        setAccount(accounts[0]);
        setConnected(true);
        await checkNetwork();
      } catch (error) {
        console.error('连接钱包失败', error);
        toast.error("无法连接到您的钱包。请重试。");
      }
    } else {
      toast.error("请安装MetaMask或其他以太坊钱包。");
    }
  }

  async function buyProduct() {
    if (!connected) {
      toast.error("请先连接您的钱包！");
      return;
    }

    if (networkError) {
      toast.error("请切换到NeoX T4网络！");
      return;
    }

    setLoading(true);

    try {
      const provider = new BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();

      // 创建合约实例
      const contract = new Contract(contractAddress, TransferABI, signer);

      // 调用合约的 transferAndMint 函数，并发送ETH
      const transaction = await contract.transferAndMint({
        value: parseEther("0.01")  // 确保这里的数值至少为0.01 ETH
      });

      // 等待2次交易确认
      const receipt = await transaction.wait(2);

      if (receipt.status === 1) {
        toast.success("购买成功，您的交易已确认！");
      } else {
        toast.error("交易失败。");
        return;
      }

      // 发送交易详情到服务器
      try {
        const response = await fetch('http://localhost:2333/purchase', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: account,
            to: contractAddress,
            value: formatEther(productPrice), // 如果使用GAS，请确保格式化为正确的单位
            transactionHash: transaction.hash,
          }),
        });

        console.log('服务器响应状态:', response.status);
        console.log('服务器响应数据:', await response.json());

        if (!response.ok) {
          throw new Error('服务器响应失败');
        }

        toast.success("购买已记录到服务器！");
      } catch (serverError) {
        console.error('服务器记录失败', serverError);
        toast.warn("购买成功，但未能记录到服务器。请稍后联系支持。");
      }
    } catch (error: any) {
      console.error('购买失败', error);
      if (error.code === 4001) { // 用户拒绝交易
        toast.error("您已取消交易。");
      } else if (error.message && error.message.includes("insufficient funds")) {
        toast.error("合约余额不足，购买失败。");
      } else {
        toast.error(`购买失败: ${error.message || '未知错误'}`);
      }
    } finally {
      setLoading(false);
    }
  }

  async function fetchNFTs() {
    if (!account) return;

    try {
      const provider = new BrowserProvider(window.ethereum);
      const nftContract = new Contract(nftContractAddress, nftABI, provider);
      const balance = await nftContract.balanceOf(account);
      const items = [];

      for (let i = 0; i < balance.toNumber(); i++) {
        const tokenId = await nftContract.tokenOfOwnerByIndex(account, i);
        const tokenUri = await nftContract.tokenURI(tokenId);
        const response = await fetch(tokenUri);
        const metadata = await response.json();
        items.push({ image: metadata.image, name: metadata.name, description: metadata.description });
      }

      if (items.length === 0) {
        items.push({ image: '', name: '没有NFT', description: '' });
      }

      setNfts(items);
    } catch (error) {
      console.error('获取NFT失败', error);
      toast.error("无法获取NFT信息。");
    }
  }

  async function resolveEnsName(name) {
    try {
      const address = await provider.resolveName(name);
      return address;
    } catch (error) {
      if (error.code === 'UNSUPPORTED_OPERATION') {
        console.error('当前网络不支持ENS');
        // 可以返回一个默认值或者null
        return null;
      }
      throw error; // 重新抛出其他错误
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <ToastContainer />
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>独家产品</CardTitle>
              <CardDescription>NeoX T4上的独一无二的区块链产品</CardDescription>
            </CardHeader>
            <CardContent>
              <img
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='100%25' height='100%25' fill='white' stroke='black' stroke-width='2'/%3E%3Ctext x='50%25' y='50%25' font-size='20' text-anchor='middle' fill='black'%3EProduct%3C/text%3E%3C/svg%3E"
                alt="产品"
                className="w-full h-[200px] object-cover rounded-md mb-4"
              />
              <p className="text-2xl font-bold text-center">{productPriceGAS} GAS</p>
              {networkError && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>网络错误</AlertTitle>
                  <AlertDescription>
                    请切换到NeoX T4网络。
                    <Button onClick={switchToNeoXT4} variant="outline" size="sm" className="mt-2">
                      切换到NeoX T4
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              {!connected ? (
                <Button onClick={connectWallet} className="w-full">
                  连接钱包
                </Button>
              ) : (
                <Button onClick={buyProduct} className="w-full" disabled={networkError || loading}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {loading ? '处理中...' : '立即购买'}
                </Button>
              )}
              {connected && (
                <p className="text-sm text-muted-foreground text-center">
                  已连接: {account.slice(0, 6)}...{account.slice(-4)}
                </p>
              )}
            </CardFooter>
          </Card>

          <Card className="w-full">
            <CardHeader>
              <CardTitle>我的 NFT</CardTitle>
              <CardDescription>您拥有的 NFT 集合</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {nfts.length > 0 ? (
                  nfts.map((nft, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardContent className="p-0">
                        <img 
                          src={nft.image || '/placeholder.svg?height=200&width=200'} 
                          alt={`NFT ${index}`} 
                          className="w-full h-40 object-cover"
                        />
                        <div className="p-4">
                          <h3 className="font-semibold text-lg">{nft.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{nft.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="col-span-full">
                    <CardContent className="p-4 text-center">
                      <p className="text-lg text-gray-500">没有 NFT</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}