import React from "react";

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

export const Separator: React.FC<SeparatorProps> = ({
  orientation = "horizontal",
  className = "",
  ...props
}) => {
  return (
    <div
      className={`
        ${orientation === "horizontal" ? "w-full h-px" : "h-full w-px"}
        bg-gray-200
        ${className}
      `}
      {...props}
    />
  );
};
