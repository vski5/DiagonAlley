import React, { useState } from 'react';
import { ethers } from 'ethers';
import NFTDestroyerABI from '@/abi/NFTDestroyerABI.json';
import { toast } from 'react-toastify';

const destroyerContractAddress = '0x9Eb669d5Fa5c35846985fBD99AA0bB7E001D5f36';

const DestroyNFT: React.FC = () => {
    const [tokenId, setTokenId] = useState('');

    const handleDestroy = async () => {
        if (!tokenId) {
            toast.error("请输入有效的NFT ID");
            return;
        }

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);

            const signer = await provider.getSigner();
            const destroyerContract = new ethers.Contract(destroyerContractAddress, NFTDestroyerABI, signer);

            toast.info("正在销毁 NFT，请等待确认...");
            const tx = await destroyerContract.checkAndDestroy(tokenId);
            await tx.wait();

            toast.success('NFT 销毁成功');
            setTokenId('');  // 清空输入框
        } catch (error) {
            console.error('销毁 NFT 失败:', error);
            toast.error(`销毁 NFT 失败: ${error.message}`);
        }
    };

    return (
        <div>
            <input
                type="text"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                placeholder="输入NFT ID"
            />
            <button onClick={handleDestroy}>销毁 NFT</button>
        </div>
    );
};

export default DestroyNFT;