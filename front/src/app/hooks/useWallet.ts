
import { useState, useEffect } from 'react';
import { BrowserProvider, ethers } from 'ethers';
import { toast } from 'react-toastify';

const customNetwork = {
  name: "NeoX T4",
  chainId: 12227332,
  rpcUrl: "https://neoxt4seed1.ngd.network"
};

export const useWallet = () => {
  const [account, setAccount] = useState<string>('');
  const [connected, setConnected] = useState<boolean>(false);
  const [networkError, setNetworkError] = useState<boolean>(false);
  const neoXT4ChainId = customNetwork.chainId;

  useEffect(() => {
    checkWalletConnection();
  }, []);

  useEffect(() => {
    if (connected) {
      checkNetwork();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, connected]);

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setConnected(true);
          await checkNetwork();
        } else {
          console.error("未检测到账户。请登录MetaMask。");
          toast.error("未检测到账户。请登录MetaMask。");
        }
      } catch (error) {
        console.error('获取账户失败', error);
        toast.error("获取账户失败，请检查MetaMask是否正确安装和配置。");
      }
    } else {
      console.error("Web3提供者未初始化。请安装MetaMask或其他以太坊钱包。");
      toast.error("Web3提供者未初始化。请安装MetaMask或其他以太坊钱包。");
    }
  };

  const checkNetwork = async () => {
    try {
      const chainIdHex = await (window as any).ethereum.request({ method: 'eth_chainId' });
      const chainIdNum = parseInt(chainIdHex, 16);
      if (chainIdNum !== neoXT4ChainId) {
        setNetworkError(true);
        toast.error(`当前连接的网络不是预期的网络。预期的Chain ID是 ${neoXT4ChainId}，当前的Chain ID是 ${chainIdNum}。`);
      } else {
        setNetworkError(false);
      }
    } catch (error) {
      console.error('获取网络失败', error);
      toast.error("无法获取网络信息。请检查您的网络连接。");
    }
  };

  const switchToNeoXT4 = async () => {
    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${customNetwork.chainId.toString(16)}` }],
      });
      setNetworkError(false);
      toast.success("已成功切换到NeoX T4网络。");
    } catch (error) {
      console.error('切换网络失败', error);
      toast.error("无法自动切换到NeoX T4网络。请在钱包中手动切换。");
    }
  };

  const connectWallet = async () => {
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
  };

  return {
    account,
    connected,
    networkError,
    connectWallet,
    switchToNeoXT4,
  };
};