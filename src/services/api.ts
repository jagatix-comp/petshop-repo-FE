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
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        window.location.href = "/login";
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

    return this.request<ProductsResponse>(`/products?${query}`);
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

    return this.request<CategoriesResponse>(`/categories?${query}`);
  }

  async createCategory(data: { name: string }): Promise<CategoryResponse> {
    return this.request<CategoryResponse>("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCategory(
    id: string,
    data: { name: string }
  ): Promise<CategoryResponse> {
    return this.request<CategoryResponse>(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string): Promise<CategoryResponse> {
    return this.request<CategoryResponse>(`/categories/${id}`, {
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
