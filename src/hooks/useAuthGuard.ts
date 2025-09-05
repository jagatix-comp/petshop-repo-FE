import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";

export const useAuthGuard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, initializeAuth } = useStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize auth on mount
    const initAuth = () => {
      try {
        initializeAuth();
      } catch (error) {
        console.error("Auth initialization failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [initializeAuth]);

  useEffect(() => {
    // Only check auth after initialization is complete
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        console.log(
          "🚪 Auth Guard: User not authenticated, redirecting to login"
        );
        navigate("/login", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, isLoading]);

  return { isAuthenticated, user, isLoading };
};
