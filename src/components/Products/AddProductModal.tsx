import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { useStore } from "../../store/useStore";
import { Product } from "../../types";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct?: Product | null;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  editingProduct,
}) => {
  const {
    addProduct,
    updateProduct,
    brands,
    categories,
    loadBrands,
    loadCategories,
  } = useStore();

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    brandID: "",
    categoryID: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load brands and categories when modal opens
  useEffect(() => {
    if (isOpen) {
      loadBrands();
      loadCategories();
    }
  }, [isOpen, loadBrands, loadCategories]);

  // Set form data when editing
  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || "",
        price: editingProduct.price?.toString() || "",
        stock: editingProduct.stock?.toString() || "",
        brandID: editingProduct.brand?.id || "",
        categoryID: editingProduct.category?.id || "",
      });
    } else {
      setFormData({
        name: "",
        price: "",
        stock: "",
        brandID: "",
        categoryID: "",
      });
    }
  }, [editingProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.price ||
      !formData.stock ||
      !formData.brandID ||
      !formData.categoryID
    ) {
      alert("Mohon lengkapi semua field!");
      return;
    }

    setIsSubmitting(true);

    const productData = {
      name: formData.name.trim(),
      price: parseInt(formData.price),
      stock: parseInt(formData.stock),
      brandID: formData.brandID,
      categoryID: formData.categoryID,
    };

    try {
      let success = false;

      if (editingProduct) {
        success = await updateProduct(editingProduct.id, productData);
      } else {
        success = await addProduct(productData);
      }

      if (success) {
        onClose();
        setFormData({
          name: "",
          price: "",
          stock: "",
          brandID: "",
          categoryID: "",
        });
      } else {
        alert("Gagal menyimpan produk!");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Terjadi kesalahan saat menyimpan produk!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingProduct ? "Edit Produk" : "Tambah Produk"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Produk
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Brand
          </label>
          <select
            name="brandID"
            value={formData.brandID}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            required
          >
            <option value="">Pilih Brand</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kategori
          </label>
          <select
            name="categoryID"
            value={formData.categoryID}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            required
          >
            <option value="">Pilih Kategori</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
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
              name="price"
              value={formData.price}
              onChange={handleChange}
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
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              min="0"
              required
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Menyimpan..."
              : editingProduct
              ? "Update"
              : "Simpan"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
