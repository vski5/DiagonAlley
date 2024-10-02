
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface NFTGalleryProps {
  nfts: any[];
}

const NFTGallery: React.FC<NFTGalleryProps> = ({ nfts }) => {
  return (
    <div className="h-[calc(100vh-120px)] overflow-y-auto pl-4">
      <h2 className="text-2xl font-bold mb-4">我的NFT</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {nfts.map((nft: any, index: number) => (
          <Card key={index} className="w-full">
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg">{nft.name}</h3>
              {typeof nft.description === 'object' ? (
                <>
                  <p className="text-sm text-gray-500">铸造时间: {nft.description.mint_time}</p>
                  <p className="text-sm text-gray-500">到期时间: {nft.description.expiry_time}</p>
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
};

export default NFTGallery;