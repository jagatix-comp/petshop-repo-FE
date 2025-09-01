import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatCurrency } from '../../utils/auth';
import { Button } from '../ui/Button';

export const ProductSearch: React.FC = () => {
  const { products, addToCart } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    product.stock > 0
  );

  const handleAddToCart = (product: any) => {
    const quantity = quantities[product.id] || 1;
    if (quantity > product.stock) {
      alert('Jumlah melebihi stok yang tersedia');
      return;
    }
    addToCart(product, quantity);
    setQuantities(prev => ({ ...prev, [product.id]: 1 }));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setQuantities(prev => ({ ...prev, [productId]: Math.max(1, quantity) }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pilih Produk</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="p-6 max-h-96 overflow-y-auto">
        <div className="space-y-3">
          {filteredProducts.map((product) => (
            <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.category}</p>
                <p className="text-sm font-medium text-teal-600">{formatCurrency(product.price)}</p>
                <p className="text-xs text-gray-500">Stok: {product.stock} unit</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantities[product.id] || 1}
                  onChange={(e) => updateQuantity(product.id, parseInt(e.target.value))}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <Button
                  onClick={() => handleAddToCart(product)}
                  className="flex items-center space-x-1 text-sm px-3 py-2"
                >
                  <Plus size={16} />
                  <span>Tambah</span>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {searchTerm ? 'Tidak ada produk yang ditemukan' : 'Mulai ketik untuk mencari produk'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};