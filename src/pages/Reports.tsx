import React, { useState } from 'react';
import { Calendar, FileText, Download } from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDate } from '../utils/auth';

export const Reports: React.FC = () => {
  const { transactions } = useStore();
  const [dateFilter, setDateFilter] = useState('');

  const filteredTransactions = dateFilter
    ? transactions.filter(t => t.date === dateFilter)
    : transactions;

  const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.total, 0);

  return (
    <Layout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Laporan Transaksi</h1>
            <p className="text-gray-600">Lihat dan kelola laporan penjualan</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Transaksi</h3>
            <p className="text-2xl font-bold text-blue-600">{filteredTransactions.length}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Omset</h3>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Rata-rata Transaksi</h3>
            <p className="text-2xl font-bold text-orange-600">
              {filteredTransactions.length > 0 
                ? formatCurrency(totalRevenue / filteredTransactions.length)
                : formatCurrency(0)
              }
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter Tanggal
            </label>
            <input
              id="date-filter"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Daftar Transaksi</h2>
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Download size={16} />
                <span>Export</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Transaksi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kasir
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{transaction.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs">
                        {transaction.items.map((item, index) => (
                          <div key={index} className="text-xs">
                            {item.product.name} (x{item.quantity})
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.cashier}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatCurrency(transaction.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredTransactions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Tidak ada transaksi yang ditemukan</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};