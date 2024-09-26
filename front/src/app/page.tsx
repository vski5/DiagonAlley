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

const contractAddress = '0x9296BBf2937e6bD7B39e50db76e806c3753AD2Bb'; // Transfer合约地址
const productPriceGAS = '0.01'; // 产品价格，0.0001 GAS
const productPrice = parseEther(productPriceGAS); // 将GAS转换为Wei

export default function Home() {
  const [account, setAccount] = useState('');
  const [connected, setConnected] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [loading, setLoading] = useState(false);

  const neoXT4ChainId = 12227332; // NeoX T4测试网的Chain ID 数值形式

  useEffect(() => {
    checkWalletConnection();
  }, []);

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
      
      // 调用合约的 transferEther 函数，并发送GAS
      const transaction = await contract.transferEther({
        value: productPrice
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

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <ToastContainer /> {/* 显示 toast */}
      <Card className="w-[350px]">
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
    </div>
  )
}