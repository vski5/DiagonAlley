import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'outline' | 'solid';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  className,
  variant = 'solid',
  size = 'md',
  disabled = false,
}) => {
  const baseStyle = 'focus:outline-none transition ease-in-out duration-300';
  const variants = {
    outline: 'border-2 border-black text-black hover:bg-black hover:text-white',
    solid: 'bg-black text-white hover:bg-gray-800',
  };
  const sizes = {
    sm: 'text-sm px-3 py-1',
    md: 'text-md px-5 py-2',
    lg: 'text-lg px-7 py-3',
  };

  const classes = `${baseStyle} ${variants[variant]} ${sizes[size]} ${className} flex justify-center items-center`;

  return (
    <button className={classes} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};