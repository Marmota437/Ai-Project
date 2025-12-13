import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary';
}

export const Button = ({ 
  children, 
  isLoading, 
  variant = 'primary', 
  className, 
  ...props 
}: ButtonProps) => {
  const baseStyles = "w-full py-2 px-4 rounded-md font-semibold transition-colors disabled:opacity-50";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? "Ładowanie..." : children}
    </button>
  );
};