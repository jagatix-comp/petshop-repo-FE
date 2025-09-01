import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { getStoredToken, shouldRefreshToken, isTokenExpired } from '../utils/auth';

export const useAuth = () => {
  const { refreshToken, logout, isAuthenticated } = useStore();

  useEffect(() => {
    const token = getStoredToken();
    
    if (token && isAuthenticated) {
      // Check if token is expired
      if (isTokenExpired(token)) {
        logout();
        return;
      }

      // Set up automatic token refresh
      const checkAndRefreshToken = async () => {
        const currentToken = getStoredToken();
        if (currentToken && shouldRefreshToken(currentToken)) {
          const success = await refreshToken();
          if (!success) {
            logout();
          }
        }
      };

      // Check immediately
      checkAndRefreshToken();

      // Set up interval to check every 4 minutes
      const interval = setInterval(checkAndRefreshToken, 4 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [refreshToken, logout, isAuthenticated]);

  return {
    refreshToken,
    logout,
    isAuthenticated
  };
};
