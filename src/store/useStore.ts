import { create } from "zustand";
import { Product, Transaction, CartItem, User, Brand } from "../types";
import { apiService } from "../services/api";
import { STORAGE_KEYS } from "../constants";

interface StoreState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  logout: () => void;

  // Products
  products: Product[];
  isLoadingProducts: boolean;
  loadProducts: (params?: {
    search?: string;
    category?: string;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  addProduct: (
    product: Omit<
      Product,
      "id" | "created_at" | "updated_at" | "brand" | "category" | "tenant"
    >
  ) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

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

// Dummy initial data
const initialProducts: Product[] = [
  {
    id: "1",
    name: "Royal Canin Adult Cat Food",
    price: 125000,
    stock: 50,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    brand: { id: "b1", name: "Royal Canin" },
    category: { id: "c1", name: "Makanan Kucing" },
    tenant: { id: "t1", name: "Default Store", location: "Main Store" },
  },
  {
    id: "2",
    name: "Pedigree Adult Dog Food",
    price: 95000,
    stock: 30,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    brand: { id: "b2", name: "Pedigree" },
    category: { id: "c2", name: "Makanan Anjing" },
    tenant: { id: "t1", name: "Default Store", location: "Main Store" },
  },
  {
    id: "3",
    name: "Cat Shampoo Premium",
    price: 65000,
    stock: 25,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    brand: { id: "b3", name: "Premium Pet" },
    category: { id: "c3", name: "Perawatan Kucing" },
    tenant: { id: "t1", name: "Default Store", location: "Main Store" },
  },
  {
    id: "4",
    name: "Dog Shampoo Anti Flea",
    price: 75000,
    stock: 20,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    brand: { id: "b4", name: "Anti Flea Pro" },
    category: { id: "c4", name: "Perawatan Anjing" },
    tenant: { id: "t1", name: "Default Store", location: "Main Store" },
  },
  {
    id: "5",
    name: "Bird Cage Medium",
    price: 350000,
    stock: 10,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    brand: { id: "b5", name: "Cage Master" },
    category: { id: "c5", name: "Aksesoris Burung" },
    tenant: { id: "t1", name: "Default Store", location: "Main Store" },
  },
  {
    id: "6",
    name: "Cat Litter 5kg",
    price: 45000,
    stock: 40,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    brand: { id: "b6", name: "Clean Litter" },
    category: { id: "c6", name: "Perawatan Kucing" },
    tenant: { id: "t1", name: "Default Store", location: "Main Store" },
  },
];

const initialTransactions: Transaction[] = [
  {
    id: "1",
    date: new Date().toISOString().split("T")[0],
    items: [
      { product: initialProducts[0], quantity: 2 },
      { product: initialProducts[2], quantity: 1 },
    ],
    total: 315000,
    cashier: "Admin",
  },
];

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

        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.accessToken);
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
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.accessToken);
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

  // Products
  products: initialProducts,
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
  addProduct: (product) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      brand: { id: "default", name: "Default Brand" },
      category: { id: "default", name: "Default Category" },
      tenant: { id: "default", name: "Default Store", location: "Main Store" },
    };
    set((state) => ({ products: [...state.products, newProduct] }));
  },
  updateProduct: (id, updatedProduct) => {
    set((state) => ({
      products: state.products.map((product) =>
        product.id === id ? { ...product, ...updatedProduct } : product
      ),
    }));
  },
  deleteProduct: (id) => {
    set((state) => ({
      products: state.products.filter((product) => product.id !== id),
    }));
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

  // Transactions
  transactions: initialTransactions,
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
