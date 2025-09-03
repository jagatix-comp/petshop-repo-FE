import React from "react";
import { Layout } from "../components/Layout/Layout";
import { ProductSearch } from "../components/Cashier/ProductSearch";
import { Cart } from "../components/Cashier/Cart";

export const Cashier: React.FC = () => {
  return (
    <Layout>
      <div>
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Kasir</h1>
          <p className="text-gray-600">Proses transaksi penjualan</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ProductSearch />
          <Cart />
        </div>
      </div>
    </Layout>
  );
};
