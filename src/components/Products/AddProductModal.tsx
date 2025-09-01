import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useStore } from '../../store/useStore';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct?: any;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ 
  isOpen, 
  onClose,
  editingProduct 
}) => {
  const { addProduct, updateProduct } = useStore();
  const [formData, setFormData] = useState({
    name: editingProduct?.name || '',
    price: editingProduct?.price || '',
    stock: editingProduct?.stock || '',
    category: editingProduct?.category || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      name: formData.name,
      price: Number(formData.price),
      stock: Number(formData.stock),
      category: formData.category
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }

    setFormData({ name: '', price: '', stock: '', category: '' });
    onClose();
  };

  const categories = [
    'Makanan Kucing',
    'Makanan Anjing',
    'Perawatan Kucing',
    'Perawatan Anjing',
    'Aksesoris Burung',
    'Aksesoris Ikan',
    'Obat-obatan',
    'Lainnya'
  ];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={editingProduct ? 'Edit Produk' : 'Tambah Produk'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Produk
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kategori
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            required
          >
            <option value="">Pilih Kategori</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Harga
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stok
            </label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              min="0"
              required
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit">
            {editingProduct ? 'Update' : 'Simpan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};