import React from 'react';
import { Trash2, ShoppingCart, Minus, Plus } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatCurrency } from '../../utils/auth';
import { Button } from '../ui/Button';

export const Cart: React.FC = () => {
  const { 
    cart, 
    removeFromCart, 
    updateCartItemQuantity, 
    clearCart, 
    addTransaction 
  } = useStore();

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    updateCartItemQuantity(productId, newQuantity);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Keranjang masih kosong');
      return;
    }

    // Check stock availability
    for (const item of cart) {
      if (item.quantity > item.product.stock) {
        alert(`Stok ${item.product.name} tidak mencukupi`);
        return;
      }
    }

    addTransaction(cart, total);
    clearCart();
    alert('Transaksi berhasil disimpan!');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <ShoppingCart size={20} />
            <span>Keranjang</span>
          </h2>
          {cart.length > 0 && (
            <Button variant="secondary" onClick={clearCart} className="text-sm">
              Kosongkan
            </Button>
          )}
        </div>
      </div>

      <div className="p-6">
        {cart.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Keranjang masih kosong</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="max-h-64 overflow-y-auto space-y-3">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm">{item.product.name}</h3>
                    <p className="text-xs text-gray-600">{formatCurrency(item.product.price)}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center rounded bg-gray-200 hover:bg-gray-300 transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center rounded bg-gray-200 hover:bg-gray-300 transition-colors"
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-600 hover:text-red-800 transition-colors ml-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-xl font-bold text-teal-600">{formatCurrency(total)}</span>
              </div>
              
              <Button onClick={handleCheckout} className="w-full py-3">
                Simpan Transaksi
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};