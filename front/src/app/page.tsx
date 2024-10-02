'use client'

import { useState, useEffect } from 'react';
import { ethers, formatEther } from 'ethers';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, AlertCircle, Wallet, Plus } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useWallet } from './hooks/useWallet';
import { useNFT } from './hooks/useNFT';
import { fetchNFTs, Property } from './nft/nftUtils';
import UniqueProperties from './components/UniqueProperties';
import NFTGallery from './components/NFTGallery';

export default function Home() {
  const [nfts, setNfts] = useState<any[]>([]);
  const {
    account,
    connected,
    networkError,
    connectWallet,
    switchToNeoXT4,
  } = useWallet();

  const neoXT4ChainId = 12227332;

  const { mintTestNFT, loading } = useNFT(account, setNfts, neoXT4ChainId);

  useEffect(() => {
    if (connected) {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      fetchNFTs(account, provider, neoXT4ChainId).then(setNfts);
    }
  }, [account, connected]);

  const bookProperty = async (property: Property) => {
    if (!connected) {
      toast.error("请先连接您的钱包！");
      return;
    }

    if (networkError) {
      toast.error("请切换到NeoX T4网络！");
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:2333/goods/getgoods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(property),
      });

      if (!response.ok) {
        throw new Error('服务器响应异常');
      }

      const result = await response.json();
      console.log('服务器响应:', result);
      toast.success("物业预订成功！");
    } catch (error) {
      console.error('预订失败', error);
      toast.error("预订失败，请重试。");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <ToastContainer />
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">NeoX T4 Property Marketplace</h1>
          <div className="flex gap-2">
            {!connected ? (
              <Button onClick={connectWallet} size="sm">
                <Wallet className="mr-2 h-4 w-4" />
                连接钱包
              </Button>
            ) : networkError ? (
              <Button onClick={switchToNeoXT4} size="sm" variant="destructive">
                切换到NeoX T4
              </Button>
            ) : (
              <>
                <span className="text-sm text-green-600 mr-2">
                  已连接: {account.slice(0, 6)}...{account.slice(-4)}
                </span>
                <Button onClick={mintTestNFT} size="sm" disabled={loading}>
                  <Plus className="mr-2 h-4 w-4" />
                  {loading ? '处理中...' : '铸造NFT'}
                </Button>
              </>
            )}
          </div>
        </div>

        {networkError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <span>网络错误，请切换到NeoX T4网络以继续操作。</span>
          </Alert>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2">
            <UniqueProperties onBookNow={bookProperty} />
          </div>
          <div className="w-full md:w-1/2">
            <NFTGallery nfts={nfts} />
          </div>
        </div>
      </div>
    </div>
  );
}