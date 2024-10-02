import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import TransferABI from '@/abi/TransferABI.json';

const nftContractAddress = '0x7b33012DCB61D8e377B4201842A8Be27d79A3576';
const nftABI = TransferABI;
const networkUrl = 'https://neoxt4seed1.ngd.network';

export const getTokensId = async (recipient: string, index: number, nftContract: ethers.Contract) => {
  try {
    const tokenId = await nftContract.tokenOfOwnerByIndex(recipient, index);
    return tokenId;
  } catch (error) {
    console.error(`获取NFT ID时出错: ${error}`);
    return null;
  }
};

export const fetchNFTs = async (ownerAddress: string, provider: ethers.Provider, chainId: number) => {
  if (!ownerAddress) return [];

  const contract = new ethers.Contract(nftContractAddress, nftABI, provider);

  try {
    const balance = await contract.balanceOf(ownerAddress);
    console.log(`用户 ${ownerAddress} 的 NFT 余额: ${balance.toString()}`);

    if (balance === 0n) {
      return [{ name: "提示", description: `用户 ${ownerAddress} 没有持有任何 NFT`, image: "" }];
    }

    const items = [];

    for (let i = 0; i < Number(balance); i++) {
      try {
        const tokenId = await contract.tokenOfOwnerByIndex(ownerAddress, i);
        console.log(`获取到的 Token ID: ${tokenId.toString()}`);

        const tokenUri = await contract.tokenURI(tokenId);
        console.log(`Token URI: ${tokenUri}`);

        const response = await fetch(tokenUri);
        if (!response.ok) throw new Error(`无法从URI获取元数据: ${tokenUri}`);
        const metadataText = await response.text();
        console.log(`Metadata Text: ${metadataText}`);

        let metadata;
        try {
          const decodedText = atob(metadataText.split(',')[1]);
          metadata = JSON.parse(decodedText);
        } catch (e) {
          console.error("解码或解析元数据失败", e);
          metadata = { description: metadataText }; // 使用原始文本作为描述
        }

        items.push({
          image: metadata.image || "",
          name: metadata.name || `NFT #${tokenId.toString()}`,
          description: metadata.description || metadataText // 如果解析失败，使用原始文本
        });
      } catch (itemError) {
        console.error(`获取第 ${i + 1} 个 NFT 时出错:`, itemError);
        items.push({ name: `NFT #${i + 1}`, description: `获取此 NFT 信息时出错: ${itemError.message}`, image: "" });
      }
    }

    return items;
  } catch (error) {
    console.error('获取NFT失败', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    toast.error(`无法获取NFT信息: ${errorMessage}`);
    return [{ name: "错误", description: `获取NFT信息失败: ${errorMessage}`, image: "" }];
  }
};