import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ethers } from 'ethers';
import NFTDestroyerABI from '@/abi/NFTDestroyerABI.json';
import { toast } from 'react-toastify';

interface NFTGalleryProps {
  nfts: any[];
  onNFTDestroyed: (tokenId: number) => void;
}

const destroyerContractAddress = '0x9Eb669d5Fa5c35846985fBD99AA0bB7E001D5f36';

const NFTGallery: React.FC<NFTGalleryProps> = ({ nfts, onNFTDestroyed }) => {
  const destroyNFT = async (tokenId: number) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const destroyerContract = new ethers.Contract(destroyerContractAddress, NFTDestroyerABI, signer);
      
      toast.info("正在销毁 NFT，请等待确认...");
      const tx = await destroyerContract.checkAndDestroy(tokenId);
      await tx.wait();
      
      toast.success('NFT 销毁成功');
      onNFTDestroyed(tokenId);
    } catch (error: any) {
      console.error('销毁 NFT 失败:', error);
      toast.error(`销毁 NFT 失败: ${error.message || '未知错误'}`);
    }
  };

  const renderDescription = (description: any) => {
    let parsedDescription;
    if (typeof description === 'string') {
      try {
        parsedDescription = JSON.parse(description).description;
      } catch (e) {
        console.error('解析 description 失败:', e);
        return <p className="text-sm text-gray-600 mt-1">{description}</p>;
      }
    } else if (typeof description === 'object') {
      parsedDescription = description;
    } else {
      return <p className="text-sm text-gray-600 mt-1">{description}</p>;
    }

    if (parsedDescription && typeof parsedDescription === 'object') {
      return (
        <div>
          <p className="text-sm text-gray-600 mt-1">铸造时间: {new Date(parsedDescription.mint_time * 1000).toLocaleString()}</p>
          <p className="text-sm text-gray-600 mt-1">到期时间: {new Date(parsedDescription.expiry_time * 1000).toLocaleString()}</p>
          <p className="text-sm text-gray-600 mt-1">逾期时间: {new Date(parsedDescription.overdue_time * 1000).toLocaleString()}</p>
          <p className="text-sm text-gray-600 mt-1">物业ID: {parsedDescription.property_id}</p>
        </div>
      );
    } else {
      return <p className="text-sm text-gray-600 mt-1">{description}</p>;
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] overflow-y-auto pl-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {nfts.map((nft, index) => (
          <Card key={index}>
            <CardContent>
              <h3>{nft.name}</h3>
              {renderDescription(nft.description)}
              <button onClick={() => destroyNFT(nft.tokenId)} className="btn btn-danger bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded shadow-lg hover:shadow-xl transition duration-150 ease-in-out">
                销毁 NFT
              </button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NFTGallery;