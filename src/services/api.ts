import { API_BASE_URL, TENANT_NAME } from "../config/app";
import { API_ENDPOINTS, STORAGE_KEYS } from "../constants";
import { getRefreshTokenFromCookie } from "../utils/auth";
import type {
  BrandsResponse,
  BrandResponse,
  CategoriesResponse,
  CategoryResponse,
  ProductsResponse,
  ProductResponse,
  CreateProductRequest,
  UpdateProductRequest,
} from "../types";

interface LoginResponse {
  status: string;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string; // Add refreshToken to response
  };
}

interface RefreshTokenResponse {
  status: string;
  message: string;
  data: {
    accessToken: string;
  };
}

interface UserProfileResponse {
  status: string;
  message: string;
  data: {
    id: string;
    name: string;
    username: string;
    phoneNumber: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    tenant: {
      id: string;
      name: string;
      location: string;
    };
  };
}

interface UpdateProfileRequest {
  name: string;
  username: string;
  phoneNumber: string;
}

interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface UsersResponse {
  status: string;
  message: string;
  data: {
    id: string;
    name: string;
    username: string;
    phoneNumber: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    tenant: {
      id: string;
      name: string;
      location: string;
    };
  }[];
}

interface CreateUserRequest {
  name: string;
  username: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  role: string;
  tenantID: string;
}

interface UpdateUserRequest {
  name: string;
  username: string;
  password?: string;
  confirmPassword?: string;
  phoneNumber: string;
  role: string;
  tenantID: string;
}

class ApiService {
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;
  private isLoggingOut = false;

  private getAuthHeaders() {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    return {
      "Content-Type": "application/json",
      "x-tenant-name": TENANT_NAME,
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async refreshTokenIfNeeded(): Promise<string | null> {
    if (this.isRefreshing && this.refreshPromise) {
      try {
        return await this.refreshPromise;
      } catch (error) {
        this.isRefreshing = false;
        this.refreshPromise = null;
        throw error;
      }
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const newToken = await this.refreshPromise;
      this.isRefreshing = false;
      this.refreshPromise = null;
      return newToken;
    } catch (error) {
      this.isRefreshing = false;
      this.refreshPromise = null;
      throw error;
    }
  }

  private async performTokenRefresh(): Promise<string> {
    console.log("🔄 Attempting to refresh token...");

    // Get refresh token from cookie
    const refreshToken = getRefreshTokenFromCookie();

    if (!refreshToken) {
      console.error("❌ No refresh token found in cookie");
      throw new Error("No refresh token found");
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-tenant-name": TENANT_NAME,
          },
          credentials: "include", // Include cookies to receive new refresh token
          body: JSON.stringify({ refreshToken }), // Send refresh token in body
        }
      );

      console.log("📡 Refresh Token Response:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      if (!response.ok) {
        throw new Error(`Refresh failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("✅ Refresh token response:", result);

      if (result.status === "success" && result.data?.accessToken) {
        localStorage.setItem(
          STORAGE_KEYS.ACCESS_TOKEN,
          result.data.accessToken
        );
        console.log("✅ Token refresh successful, new token saved");
        return result.data.accessToken;
      } else {
        throw new Error("Invalid refresh response format");
      }
    } catch (error) {
      console.error("❌ Refresh token failed:", error);
      // Clear tokens dan redirect ke login
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      // Clear refresh token cookie
      document.cookie =
        "refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";

      // Only redirect if not already on login page and not logging out
      if (!this.isLoggingOut && !window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
      throw error;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    console.log("🌐 API Request:", {
      method: options.method || "GET",
      url,
      endpoint,
      headers: options.headers || this.getAuthHeaders(),
    });

    const config: RequestInit = {
      headers: this.getAuthHeaders(),
      credentials: "include", // Include cookies for refresh token
      ...options,
    };

    const response = await fetch(url, config);

    console.log("📡 API Response:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      url,
    });

    if (!response.ok) {
      if (
        response.status === 401 &&
        endpoint !== API_ENDPOINTS.AUTH.REFRESH &&
        endpoint !== API_ENDPOINTS.AUTH.LOGIN &&
        !this.isLoggingOut // Don't try to refresh during logout
      ) {
        // Try to refresh token
        try {
          console.log("🔄 Access token expired, attempting refresh...");
          const newToken = await this.refreshTokenIfNeeded();

          if (newToken) {
            // Retry the original request with new token
            const retryConfig: RequestInit = {
              ...config,
              headers: {
                ...this.getAuthHeaders(),
                Authorization: `Bearer ${newToken}`,
              },
            };
            console.log("🔄 Retrying original request with new token...");
            const retryResponse = await fetch(url, retryConfig);
            if (retryResponse.ok) {
              console.log("✅ Retry request successful");
              return retryResponse.json();
            } else {
              console.error("❌ Retry request failed:", retryResponse.status);
              throw new Error(`Retry failed: ${retryResponse.statusText}`);
            }
          }
        } catch (refreshError) {
          console.error("❌ Token refresh failed with error:", refreshError);
          // Error handling sudah dilakukan di performTokenRefresh()
          return Promise.reject(new Error("Authentication failed"));
        }
      }

      // Log error details
      try {
        const errorText = await response.text();
        console.error("❌ API Error Details:", {
          status: response.status,
          statusText: response.statusText,
          url,
          errorBody: errorText,
        });
      } catch (e) {
        console.error("❌ Could not read error response body");
      }

      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Auth endpoints
  async login(username: string, password: string): Promise<LoginResponse> {
    const endpoint = API_ENDPOINTS.AUTH.LOGIN;
    const url = `${API_BASE_URL}${endpoint}`;

    console.log("🚀 Login attempt:", { url, username, tenant: TENANT_NAME });

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-name": TENANT_NAME,
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("✅ Login response:", result);

      // // Debug cookies after login
      // console.log("🍪 Debug cookies after login");
      // debugCookies();

      // Note: Based on your API docs, login only returns accessToken
      // The refreshToken is sent as HTTP-only cookie, not in response
      return {
        status: result.status,
        message: result.message,
        data: {
          accessToken: result.data.accessToken,
          refreshToken: "", // Empty since it's in cookie
        },
      };
    } catch (error) {
      console.error("❌ Login failed:", error);
      console.error("🔍 URL tried:", url);
      throw error;
    }
  }

  async refreshToken(): Promise<RefreshTokenResponse> {
    console.log("🔄 Manual refresh token call...");
    try {
      const newToken = await this.performTokenRefresh();
      return {
        status: "success",
        message: "Token refreshed successfully",
        data: {
          accessToken: newToken,
        },
      };
    } catch (error) {
      console.error("❌ Manual refresh token failed:", error);
      throw error;
    }
  }

  async logout() {
    console.log("🚪 Starting logout process...");

    // Set logout flag to prevent refresh attempts
    this.isLoggingOut = true;

    try {
      // Use direct fetch to avoid token refresh interceptor
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGOUT}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-tenant-name": TENANT_NAME,
          },
          credentials: "include", // Important for refresh token cookie
        }
      );

      console.log("🚪 Logout API response:", response.status);
    } catch (error) {
      console.error("❌ Logout API call failed:", error);
    } finally {
      // Clear local storage regardless of API success
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN); // Remove old localStorage refresh token
      localStorage.removeItem(STORAGE_KEYS.USER);

      // Reset refresh state
      this.isRefreshing = false;
      this.refreshPromise = null;
      this.isLoggingOut = false;

      console.log("🚪 Logout cleanup completed");
    }
  }

  async getCurrentUser() {
    return this.request<{ user: any }>(API_ENDPOINTS.AUTH.ME);
  }

  // Products endpoints
  async getProducts(params?: {
    search?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<ProductsResponse> {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.category) query.append("category", params.category);
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());

    const queryString = query.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.PRODUCTS.LIST}?${queryString}`
      : API_ENDPOINTS.PRODUCTS.LIST;

    console.log("📡 API: Getting products with endpoint:", endpoint);
    console.log("📡 API: Query params:", params);

    return this.request<ProductsResponse>(endpoint);
  }

  async createProduct(
    productData: CreateProductRequest
  ): Promise<ProductResponse> {
    console.log("🚀 Creating product:", productData);

    return this.request<ProductResponse>(API_ENDPOINTS.PRODUCTS.CREATE, {
      method: "POST",
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(
    id: string,
    productData: UpdateProductRequest
  ): Promise<ProductResponse> {
    console.log("🔄 API: Updating product:", { id, productData });

    try {
      const response = await this.request<ProductResponse>(
        API_ENDPOINTS.PRODUCTS.UPDATE(id),
        {
          method: "PUT",
          body: JSON.stringify(productData),
        }
      );

      console.log("✅ API: Product update successful:", response);
      return response;
    } catch (error) {
      console.error("❌ API: Product update failed:", error);
      console.error("Request data:", { id, productData });
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<ProductResponse> {
    console.log("🗑️ Deleting product:", id);

    return this.request<ProductResponse>(API_ENDPOINTS.PRODUCTS.DELETE(id), {
      method: "DELETE",
    });
  }

  async getLowStockProducts(threshold = 10) {
    return this.request<{ products: any[] }>(
      `/products/low-stock?threshold=${threshold}`
    );
  }

  // Brands endpoints
  async getBrands(params?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<BrandsResponse> {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());

    const queryString = query.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.BRANDS.LIST}?${queryString}`
      : API_ENDPOINTS.BRANDS.LIST;

    return this.request<BrandsResponse>(endpoint);
  }

  async createBrand(data: { name: string }): Promise<BrandResponse> {
    return this.request<BrandResponse>(API_ENDPOINTS.BRANDS.CREATE, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateBrand(
    id: string,
    data: { name: string }
  ): Promise<BrandResponse> {
    return this.request<BrandResponse>(API_ENDPOINTS.BRANDS.UPDATE(id), {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteBrand(id: string): Promise<BrandResponse> {
    return this.request<BrandResponse>(API_ENDPOINTS.BRANDS.DELETE(id), {
      method: "DELETE",
    });
  }

  // Categories endpoints
  async getCategories(params?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<CategoriesResponse> {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());

    const queryString = query.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.CATEGORIES.LIST}?${queryString}`
      : API_ENDPOINTS.CATEGORIES.LIST;

    return this.request<CategoriesResponse>(endpoint);
  }

  async createCategory(data: { name: string }): Promise<CategoryResponse> {
    return this.request<CategoryResponse>(API_ENDPOINTS.CATEGORIES.CREATE, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCategory(
    id: string,
    data: { name: string }
  ): Promise<CategoryResponse> {
    return this.request<CategoryResponse>(API_ENDPOINTS.CATEGORIES.UPDATE(id), {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string): Promise<CategoryResponse> {
    return this.request<CategoryResponse>(API_ENDPOINTS.CATEGORIES.DELETE(id), {
      method: "DELETE",
    });
  }

  // New Transaction API methods
  async createTransactionV2(data: {
    PaymentMethod: string;
    TotalPrice: number;
    Products: Array<{ id: string; quantity: number; price: number }>;
  }) {
    return this.request<{
      status: string;
      message: string;
      data: {
        id: string;
        PaymentMethod: string;
        TotalPrice: number;
        user: {
          id: string;
          name: string;
          username: string;
          phoneNumber: string;
          role: string;
        };
        tenant: {
          id: string;
          name: string;
          location: string;
        };
        products: Array<{
          id: string;
          name: string;
          price: number;
          quantity: number;
        }>;
        created_at: string;
        updated_at: string;
      };
    }>("/transactions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getTransactionsV2(page: number = 1, limit: number = 10) {
    return this.request<{
      status: string;
      message: string;
      metadata: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
      data: Array<{
        id: string;
        PaymentMethod: string;
        TotalPrice: number;
        user: {
          id: string;
          name: string;
          username: string;
          phoneNumber: string;
          role: string;
        };
        tenant: {
          id: string;
          name: string;
          location: string;
        };
        products: Array<{
          id: string;
          name: string;
          price: number;
          quantity: number;
        }>;
        created_at: string;
        updated_at: string;
      }>;
    }>(`/transactions?page=${page}&limit=${limit}`);
  }

  async getTransactionByIdV2(id: string) {
    return this.request<{
      status: string;
      message: string;
      data: {
        id: string;
        PaymentMethod: string;
        TotalPrice: number;
        user: {
          id: string;
          name: string;
          username: string;
          phoneNumber: string;
          role: string;
        };
        tenant: {
          id: string;
          name: string;
          location: string;
        };
        products: Array<{
          id: string;
          name: string;
          price: number;
          quantity: number;
        }>;
        created_at: string;
        updated_at: string;
      };
    }>(`/transactions/${id}`);
  }

  // Transactions endpoints
  async createTransaction(data: {
    items: Array<{ product_id: string; quantity: number }>;
    total: number;
  }) {
    return this.request<{ transaction: any; updated_products: any[] }>(
      "/transactions",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async getTransactions(params?: {
    date?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.date) query.append("date", params.date);
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());

    return this.request<{
      transactions: any[];
      total: number;
      page: number;
      limit: number;
    }>(`/transactions?${query}`);
  }

  async getTransaction(id: string) {
    return this.request<{ transaction: any; items: any[] }>(
      `/transactions/${id}`
    );
  }

  // Dashboard/Reports endpoints
  async getDashboardStats(date?: string) {
    const query = date ? `?date=${date}` : "";
    return this.request<{
      total_products: number;
      today_transactions: number;
      today_revenue: number;
      low_stock_count: number;
    }>(`/dashboard/stats${query}`);
  }

  async getSalesReport(params: {
    start_date?: string;
    end_date?: string;
    group_by?: "day" | "month";
  }) {
    const query = new URLSearchParams();
    if (params.start_date) query.append("start_date", params.start_date);
    if (params.end_date) query.append("end_date", params.end_date);
    if (params.group_by) query.append("group_by", params.group_by);

    return this.request<{
      summary: { total_revenue: number; total_transactions: number };
      data: Array<{ date: string; revenue: number; transactions: number }>;
    }>(`/reports/sales?${query}`);
  }

  async getProductsReport(params: { start_date?: string; end_date?: string }) {
    const query = new URLSearchParams();
    if (params.start_date) query.append("start_date", params.start_date);
    if (params.end_date) query.append("end_date", params.end_date);

    return this.request<{
      best_selling: any[];
      revenue_by_category: any[];
    }>(`/reports/products?${query}`);
  }

  // Profile API endpoints
  async getProfile(): Promise<UserProfileResponse> {
    return this.request<UserProfileResponse>("/auth/me");
  }

  async updateProfile(
    data: UpdateProfileRequest
  ): Promise<{ status: string; message: string }> {
    return this.request<{ status: string; message: string }>("/auth/me", {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
  }

  async changePassword(
    data: ChangePasswordRequest
  ): Promise<{ status: string; message: string }> {
    return this.request<{ status: string; message: string }>(
      "/auth/me/change-password",
      {
        method: "PATCH",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );
  }

  // User Management API endpoints (for super admin)
  async getAllUsers(): Promise<UsersResponse> {
    return this.request<UsersResponse>("/users");
  }

  async createUser(
    data: CreateUserRequest
  ): Promise<{ status: string; message: string }> {
    return this.request<{ status: string; message: string }>("/users", {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
  }

  async updateUser(
    id: string,
    data: UpdateUserRequest
  ): Promise<{ status: string; message: string }> {
    return this.request<{ status: string; message: string }>(`/users/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string): Promise<{ status: string; message: string }> {
    return this.request<{ status: string; message: string }>(`/users/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });
  }

  // Debug helper method
  debugRefreshToken() {
    console.log("🔍 Refresh Token Debug Info:", {
      isRefreshing: this.isRefreshing,
      isLoggingOut: this.isLoggingOut,
      hasRefreshPromise: !!this.refreshPromise,
      hasAccessToken: !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
      hasRefreshTokenCookie: !!getRefreshTokenFromCookie(),
      accessToken:
        localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)?.substring(0, 20) +
        "...",
    });
    // Also log cookie details
    // debugCookies();
  }
}

export const apiService = new ApiService();
