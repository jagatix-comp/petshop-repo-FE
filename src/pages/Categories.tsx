import React, { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Layout } from "../components/Layout/Layout";
import { useStore } from "../store/useStore";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/ui/Toast";
import Swal from "sweetalert2";

export const Categories: React.FC = () => {
  const {
    categories,
    isLoadingCategories,
    loadCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useStore();

  const { toast, toasts, dismissToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Filter categories based on search term
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Nama kategori tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }

    // Check if category already exists
    const existingCategory = categories.find(
      (category) =>
        category.name.toLowerCase() === newCategoryName.trim().toLowerCase()
    );

    if (existingCategory) {
      toast({
        title: "Error",
        description: "Kategori dengan nama tersebut sudah ada",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await addCategory(newCategoryName.trim());
      if (success) {
        toast({
          title: "Berhasil",
          description: "Kategori berhasil ditambahkan",
          variant: "success",
        });
        setNewCategoryName("");
        setIsAddModalOpen(false);
      } else {
        toast({
          title: "Error",
          description: "Gagal menambahkan kategori",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding category:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menambahkan kategori",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setIsAddModalOpen(true);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Nama kategori tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }

    // Check if category name already exists (excluding current category)
    const existingCategory = categories.find(
      (category) =>
        category.id !== editingCategory.id &&
        category.name.toLowerCase() === newCategoryName.trim().toLowerCase()
    );

    if (existingCategory) {
      toast({
        title: "Error",
        description: "Kategori dengan nama tersebut sudah ada",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await updateCategory(
        editingCategory.id,
        newCategoryName.trim()
      );
      if (success) {
        toast({
          title: "Berhasil",
          description: "Kategori berhasil diupdate",
          variant: "success",
        });
        setNewCategoryName("");
        setEditingCategory(null);
        setIsAddModalOpen(false);
      } else {
        toast({
          title: "Error",
          description: "Gagal mengupdate kategori",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengupdate kategori",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const result = await Swal.fire({
      title: "Hapus Kategori",
      text: "Apakah Anda yakin ingin menghapus kategori ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const success = await deleteCategory(id);
        if (success) {
          await Swal.fire({
            title: "Berhasil!",
            text: "Kategori berhasil dihapus",
            icon: "success",
            confirmButtonColor: "#059669",
          });
        } else {
          await Swal.fire({
            title: "Error!",
            text: "Gagal menghapus kategori",
            icon: "error",
            confirmButtonColor: "#dc2626",
          });
        }
      } catch (error) {
        console.error("Error deleting category:", error);
        await Swal.fire({
          title: "Error!",
          text: "Terjadi kesalahan saat menghapus kategori",
          icon: "error",
          confirmButtonColor: "#dc2626",
        });
      }
    }
  };

  const resetForm = () => {
    setEditingCategory(null);
    setNewCategoryName("");
    setIsAddModalOpen(false);
  };

  const handleSubmit = () => {
    if (editingCategory) {
      handleUpdateCategory();
    } else {
      handleAddCategory();
    }
  };

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Manajemen Kategori
          </h1>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Tambah Kategori
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search categories..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Categories Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dibuat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Diupdate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoadingCategories ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center">
                    <Loader2 className="animate-spin mx-auto" size={24} />
                    <p className="mt-2 text-gray-500">Loading categories...</p>
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    {searchTerm
                      ? "No categories found matching your search."
                      : "No categories available."}
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {category.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(category.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(category.updatedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="text-teal-600 hover:text-teal-900 mr-4"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add/Edit Category Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={resetForm}
          title={editingCategory ? "Edit Category" : "Tambah Kategori Baru"}
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="categoryName"
                className="block text-sm font-medium text-gray-700"
              >
                Nama Kategori
              </label>
              <input
                type="text"
                id="categoryName"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                placeholder="Enter category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={resetForm}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!newCategoryName.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />
                    {editingCategory ? "Updating..." : "Adding..."}
                  </>
                ) : editingCategory ? (
                  "Ubah Kategori"
                ) : (
                  "Tambah Kategori"
                )}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Toast Container */}
        <ToastContainer toasts={toasts} onClose={dismissToast} />
      </div>
    </Layout>
  );
};
