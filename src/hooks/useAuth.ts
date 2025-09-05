import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { getStoredToken, shouldRefreshToken, isTokenExpired } from '../utils/auth';

export const useAuth = () => {
  const { refreshToken, logout, isAuthenticated, initializeAuth } = useStore();

  useEffect(() => {
    // Initialize auth first - this will check existing tokens and set state
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    // Only set up token management if user is authenticated
    if (!isAuthenticated) return;

    const token = getStoredToken();
    if (!token) return;

    // Set up automatic token refresh - but don't be too aggressive
    const checkAndRefreshToken = async () => {
      const currentToken = getStoredToken();
      
      if (!currentToken) {
        console.log("🚪 No token found, user needs to login");
        return;
      }

      // Only logout if token is completely expired AND refresh fails
      if (isTokenExpired(currentToken)) {
        console.log("⏰ Token is expired, attempting refresh...");
        const success = await refreshToken();
        if (!success) {
          console.log("❌ Token refresh failed, logging out");
          logout();
        }
        return;
      }

      // Attempt refresh if token expires soon
      if (shouldRefreshToken(currentToken)) {
        console.log("🔄 Token expires soon, refreshing...");
        await refreshToken(); // Don't logout if this fails, token is still valid
      }
    };

    // Only start checking after a delay to avoid interfering with login process
    const initialDelay = setTimeout(() => {
      checkAndRefreshToken();
      
      // Set up interval to check every 5 minutes (less aggressive)
      const interval = setInterval(checkAndRefreshToken, 5 * 60 * 1000);
      
      // Cleanup function
      return () => clearInterval(interval);
    }, 2000); // 2 second delay

    return () => {
      clearTimeout(initialDelay);
    };
  }, [isAuthenticated, refreshToken, logout]);

  return {
    refreshToken,
    logout,
    isAuthenticated
  };
};
