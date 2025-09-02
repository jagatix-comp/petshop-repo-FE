export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
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

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Transaction {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  cashier: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Brand {
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

export interface Category {
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

// API Response Types
export interface ApiResponse<T> {
  status: string;
  message: string;
  metadata?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: T;
}

export interface BrandsResponse extends ApiResponse<Brand[]> {}
export interface BrandResponse extends ApiResponse<Brand> {}
export interface CategoriesResponse extends ApiResponse<Category[]> {}
export interface CategoryResponse extends ApiResponse<Category> {}

// Product operation types
export interface CreateProductRequest {
  name: string;
  stock: number;
  price: number;
  brandID: string;
  categoryID: string;
}

export interface UpdateProductRequest {
  name?: string;
  stock?: number;
  price?: number;
  brandID?: string;
  categoryID?: string;
}

export interface ProductResponse {
  status: string;
  message: string;
  data?: Product;
}

export interface ProductsResponse extends ApiResponse<Product[]> {}
