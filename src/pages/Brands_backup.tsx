import React, { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Layout } from "../components/Layout/Layout";
import { useStore } from "../store/useStore";
import { Brand } from "../types";

export const Brands: React.FC = () => {
  const {
    brands,
    isLoadingBrands,
    loadBrands,
    addBrand,
    updateBrand,
    deleteBrand,
  } = useStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [newBrandName, setNewBrandName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  // Filter brands based on search term
  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddBrand = async () => {
    if (newBrandName.trim()) {
      setIsSubmitting(true);
      const success = await addBrand(newBrandName.trim());
      if (success) {
        setNewBrandName("");
        setIsAddModalOpen(false);
      }
      setIsSubmitting(false);
    }
  };

  const handleEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setNewBrandName(brand.name);
    setIsAddModalOpen(true);
  };

  const handleUpdateBrand = async () => {
    if (editingBrand && newBrandName.trim()) {
      setIsSubmitting(true);
      const success = await updateBrand(editingBrand.id, newBrandName.trim());
      if (success) {
        setEditingBrand(null);
        setNewBrandName("");
        setIsAddModalOpen(false);
      }
      setIsSubmitting(false);
    }
  };

  const handleDeleteBrand = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus brand ini?")) {
      await deleteBrand(id);
    }
  };

  const resetForm = () => {
    setEditingBrand(null);
    setNewBrandName("");
    setIsAddModalOpen(false);
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Brand</h1>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Tambah Brand</span>
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Brands Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Brand
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dibuat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Diupdate
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoadingBrands ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="text-gray-500">Memuat brands...</div>
                  </td>
                </tr>
              ) : filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      {searchTerm
                        ? "Tidak ada brand yang ditemukan"
                        : "Belum ada brand. Silakan tambah brand baru."}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBrands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {brand.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(brand.createdAt).toLocaleDateString("id-ID")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(brand.updatedAt).toLocaleDateString("id-ID")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditBrand(brand)}
                          className="text-teal-600 hover:text-teal-900 p-1"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteBrand(brand.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add/Edit Brand Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={resetForm}
          title={editingBrand ? "Edit Brand" : "Tambah Brand"}
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="brandName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nama Brand
              </label>
              <input
                id="brandName"
                type="text"
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Masukkan nama brand"
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={resetForm}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                onClick={editingBrand ? handleUpdateBrand : handleAddBrand}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Memproses..."
                  : editingBrand
                  ? "Update"
                  : "Tambah"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};
