import React from 'react';

interface AlertProps {
  children: React.ReactNode;
  variant: 'destructive' | 'warning' | 'info';
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ children, variant, className }) => {
  const variantStyles = {
    destructive: 'bg-red-600 text-white', // 修改为红色背景，白色文字
    warning: 'bg-yellow-400 text-black', // 修改为黄色背景，黑色文字
    info: 'bg-blue-300 text-black', // 修改为蓝色背景，黑色文字
  };

  return (
    <div className={`p-4 rounded-md ${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  );
};

export const AlertTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h4 className="font-bold">{children}</h4>
);

export const AlertDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p>{children}</p>
);