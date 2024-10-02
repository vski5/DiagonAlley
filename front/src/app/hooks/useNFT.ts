
import { useState } from 'react';
import { Contract, BrowserProvider, parseEther, formatEther } from 'ethers';
import TransferABI from '@/abi/TransferABI.json';
import { toast } from 'react-toastify';
import { fetchNFTs, Property } from '@/app/nft/nftUtils';

const contractAddress = '0x7b33012DCB61D8e377B4201842A8Be27d79A3576';
const customNetwork = {
  chainId: 12227332,
};

export const useNFT = (account: string, setNfts: React.Dispatch<React.SetStateAction<any[]>>, neoXT4ChainId: number) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [contract, setContract] = useState<Contract | null>(null);

  const initializeContract = async () => {
    try {
      const provider = new BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contractInstance = new Contract(contractAddress, TransferABI, signer);
      setContract(contractInstance);
      return contractInstance;
    } catch (error) {
      console.error('初始化合约失败', error);
      toast.error("初始化合约失败。");
      return null;
    }
  };

  const mintTestNFT = async () => {
    if (!account) {
      toast.error("请先连接您的钱包！");
      return;
    }

    setLoading(true);

    try {
      const contractInstance = contract || await initializeContract();
      if (!contractInstance) return;

      const transaction = await contractInstance.mintNFT({
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
        const provider = new BrowserProvider((window as any).ethereum);
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
    } finally {
      setLoading(false);
    }
  };

  return {
    mintTestNFT,
    loading,
  };
};