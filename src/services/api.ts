import { API_BASE_URL, TENANT_NAME } from "../config/app";
import { API_ENDPOINTS, STORAGE_KEYS } from "../constants";
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
  private getAuthHeaders() {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    return {
      "Content-Type": "application/json",
      "x-tenant-name": TENANT_NAME,
      ...(token && { Authorization: `Bearer ${token}` }),
    };
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
        endpoint !== "/auth/refresh" &&
        endpoint !== "/auth/login"
      ) {
        // Try to refresh token
        try {
          const refreshResponse = await this.refreshToken();
          if (refreshResponse.status === "success") {
            localStorage.setItem(
              "accessToken",
              refreshResponse.data.accessToken
            );
            // Retry the original request with new token
            const retryConfig: RequestInit = {
              ...config,
              headers: this.getAuthHeaders(),
            };
            const retryResponse = await fetch(url, retryConfig);
            if (retryResponse.ok) {
              return retryResponse.json();
            }
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
        }

        // If refresh fails, redirect to login
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        window.location.href = "/login";
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
      return await this.request<LoginResponse>(endpoint, {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
    } catch (error) {
      console.error("❌ Login failed:", error);
      console.error("🔍 URL tried:", url);
      throw error;
    }
  }

  async refreshToken(): Promise<RefreshTokenResponse> {
    return this.request<RefreshTokenResponse>(API_ENDPOINTS.AUTH.REFRESH, {
      method: "POST",
    });
  }

  async logout() {
    return this.request(API_ENDPOINTS.AUTH.LOGOUT, { method: "POST" });
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
    console.log("🔄 Updating product:", { id, productData });

    return this.request<ProductResponse>(API_ENDPOINTS.PRODUCTS.UPDATE(id), {
      method: "PUT",
      body: JSON.stringify(productData),
    });
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
}

export const apiService = new ApiService();
