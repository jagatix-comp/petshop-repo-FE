import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({ className = "", ...props }) => {
  return (
    <input
      className={`
        w-full px-3 py-2 border border-gray-300 rounded-lg 
        focus:ring-2 focus:ring-teal-500 focus:border-transparent
        disabled:bg-gray-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    />
  );
};
