import React, { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Layout } from "../components/Layout/Layout";
import { useStore } from "../store/useStore";

export const Categories: React.FC = () => {
  const {
    categories,
    isLoadingCategories,
    loadCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useStore();

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
    if (newCategoryName.trim()) {
      setIsSubmitting(true);
      try {
        const success = await addCategory(newCategoryName.trim());
        if (success) {
          setNewCategoryName("");
          setIsAddModalOpen(false);
        } else {
          alert("Failed to add category");
        }
      } catch (error) {
        console.error("Error adding category:", error);
        alert("Failed to add category");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setIsAddModalOpen(true);
  };

  const handleUpdateCategory = async () => {
    if (editingCategory && newCategoryName.trim()) {
      setIsSubmitting(true);
      try {
        const success = await updateCategory(
          editingCategory.id,
          newCategoryName.trim()
        );
        if (success) {
          setNewCategoryName("");
          setEditingCategory(null);
          setIsAddModalOpen(false);
        } else {
          alert("Failed to update category");
        }
      } catch (error) {
        console.error("Error updating category:", error);
        alert("Failed to update category");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus kategori ini?")) {
      try {
        const success = await deleteCategory(id);
        if (!success) {
          alert("Failed to delete category");
        }
      } catch (error) {
        console.error("Error deleting category:", error);
        alert("Failed to delete category");
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
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
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
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
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
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
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
          title={editingCategory ? "Edit Category" : "Add New Category"}
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="categoryName"
                className="block text-sm font-medium text-gray-700"
              >
                Category Name
              </label>
              <input
                type="text"
                id="categoryName"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                  "Update Category"
                ) : (
                  "Add Category"
                )}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};
