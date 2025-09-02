import { create } from "zustand";
import {
  Product,
  Transaction,
  CartItem,
  User,
  Brand,
  Category,
  CreateProductRequest,
  UpdateProductRequest,
} from "../types";
import { apiService } from "../services/api";
import { STORAGE_KEYS } from "../constants";

interface StoreState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  logout: () => void;
  initializeAuth: () => void;

  // Products
  products: Product[];
  isLoadingProducts: boolean;
  loadProducts: (params?: {
    search?: string;
    category?: string;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  addProduct: (productData: CreateProductRequest) => Promise<boolean>;
  updateProduct: (
    id: string,
    productData: UpdateProductRequest
  ) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;

  // Brands
  brands: Brand[];
  isLoadingBrands: boolean;
  loadBrands: (params?: {
    search?: string;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  addBrand: (name: string) => Promise<boolean>;
  updateBrand: (id: string, name: string) => Promise<boolean>;
  deleteBrand: (id: string) => Promise<boolean>;

  // Categories
  categories: Category[];
  isLoadingCategories: boolean;
  loadCategories: (params?: {
    search?: string;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  addCategory: (name: string) => Promise<boolean>;
  updateCategory: (id: string, name: string) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;

  // Transactions
  transactions: Transaction[];
  addTransaction: (items: CartItem[], total: number) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  // Auth
  user: null,
  isAuthenticated: false,
  login: async (username: string, password: string) => {
    try {
      const response = await apiService.login(username, password);

      if (response.status === "success") {
        const user = {
          id: "1",
          name: username,
          email: username,
          role: "admin",
        };

        localStorage.setItem(
          STORAGE_KEYS.ACCESS_TOKEN,
          response.data.accessToken
        );
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        set({ user, isAuthenticated: true });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  },
  refreshToken: async () => {
    try {
      const response = await apiService.refreshToken();

      if (response.status === "success") {
        localStorage.setItem(
          STORAGE_KEYS.ACCESS_TOKEN,
          response.data.accessToken
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error("Refresh token error:", error);
      // If refresh fails, logout user
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      set({ user: null, isAuthenticated: false });
      return false;
    }
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    set({ user: null, isAuthenticated: false });
  },
  initializeAuth: () => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const userData = localStorage.getItem(STORAGE_KEYS.USER);

      if (token && userData) {
        const user = JSON.parse(userData);
        set({ user, isAuthenticated: true });
      }
    } catch (error) {
      console.error("Failed to initialize auth:", error);
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  },

  // Products
  products: [],
  isLoadingProducts: false,
  loadProducts: async (params) => {
    try {
      set({ isLoadingProducts: true });
      const response = await apiService.getProducts(params);
      if (response.status === "success") {
        set({ products: response.data, isLoadingProducts: false });
      } else {
        set({ isLoadingProducts: false });
      }
    } catch (error) {
      console.error("Failed to load products:", error);
      set({ isLoadingProducts: false });
    }
  },
  addProduct: async (productData) => {
    try {
      const response = await apiService.createProduct(productData);
      if (response.status === "success") {
        // Reload products after successful creation
        await get().loadProducts();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to add product:", error);
      return false;
    }
  },
  updateProduct: async (id, productData) => {
    try {
      const response = await apiService.updateProduct(id, productData);
      if (response.status === "success") {
        // Reload products after successful update
        await get().loadProducts();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to update product:", error);
      return false;
    }
  },
  deleteProduct: async (id) => {
    try {
      const response = await apiService.deleteProduct(id);
      if (response.status === "success") {
        // Remove product from local state
        const currentProducts = get().products;
        const updatedProducts = currentProducts.filter((p) => p.id !== id);
        set({ products: updatedProducts });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to delete product:", error);
      return false;
    }
  },

  // Brands
  brands: [],
  isLoadingBrands: false,
  loadBrands: async (params) => {
    try {
      set({ isLoadingBrands: true });
      const response = await apiService.getBrands(params);
      if (response.status === "success") {
        set({ brands: response.data, isLoadingBrands: false });
      } else {
        set({ isLoadingBrands: false });
      }
    } catch (error) {
      console.error("Failed to load brands:", error);
      set({ isLoadingBrands: false });
    }
  },
  addBrand: async (name) => {
    try {
      const response = await apiService.createBrand({ name });
      if (response.status === "success") {
        // Reload brands after adding
        await get().loadBrands();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to add brand:", error);
      return false;
    }
  },
  updateBrand: async (id, name) => {
    try {
      const response = await apiService.updateBrand(id, { name });
      if (response.status === "success") {
        // Reload brands after updating
        await get().loadBrands();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to update brand:", error);
      return false;
    }
  },
  deleteBrand: async (id) => {
    try {
      const response = await apiService.deleteBrand(id);
      if (response.status === "success") {
        // Reload brands after deleting
        await get().loadBrands();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to delete brand:", error);
      return false;
    }
  },

  // Categories
  categories: [],
  isLoadingCategories: false,
  loadCategories: async (params) => {
    try {
      set({ isLoadingCategories: true });
      const response = await apiService.getCategories(params);
      if (response.status === "success") {
        set({ categories: response.data, isLoadingCategories: false });
      } else {
        set({ isLoadingCategories: false });
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
      set({ isLoadingCategories: false });
    }
  },
  addCategory: async (name) => {
    try {
      const response = await apiService.createCategory({ name });
      if (response.status === "success") {
        // Reload categories after adding
        await get().loadCategories();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to add category:", error);
      return false;
    }
  },
  updateCategory: async (id, name) => {
    try {
      const response = await apiService.updateCategory(id, { name });
      if (response.status === "success") {
        // Reload categories after updating
        await get().loadCategories();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to update category:", error);
      return false;
    }
  },
  deleteCategory: async (id) => {
    try {
      const response = await apiService.deleteCategory(id);
      if (response.status === "success") {
        // Reload categories after deleting
        await get().loadCategories();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to delete category:", error);
      return false;
    }
  },

  // Transactions
  transactions: [],
  addTransaction: (items, total) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      items,
      total,
      cashier: get().user?.name || "Unknown",
    };

    // Update stock
    items.forEach((item) => {
      const product = get().products.find((p) => p.id === item.product.id);
      if (product) {
        get().updateProduct(item.product.id, {
          stock: product.stock - item.quantity,
        });
      }
    });

    set((state) => ({
      transactions: [newTransaction, ...state.transactions],
    }));
  },

  // Cart
  cart: [],
  addToCart: (product, quantity) => {
    set((state) => {
      const existingItem = state.cart.find(
        (item) => item.product.id === product.id
      );
      if (existingItem) {
        return {
          cart: state.cart.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }
      return {
        cart: [...state.cart, { product, quantity }],
      };
    });
  },
  removeFromCart: (productId) => {
    set((state) => ({
      cart: state.cart.filter((item) => item.product.id !== productId),
    }));
  },
  clearCart: () => set({ cart: [] }),
  updateCartItemQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    set((state) => ({
      cart: state.cart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      ),
    }));
  },
}));
