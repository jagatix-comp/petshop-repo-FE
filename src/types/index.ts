export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
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