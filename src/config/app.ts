// Environment Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
export const TENANT_NAME = import.meta.env.VITE_TENANT_NAME || "wojo";

// Debug logging for environment variables
console.log("🔧 API Service Configuration:");
console.log("🌐 API_BASE_URL:", API_BASE_URL);
console.log("🏢 TENANT_NAME:", TENANT_NAME);
console.log("🔍 Environment Mode:", import.meta.env.MODE);
console.log("🚀 Is Production:", import.meta.env.PROD);
console.log("🌍 Current Location:", window.location.origin);

// App Configuration
export const APP_CONFIG = {
  name: "Pet Shop Management System",
  version: "1.0.0",
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
