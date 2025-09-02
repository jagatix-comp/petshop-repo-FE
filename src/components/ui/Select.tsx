import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onValueChange,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={selectRef} className="relative">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            isOpen,
            setIsOpen,
            value,
            onValueChange,
          });
        }
        return child;
      })}
    </div>
  );
};

export interface SelectTriggerProps
  extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export const SelectTrigger: React.FC<SelectTriggerProps> = ({
  children,
  className = "",
  isOpen,
  setIsOpen,
  ...props
}) => {
  return (
    <button
      type="button"
      onClick={() => setIsOpen?.(!isOpen)}
      className={`
        w-full px-3 py-2 border border-gray-300 rounded-lg
        focus:ring-2 focus:ring-teal-500 focus:border-transparent
        flex items-center justify-between
        text-left bg-white
        ${className}
      `}
      {...props}
    >
      {children}
      <ChevronDown
        className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
      />
    </button>
  );
};

export interface SelectValueProps {
  placeholder?: string;
  value?: string;
}

export const SelectValue: React.FC<SelectValueProps> = ({
  placeholder,
  value,
}) => {
  return (
    <span className={value ? "text-gray-900" : "text-gray-500"}>
      {value || placeholder}
    </span>
  );
};

export interface SelectContentProps {
  children: React.ReactNode;
  isOpen?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
  setIsOpen?: (open: boolean) => void;
}

export const SelectContent: React.FC<SelectContentProps> = ({
  children,
  isOpen,
  value,
  onValueChange,
  setIsOpen,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-auto">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            selectedValue: value,
            onValueChange,
            setIsOpen,
          });
        }
        return child;
      })}
    </div>
  );
};

export interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  onValueChange?: (value: string) => void;
  setIsOpen?: (open: boolean) => void;
  selectedValue?: string;
}

export const SelectItem: React.FC<SelectItemProps> = ({
  value: itemValue,
  children,
  selectedValue,
  onValueChange,
  setIsOpen,
}) => {
  const isSelected = selectedValue === itemValue;

  const handleClick = () => {
    onValueChange?.(itemValue);
    setIsOpen?.(false);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center justify-between
        ${isSelected ? "bg-teal-50 text-teal-700" : "text-gray-900"}
      `}
    >
      <span>{children}</span>
      {isSelected && <Check className="w-4 h-4" />}
    </div>
  );
};
