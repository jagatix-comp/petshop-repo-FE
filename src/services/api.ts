// Environment Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const TENANT_NAME = import.meta.env.VITE_TENANT_NAME || "wojo";

// Debug logging for environment variables
console.log("🔧 API Service Configuration:");
console.log("🌐 API_BASE_URL:", API_BASE_URL);
console.log("🏢 TENANT_NAME:", TENANT_NAME);
console.log("🔍 Environment Mode:", import.meta.env.MODE);
console.log("🚀 Is Production:", import.meta.env.PROD);
console.log("🌍 Current Location:", window.location.origin);

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

interface Brand {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  tenant: {
    id: string;
    name: string;
    location: string;
  };
}

interface BrandsResponse {
  status: string;
  message: string;
  metadata: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: Brand[];
}

interface BrandResponse {
  status: string;
  message: string;
  data?: Brand;
}

interface Product {
  id: string;
  name: string;
  stock: number;
  price: number;
  created_at: string;
  updated_at: string;
  brand: {
    id: string;
    name: string;
  };
  category: {
    id: string;
    name: string;
  };
  tenant: {
    id: string;
    name: string;
    location: string;
  };
}

interface ProductsResponse {
  status: string;
  message: string;
  metadata: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: Product[];
}

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem("accessToken");
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
    const config: RequestInit = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    const response = await fetch(url, config);

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
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Auth endpoints
  async login(username: string, password: string): Promise<LoginResponse> {
    const endpoint = "/auth/login";
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
    return this.request<RefreshTokenResponse>("/auth/refresh", {
      method: "POST",
    });
  }

  async logout() {
    return this.request("/auth/logout", { method: "POST" });
  }

  async getCurrentUser() {
    return this.request<{ user: any }>("/auth/me");
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

    return this.request<ProductsResponse>(`/products?${query}`);
  }

  async createProduct(product: {
    name: string;
    price: number;
    stock: number;
    category: string;
  }) {
    return this.request<{ product: any }>("/products", {
      method: "POST",
      body: JSON.stringify(product),
    });
  }

  async updateProduct(
    id: string,
    product: Partial<{
      name: string;
      price: number;
      stock: number;
      category: string;
    }>
  ) {
    return this.request<{ product: any }>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/products/${id}`, { method: "DELETE" });
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

    return this.request<BrandsResponse>(`/brands?${query}`);
  }

  async createBrand(data: { name: string }): Promise<BrandResponse> {
    return this.request<BrandResponse>("/brands", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateBrand(
    id: string,
    data: { name: string }
  ): Promise<BrandResponse> {
    return this.request<BrandResponse>(`/brands/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteBrand(id: string): Promise<BrandResponse> {
    return this.request<BrandResponse>(`/brands/${id}`, {
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
}

export const apiService = new ApiService();
