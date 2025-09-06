import { User } from "../types";
import { STORAGE_KEYS } from "../constants";

export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem(STORAGE_KEYS.USER);
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  if (userStr && token) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

export const getStoredToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch {
    return true;
  }
};

export const shouldRefreshToken = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;
    const timeUntilExpiry = payload.exp - currentTime;
    // Refresh if token expires in less than 5 minutes
    return timeUntilExpiry < 300;
  } catch {
    return true;
  }
};

// Function to get refresh token from cookie
export const getRefreshTokenFromCookie = (): string | null => {
  const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith("refresh_token="))
    ?.split("=")[1];

  return cookieValue || null;
};

// Function to check if refresh token exists in cookie
export const hasRefreshToken = (): boolean => {
  return getRefreshTokenFromCookie() !== null;
};

// Function to debug cookies
// export const debugCookies = () => {
//   console.log("🍪 All cookies:", document.cookie);
//   console.log("🔑 Refresh token:", getRefreshTokenFromCookie());
// };

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
