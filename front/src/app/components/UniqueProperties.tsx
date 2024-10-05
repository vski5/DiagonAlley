import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Property } from '../nft/nftUtils';
import { toast } from 'react-toastify';
import { Minus, Plus } from 'lucide-react'; // 导入 Minus 和 Plus 图标

interface UniquePropertiesProps {
  onBookNow: (property: Property) => void;
}

const UniqueProperties: React.FC<UniquePropertiesProps> = ({ onBookNow }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookingTimes, setBookingTimes] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await fetch('http://localhost:2333/goods');
      const data = await response.json();
      setProperties(data.properties);
      // 初始化 bookingTimes 为每个物业的 ID 对应 0
      const initialBookingTimes: { [key: number]: number } = {};
      data.properties.forEach((property: Property) => {
        initialBookingTimes[property.id] = 0;
      });
      setBookingTimes(initialBookingTimes);
    } catch (error) {
      console.error('获取物业信息失败:', error);
      toast.error("获取物业信息失败，请稍后再试。");
    }
  };

  const handleIncrement = (id: number) => {
    setBookingTimes(prev => ({
      ...prev,
      [id]: prev[id] + 1,
    }));
  };

  const handleDecrement = (id: number) => {
    setBookingTimes(prev => ({
      ...prev,
      [id]: prev[id] > 0 ? prev[id] - 1 : 0,
    }));
  };

  const handleInputChange = (id: number, value: string) => {
    const minutes = parseInt(value, 10);
    if (!isNaN(minutes) && minutes >= 0) {
      setBookingTimes(prev => ({
        ...prev,
        [id]: minutes,
      }));
    } else if (value === '') {
      setBookingTimes(prev => ({
        ...prev,
        [id]: 0,
      }));
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] overflow-y-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">独特物业</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {properties.map(property => (
          <Card key={property.id} className="w-full flex flex-col justify-between">
            <div>
              <CardHeader>
                <CardTitle className="text-center">{property.title}</CardTitle>
                <CardDescription className="text-center">{property.location.city}, {property.location.district}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="w-64 mx-auto">
                  <img
                    src={property.image.url}
                    alt={property.image.altText}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                </div>
                <p className="text-2xl font-bold text-center">
                  {property.price.perMinute} {property.price.currency}/分钟
                </p>
                <p className="text-sm text-center mt-2">
                  房东: {property.landlord.name}
                </p>
                <p className={`text-center mt-2 font-semibold ${property.booked ? 'text-red-500' : 'text-green-500'}`}>
                  {property.booked ? '已预订' : '可预订'}
                </p>
                {!property.booked && (
                  <div className="flex flex-col items-center mt-4">
                    <p className="text-sm text-gray-600 mb-2">设置预订时间（分钟）：</p>
                    <div className="flex items-center">
                      <button
                        className="px-3 py-1 bg-red-500 text-white font-bold rounded-l-md hover:bg-red-600 active:bg-red-700 transition-colors duration-200 ease-in-out shadow-md"
                        onClick={() => handleDecrement(property.id)}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={bookingTimes[property.id] || 0}
                        onChange={(e) => handleInputChange(property.id, e.target.value)}
                        className="w-16 text-center border-t border-b border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                      />
                      <button
                        className="px-3 py-1 bg-green-500 text-white font-bold rounded-r-md hover:bg-green-600 active:bg-green-700 transition-colors duration-200 ease-in-out shadow-md"
                        onClick={() => handleIncrement(property.id)}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      总价: {(bookingTimes[property.id] || 0) * property.price.perMinute} {property.price.currency}
                    </p>
                  </div>
                )}
              </CardContent>
            </div>
            <CardFooter className="flex justify-center mt-4">
              <Button 
                onClick={() => onBookNow({ ...property, bookingMinutes: bookingTimes[property.id] || 0 })} 
                disabled={property.booked || (bookingTimes[property.id] || 0) === 0}
                className={`border border-black text-white px-4 py-2 rounded-md focus:outline-none transition-colors ${property.booked || (bookingTimes[property.id] || 0) === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-black hover:bg-gray-700'}`}
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
};

export default UniqueProperties;