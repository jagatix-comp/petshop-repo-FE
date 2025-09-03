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

  // Profile
  loadProfile: () => Promise<boolean>;
  updateProfile: (data: {
    name: string;
    username: string;
    phoneNumber: string;
  }) => Promise<boolean>;
  changePassword: (data: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<boolean>;

  // User Management (for super admin)
  users: User[];
  isLoadingUsers: boolean;
  loadUsers: () => Promise<boolean>;
  createUser: (data: {
    name: string;
    username: string;
    password: string;
    confirmPassword: string;
    phoneNumber: string;
    role: string;
    tenantID: string;
  }) => Promise<boolean>;
  updateUser: (
    id: string,
    data: {
      name: string;
      username: string;
      password?: string;
      confirmPassword?: string;
      phoneNumber: string;
      role: string;
      tenantID: string;
    }
  ) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;

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
        // Save access token first
        localStorage.setItem(
          STORAGE_KEYS.ACCESS_TOKEN,
          response.data.accessToken
        );

        // Load actual profile data from API
        const profileLoaded = await get().loadProfile();

        if (profileLoaded) {
          set({ isAuthenticated: true });
          return true;
        } else {
          // Fallback: create user object from login data
          const user = {
            id: "1",
            name: username,
            email: username,
            role: "admin",
          };

          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
          set({ user, isAuthenticated: true });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  },
  refreshToken: async () => {
    try {
      console.log("🔄 Store: Attempting token refresh...");
      const response = await apiService.refreshToken();

      if (response.status === "success") {
        console.log("✅ Store: Token refresh successful");
        localStorage.setItem(
          STORAGE_KEYS.ACCESS_TOKEN,
          response.data.accessToken
        );
        return true;
      } else {
        console.log("❌ Store: Token refresh failed - invalid response");
        return false;
      }
    } catch (error) {
      console.error("❌ Store: Refresh token error:", error);
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

        // Load fresh profile data from API in background
        get().loadProfile().catch(console.error);
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
      console.log("🔄 Store: Loading products with params:", params);
      set({ isLoadingProducts: true });
      const response = await apiService.getProducts(params);
      console.log("📦 Store: Get products response:", response);

      if (response.status === "success") {
        console.log(
          "✅ Store: Products loaded successfully, count:",
          response.data?.length || 0
        );
        set({ products: response.data || [], isLoadingProducts: false });
      } else {
        console.log(
          "❌ Store: Failed to load products, response status:",
          response.status
        );
        set({ products: [], isLoadingProducts: false });
      }
    } catch (error) {
      console.error("❌ Store: Failed to load products:", error);
      set({ products: [], isLoadingProducts: false });
    }
  },
  addProduct: async (productData) => {
    try {
      console.log("🚀 Store: Adding product with data:", productData);
      const response = await apiService.createProduct(productData);
      console.log("📦 Store: Create product response:", response);

      if (response.status === "success") {
        console.log(
          "✅ Store: Product created successfully, reloading products..."
        );
        // Reload products after successful creation
        await get().loadProducts();
        console.log("🔄 Store: Products reloaded");
        return true;
      }
      console.log(
        "❌ Store: Product creation failed, response status:",
        response.status
      );
      return false;
    } catch (error) {
      console.error("❌ Store: Failed to add product:", error);
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
        set({ brands: response.data || [], isLoadingBrands: false });
      } else {
        set({ brands: [], isLoadingBrands: false });
      }
    } catch (error) {
      console.error("Failed to load brands:", error);
      set({ brands: [], isLoadingBrands: false });
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
        set({ categories: response.data || [], isLoadingCategories: false });
      } else {
        set({ categories: [], isLoadingCategories: false });
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
      set({ categories: [], isLoadingCategories: false });
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

  // Profile
  loadProfile: async () => {
    try {
      const response = await apiService.getProfile();
      if (response.status === "success") {
        const user = {
          id: response.data.id,
          name: response.data.name,
          email: response.data.username, // Using username as email for compatibility
          role: response.data.role,
          username: response.data.username,
          phoneNumber: response.data.phoneNumber,
          tenant: response.data.tenant,
        };

        set({ user });
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error loading profile:", error);
      return false;
    }
  },

  updateProfile: async (data) => {
    try {
      const response = await apiService.updateProfile(data);
      if (response.status === "success") {
        // Reload profile after successful update
        await get().loadProfile();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating profile:", error);
      return false;
    }
  },

  changePassword: async (data) => {
    try {
      const response = await apiService.changePassword(data);
      if (response.status === "success") {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error changing password:", error);
      return false;
    }
  },

  // User Management (for super admin)
  users: [],
  isLoadingUsers: false,

  loadUsers: async () => {
    set({ isLoadingUsers: true });
    try {
      const response = await apiService.getAllUsers();
      if (response.status === "success") {
        const users = response.data.map((userData) => ({
          id: userData.id,
          name: userData.name,
          email: userData.username, // Using username as email for compatibility
          role: userData.role,
          username: userData.username,
          phoneNumber: userData.phoneNumber,
          tenant: userData.tenant,
        }));
        set({ users, isLoadingUsers: false });
        return true;
      }
      set({ isLoadingUsers: false });
      return false;
    } catch (error) {
      console.error("Error loading users:", error);
      set({ isLoadingUsers: false });
      return false;
    }
  },

  createUser: async (data) => {
    try {
      const response = await apiService.createUser(data);
      if (response.status === "success") {
        // Reload users after successful creation
        await get().loadUsers();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error creating user:", error);
      return false;
    }
  },

  updateUser: async (id, data) => {
    try {
      const response = await apiService.updateUser(id, data);
      if (response.status === "success") {
        // Reload users after successful update
        await get().loadUsers();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating user:", error);
      return false;
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await apiService.deleteUser(id);
      if (response.status === "success") {
        // Reload users after successful deletion
        await get().loadUsers();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  },
}));
