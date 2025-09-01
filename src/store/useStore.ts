import { create } from "zustand";
import { Product, Transaction, CartItem, User } from "../types";
import { apiService } from "../services/api";

interface StoreState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  logout: () => void;

  // Products
  products: Product[];
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

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
    category: "Makanan Kucing",
  },
  {
    id: "2",
    name: "Pedigree Adult Dog Food",
    price: 95000,
    stock: 30,
    category: "Makanan Anjing",
  },
  {
    id: "3",
    name: "Cat Shampoo Premium",
    price: 65000,
    stock: 25,
    category: "Perawatan Kucing",
  },
  {
    id: "4",
    name: "Dog Shampoo Anti Flea",
    price: 75000,
    stock: 20,
    category: "Perawatan Anjing",
  },
  {
    id: "5",
    name: "Bird Cage Medium",
    price: 350000,
    stock: 10,
    category: "Aksesoris Burung",
  },
  {
    id: "6",
    name: "Cat Litter 5kg",
    price: 45000,
    stock: 40,
    category: "Perawatan Kucing",
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

        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("user", JSON.stringify(user));
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
      
      if (response.status === 'success') {
        localStorage.setItem('accessToken', response.data.accessToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Refresh token error:', error);
      // If refresh fails, logout user
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      set({ user: null, isAuthenticated: false });
      return false;
    }
  },
  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    set({ user: null, isAuthenticated: false });
  },

  // Products
  products: initialProducts,
  addProduct: (product) => {
    const newProduct = {
      ...product,
      id: Date.now().toString(),
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
