import React from "react";
import { Package, ShoppingCart, TrendingUp, Calendar } from "lucide-react";
import { Layout } from "../components/Layout/Layout";
import { useStore } from "../store/useStore";
import { formatCurrency } from "../utils/auth";

export const Dashboard: React.FC = () => {
  const { products, transactions, user } = useStore();

  const today = new Date().toISOString().split("T")[0];
  const todayTransactions = transactions.filter((t) => t.date === today);
  const todayRevenue = todayTransactions.reduce((sum, t) => sum + t.total, 0);
  const totalProducts = products.length;
  const lowStockProducts = products.filter((p) => p.stock < 10).length;

  const stats = [
    {
      title: "Total Produk",
      value: totalProducts,
      icon: Package,
      color: "bg-blue-500",
      textColor: "text-blue-600",
    },
    {
      title: "Transaksi Hari Ini",
      value: todayTransactions.length,
      icon: ShoppingCart,
      color: "bg-green-500",
      textColor: "text-green-600",
    },
    {
      title: "Omset Hari Ini",
      value: formatCurrency(todayRevenue),
      icon: TrendingUp,
      color: "bg-orange-500",
      textColor: "text-orange-600",
    },
    {
      title: "Stok Menipis",
      value: lowStockProducts,
      icon: Calendar,
      color: "bg-red-500",
      textColor: "text-red-600",
    },
  ];

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Selamat datang, {user?.username}!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                {stat.title}
              </h3>
              <p className={`text-2xl font-bold ${stat.textColor}`}>
                {typeof stat.value === "number" &&
                stat.title !== "Omset Hari Ini"
                  ? stat.value
                  : stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Produk Stok Menipis
            </h2>
            <div className="space-y-3">
              {products
                .filter((p) => p.stock < 10)
                .slice(0, 5)
                .map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {product.category}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-red-600">
                      Stok: {product.stock}
                    </span>
                  </div>
                ))}
              {products.filter((p) => p.stock < 10).length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Semua produk memiliki stok yang cukup
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Transaksi Terbaru
            </h2>
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      #{transaction.id}
                    </p>
                    <p className="text-sm text-gray-600">
                      {transaction.cashier}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">
                      {formatCurrency(transaction.total)}
                    </p>
                    <p className="text-sm text-gray-600">{transaction.date}</p>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Belum ada transaksi
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
