// Environment Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";
export const TENANT_NAME = import.meta.env.VITE_TENANT_NAME || "wojo";
export const APP_NAME = import.meta.env.VITE_APP_NAME || "PetShop POS";
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || "1.0.0";

// Debug logging for environment variables
console.log("🔧 API Service Configuration:");
console.log("🌐 API_BASE_URL:", API_BASE_URL);
console.log("🏢 TENANT_NAME:", TENANT_NAME);
console.log("📱 APP_NAME:", APP_NAME);
console.log("📋 APP_VERSION:", APP_VERSION);
console.log("🔍 Environment Mode:", import.meta.env.MODE);
console.log("🚀 Is Production:", import.meta.env.PROD);
console.log("🌍 Current Location:", window.location.origin);

// App Configuration
export const APP_CONFIG = {
  name: APP_NAME,
  version: APP_VERSION,
  description: "Modern Point of Sale System",
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
  },
  timeouts: {
    request: 30000, // 30 seconds
    refresh: 4 * 60 * 1000, // 4 minutes
  },
} as const;
