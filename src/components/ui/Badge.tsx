import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "success" | "destructive" | "outline";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  className = "",
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "secondary":
        return "bg-gray-100 text-gray-800";
      case "success":
        return "bg-green-100 text-green-800";
      case "destructive":
        return "bg-red-100 text-red-800";
      case "outline":
        return "border border-gray-300 text-gray-700 bg-transparent";
      default:
        return "bg-teal-100 text-teal-800";
    }
  };

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${getVariantStyles()}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
};
