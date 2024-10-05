import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Property } from '../nft/nftUtils';
import { toast } from 'react-toastify';

interface UniquePropertiesProps {
  onBookNow: (property: Property) => void;
}

export default function UniqueProperties({ onBookNow }: UniquePropertiesProps) {
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
      <h2 className="text-3xl font-bold mb-6 text-gray-900">独特物业</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {properties.map(property => (
          <Card key={property.id} className="w-full border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-xl text-gray-800">{property.title}</CardTitle>
              <CardDescription className="text-gray-500">{property.location.city}, {property.location.district}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <img
                src={property.image.url}
                alt={property.image.altText}
                className="w-full h-56 object-cover rounded-md mb-4"
              />
              <p className="text-2xl font-bold text-center text-gray-900">
                {property.price.perMinute} {property.price.currency}/分钟
              </p>
              <p className="text-sm text-center mt-2 text-gray-600">
                房东: {property.landlord.name}
              </p>
              <p className={`text-center mt-2 font-semibold ${property.booked ? 'text-red-600' : 'text-green-600'}`}>
                {property.booked ? '已预订' : '可预订'}
              </p>
            </CardContent>
            <CardFooter className="flex justify-center pt-2 pb-4">
              <Button 
                onClick={() => onBookNow(property)} 
                disabled={property.booked}
                className={`
                  w-full max-w-xs
                  border border-gray-800 
                  text-white 
                  ${property.booked 
                    ? 'bg-gray-300 cursor-not-allowed hover:bg-gray-300' 
                    : 'bg-gray-800 hover:bg-gray-700 active:bg-gray-900'
                  }
                  transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50
                `}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {property.booked ? '不可预订' : '立即预订'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}