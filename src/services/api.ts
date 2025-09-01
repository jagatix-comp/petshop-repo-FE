const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";
const TENANT_NAME = import.meta.env.VITE_TENANT_NAME || "default";

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
    return this.request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
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
