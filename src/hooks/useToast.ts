import { useState, useCallback } from "react";
import { ToastProps } from "../components/ui/Toast";

export interface UseToastProps {
  title?: string;
  description: string;
  variant?: "default" | "destructive" | "success" | "info";
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = useCallback(
    ({
      title,
      description,
      variant = "default",
      duration = 5000,
    }: UseToastProps) => {
      const id = Math.random().toString(36).substring(2, 15);
      const newToast: ToastProps = {
        id,
        title,
        description,
        variant,
        duration,
        onClose: (id: string) => {
          setToasts((prev) => prev.filter((toast) => toast.id !== id));
        },
      };

      setToasts((prev) => [...prev, newToast]);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return {
    toast,
    toasts,
    dismissToast,
  };
};
