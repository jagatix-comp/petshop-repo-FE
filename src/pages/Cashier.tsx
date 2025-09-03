import React from "react";
import { Layout } from "../components/Layout/Layout";
import { ProductSearch } from "../components/Cashier/ProductSearch";
import { Cart } from "../components/Cashier/Cart";

export const Cashier: React.FC = () => {
  return (
    <Layout pageTitle="Kasir" pageDescription="Proses transaksi penjualan">
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ProductSearch />
          <Cart />
        </div>
      </div>
    </Layout>
  );
};
