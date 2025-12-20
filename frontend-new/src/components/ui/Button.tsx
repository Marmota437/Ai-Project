import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg'; 
}

export const Button = ({ 
  children, 
  isLoading, 
  variant = 'primary', 
  size = 'md', 
  className, 
  ...props 
}: ButtonProps) => {
  
  const baseStyles = "inline-flex items-center justify-center rounded-md font-semibold transition-colors disabled:opacity-50";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };

  const sizes = {
    sm: "py-1 px-3 text-sm",      
    md: "py-2 px-4 text-base",   
    lg: "py-3 px-6 text-lg",     
  };

  return (
    <button
      className={clsx(
        baseStyles, 
        variants[variant], 
        sizes[size], 
        className 
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? "..." : children}
    </button>
  );
};