
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Property } from '../nft/nftUtils';
import { toast } from 'react-toastify';

interface UniquePropertiesProps {
  onBookNow: (property: Property) => void;
}

const UniqueProperties: React.FC<UniquePropertiesProps> = ({ onBookNow }) => {
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
      console.error('获取物业信息失败:', error);
      toast.error("获取物业信息失败，请稍后再试。");
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] overflow-y-auto pr-4">
      <h2 className="text-2xl font-bold mb-4">独特物业</h2>
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
                {property.price.perMinute} {property.price.currency}/分钟
              </p>
              <p className="text-sm text-center mt-2">
                房东: {property.landlord.name}
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={() => onBookNow(property)}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                立即预订
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UniqueProperties;