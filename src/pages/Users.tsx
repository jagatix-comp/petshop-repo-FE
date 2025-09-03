import React, { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Users as UsersIcon } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Layout } from "../components/Layout/Layout";
import { useStore } from "../store/useStore";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/ui/Toast";
import { AddUserModal } from "../components/Users/AddUserModal";
import Swal from "sweetalert2";

export const Users: React.FC = () => {
  const {
    users,
    isLoadingUsers,
    loadUsers,
    deleteUser,
    user: currentUser,
  } = useStore();

  const { toast, toasts, dismissToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  useEffect(() => {
    // Only load users if current user is super admin
    if (currentUser?.role === "super_admin") {
      loadUsers();
    }
  }, [loadUsers, currentUser]);

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setIsAddModalOpen(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setIsAddModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Hapus User",
      text: "Apakah Anda yakin ingin menghapus user ini?",
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
        const success = await deleteUser(id);
        if (success) {
          await Swal.fire({
            title: "Berhasil!",
            text: "User berhasil dihapus",
            icon: "success",
            confirmButtonColor: "#059669",
          });
        } else {
          await Swal.fire({
            title: "Error!",
            text: "Gagal menghapus user",
            icon: "error",
            confirmButtonColor: "#dc2626",
          });
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        await Swal.fire({
          title: "Error!",
          text: "Terjadi kesalahan saat menghapus user",
          icon: "error",
          confirmButtonColor: "#dc2626",
        });
      }
    }
  };

  // Check if current user is super admin
  if (currentUser?.role !== "super_admin") {
    return (
      <Layout>
        <div className="p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Akses Ditolak
            </h1>
            <p className="text-gray-600">
              Anda tidak memiliki akses untuk melihat halaman ini.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                <UsersIcon className="h-8 w-8" />
                Manajemen User
              </h1>
              <p className="text-gray-600">Kelola user dan hak akses sistem</p>
            </div>
            <Button onClick={handleAdd} className="flex items-center space-x-2">
              <Plus size={20} />
              <span>Tambah User</span>
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tenant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Telepon
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoadingUsers ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="text-gray-500">Memuat users...</div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          {searchTerm
                            ? "Tidak ada user yang ditemukan"
                            : "Belum ada user. Silakan tambah user baru."}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              @{user.username}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              user.role === "super_admin"
                                ? "bg-purple-100 text-purple-800"
                                : user.role === "admin"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {user.role === "super_admin"
                              ? "Super Admin"
                              : user.role === "admin"
                              ? "Admin"
                              : "User"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {user.tenant?.name || "-"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.tenant?.location || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.phoneNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(user)}
                              className="text-teal-600 hover:text-teal-900 p-1 rounded-lg hover:bg-teal-50"
                              title="Edit user"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded-lg hover:bg-red-50"
                              title="Hapus user"
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
          </div>
        </div>

        {/* Add/Edit User Modal */}
        <AddUserModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingUser(null);
          }}
          editingUser={editingUser}
        />

        {/* Toast Container */}
        <ToastContainer toasts={toasts} onClose={dismissToast} />
      </div>
    </Layout>
  );
};
