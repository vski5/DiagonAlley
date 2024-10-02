'use client'

import { useState, useEffect } from 'react';
import { BrowserProvider, Contract, parseEther, formatEther, ethers } from 'ethers';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, AlertCircle, Wallet, Plus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TransferABI from '@/abi/TransferABI.json';
import { fetchNFTs } from './nft/nftUtils';

const contractAddress = '0x7b33012DCB61D8e377B4201842A8Be27d79A3576';
const customNetwork = {
  name: "NeoX T4",
  chainId: 12227332,
  rpcUrl: "https://neoxt4seed1.ngd.network"
};

const provider = new ethers.JsonRpcProvider(customNetwork.rpcUrl, {
  name: customNetwork.name,
  chainId: customNetwork.chainId
});

interface Property {
  id: number;
  title: string;
  location: {
    city: string;
    district: string;
  };
  price: {
    perMinute: number;
    currency: string;
  };
  image: {
    url: string;
    altText: string;
  };
  landlord: {
    name: string;
    contact: {
      email: string;
    };
  };
}

function UniqueProperties({ onBookNow }: { onBookNow: (property: Property) => void }) {
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await fetch('http://localhost:2333/goods');
      const data = await response.json();
      setProperties(data.properties);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] overflow-y-auto pr-4">
      <h2 className="text-2xl font-bold mb-4">Unique Properties</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {properties.map(property => (
          <Card key={property.id} className="w-full">
            <CardHeader>
              <CardTitle>{property.title}</CardTitle>
              <CardDescription>{property.location.city}, {property.location.district}</CardDescription>
            </CardHeader>
            <CardContent>
              <img
                src={property.image.url}
                alt={property.image.altText}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <p className="text-2xl font-bold text-center">
                {property.price.perMinute} {property.price.currency}/minute
              </p>
              <p className="text-sm text-center mt-2">
                Landlord: {property.landlord.name}
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={() => onBookNow(property)}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Book Now
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

function NFTGallery({ nfts }: { nfts: any[] }) {
  return (
    <div className="h-[calc(100vh-120px)] overflow-y-auto pl-4">
      <h2 className="text-2xl font-bold mb-4">My NFTs</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {nfts.map((nft: any, index: number) => (
          <Card key={index} className="w-full">
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg">{nft.name}</h3>
              {typeof nft.description === 'object' ? (
                <>
                  <p className="text-sm text-gray-500">Mint Time: {nft.description.mint_time}</p>
                  <p className="text-sm text-gray-500">Expiry Time: {nft.description.expiry_time}</p>
                </>
              ) : (
                <p className="text-sm text-gray-600 mt-1">{nft.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [account, setAccount] = useState('');
  const [connected, setConnected] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [nfts, setNfts] = useState([]);

  const neoXT4ChainId = 12227332;

  useEffect(() => {
    checkWalletConnection();
  }, []);

  useEffect(() => {
    if (connected) {
      const provider = new BrowserProvider((window as any).ethereum);
      fetchNFTs(account, provider, neoXT4ChainId).then(setNfts);
    }
  }, [account, connected]);

  async function checkWalletConnection() {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setConnected(true);
          await checkNetwork();
        }
      } catch (error) {
        console.error('Failed to get accounts', error);
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
      console.error('Failed to get network', error);
    }
  }

  async function switchToNeoXT4() {
    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${customNetwork.chainId.toString(16)}` }],
      });
      setNetworkError(false);
      toast.success("Successfully switched to NeoX T4 network.");
    } catch (error) {
      console.error('Failed to switch network', error);
      toast.error("Unable to switch to NeoX T4 network. Please switch manually in your wallet.");
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
        console.error('Failed to connect wallet', error);
        toast.error("Unable to connect to your wallet. Please try again.");
      }
    } else {
      toast.error("Please install MetaMask or another Ethereum wallet.");
    }
  }

  async function bookProperty(property: Property) {
    if (!connected) {
      toast.error("Please connect your wallet first!");
      return;
    }

    if (networkError) {
      toast.error("Please switch to the NeoX T4 network!");
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
        throw new Error('Server response was not ok');
      }

      const result = await response.json();
      console.log('Server response:', result);
      toast.success("Property booked successfully!");
    } catch (error) {
      console.error('Booking failed', error);
      toast.error("Failed to book the property. Please try again.");
    }
  }

  async function mintTestNFT() {
    if (!connected) {
      toast.error("请先连接您的钱包！");
      return;
    }

    if (networkError) {
      toast.error("请切换到NeoX T4网络！");
      return;
    }

    try {
      const provider = new BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, TransferABI, signer);

      const transaction = await contract.mintNFT({
        value: parseEther("0.01")
      });

      toast.info("铸造中，请等待确认...");

      // 等待2个区块确认
      const receipt = await transaction.wait(2);

      if (receipt.status === 1) {
        toast.success("NFT铸造成功！");

        // 向服务器发送交易详情
        try {
          const response = await fetch('http://localhost:2333/goods', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: account,
              to: contractAddress,
              value: formatEther(parseEther("0.01")),
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
          toast.warn("NFT铸造成功，但未能记录到服务器。请稍后联系支持。");
        }

        // 刷新NFTs
        fetchNFTs(account, provider, neoXT4ChainId).then(setNfts);
      } else {
        toast.error("交易失败。");
      }
    } catch (error: any) {
      console.error('铸造失败', error);
      if (error.code === 4001) {
        toast.error("您已取消交易。");
      } else if (error.message && error.message.includes("insufficient funds")) {
        toast.error("余额不足，铸造失败。");
      } else {
        toast.error(`铸造失败: ${error.message || '未知错误'}`);
      }
    }
  }

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
                Connect Wallet
              </Button>
            ) : networkError ? (
              <Button onClick={switchToNeoXT4} size="sm" variant="destructive">
                Switch to NeoX T4
              </Button>
            ) : (
              <>
                <span className="text-sm text-green-600 mr-2">
                  Connected: {account.slice(0, 6)}...{account.slice(-4)}
                </span>
                <Button onClick={mintTestNFT} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Mint Test NFT
                </Button>
              </>
            )}
          </div>
        </div>

        {networkError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Network Error</AlertTitle>
            <AlertDescription>
              Please switch to the NeoX T4 network to interact with the marketplace.
            </AlertDescription>
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
  )
}