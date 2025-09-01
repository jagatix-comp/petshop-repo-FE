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
