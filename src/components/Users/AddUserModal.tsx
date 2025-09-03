import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/Select";
import { useStore } from "../../store/useStore";
import { useToast } from "../../hooks/useToast";
import { Eye, EyeOff } from "lucide-react";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingUser?: any | null;
}

// Mock tenants data - in real app this should come from API
const TENANTS = [
  {
    id: "aaaacc5e-830a-11f0-a0ba-dea59c21d0ae",
    name: "wojo",
    location: "wojo",
  },
  {
    id: "b28a69ac-830a-11f0-a0ba-dea59c21d0ae",
    name: "xtsquare",
    location: "xtsquare",
  },
  {
    id: "bbbcf53a-830a-11f0-a0ba-dea59c21d0ae",
    name: "ngasem",
    location: "ngasem",
  },
];

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  editingUser,
}) => {
  const { createUser, updateUser } = useStore();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    role: "admin",
    tenantID: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set form data when editing
  useEffect(() => {
    if (editingUser) {
      setFormData({
        name: editingUser.name || "",
        username: editingUser.username || "",
        password: "",
        confirmPassword: "",
        phoneNumber: editingUser.phoneNumber || "",
        role: editingUser.role || "admin",
        tenantID: editingUser.tenant?.id || "",
      });
    } else {
      setFormData({
        name: "",
        username: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
        role: "admin",
        tenantID: "",
      });
    }
  }, [editingUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Nama tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }

    if (!formData.username.trim()) {
      toast({
        title: "Error",
        description: "Username tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }

    if (!editingUser) {
      // For new users, password is required
      if (!formData.password) {
        toast({
          title: "Error",
          description: "Password tidak boleh kosong",
          variant: "destructive",
        });
        return;
      }

      if (formData.password.length < 6) {
        toast({
          title: "Error",
          description: "Password minimal 6 karakter",
          variant: "destructive",
        });
        return;
      }

      if (!/[A-Z]/.test(formData.password)) {
        toast({
          title: "Error",
          description: "Password harus mengandung minimal satu huruf kapital",
          variant: "destructive",
        });
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Error",
          description: "Password dan konfirmasi password tidak cocok",
          variant: "destructive",
        });
        return;
      }
    } else {
      // For editing, password is optional but if provided must be valid
      if (formData.password) {
        if (formData.password.length < 6) {
          toast({
            title: "Error",
            description: "Password minimal 6 karakter",
            variant: "destructive",
          });
          return;
        }

        if (!/[A-Z]/.test(formData.password)) {
          toast({
            title: "Error",
            description: "Password harus mengandung minimal satu huruf kapital",
            variant: "destructive",
          });
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          toast({
            title: "Error",
            description: "Password dan konfirmasi password tidak cocok",
            variant: "destructive",
          });
          return;
        }
      }
    }

    if (!formData.phoneNumber.trim()) {
      toast({
        title: "Error",
        description: "Nomor telepon tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }

    if (formData.role !== "super_admin" && !formData.tenantID) {
      toast({
        title: "Error",
        description: "Tenant harus dipilih untuk role admin",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let success = false;

      if (editingUser) {
        // Update user
        const updateData: any = {
          name: formData.name.trim(),
          username: formData.username.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          role: formData.role,
          tenantID: formData.tenantID,
        };

        // Only include password if provided
        if (formData.password) {
          updateData.password = formData.password;
          updateData.confirmPassword = formData.confirmPassword;
        }

        success = await updateUser(editingUser.id, updateData);
      } else {
        // Create new user
        success = await createUser({
          name: formData.name.trim(),
          username: formData.username.trim(),
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          phoneNumber: formData.phoneNumber.trim(),
          role: formData.role,
          tenantID: formData.tenantID,
        });
      }

      if (success) {
        toast({
          title: "Berhasil",
          description: editingUser
            ? "User berhasil diupdate"
            : "User berhasil ditambahkan",
          variant: "success",
        });
        onClose();
      } else {
        toast({
          title: "Error",
          description: "Gagal menyimpan user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving user:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menyimpan user",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string) => (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const togglePasswordVisibility = (field: "password" | "confirmPassword") => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      username: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      role: "admin",
      tenantID: "",
    });
    setShowPasswords({
      password: false,
      confirmPassword: false,
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingUser ? "Edit User" : "Tambah User"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Lengkap</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name")(e.target.value)}
            placeholder="Masukkan nama lengkap"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => handleChange("username")(e.target.value)}
            placeholder="Masukkan username"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">
            Password {editingUser && "(Kosongkan jika tidak ingin mengubah)"}
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPasswords.password ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleChange("password")(e.target.value)}
              placeholder="Masukkan password"
              className="pr-10"
              required={!editingUser}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("password")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPasswords.password ? (
                <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {!editingUser && (
            <p className="text-xs text-gray-500">
              Password minimal 6 karakter dan mengandung minimal satu huruf
              kapital
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showPasswords.confirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => handleChange("confirmPassword")(e.target.value)}
              placeholder="Konfirmasi password"
              className="pr-10"
              required={!editingUser || formData.password.length > 0}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("confirmPassword")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPasswords.confirmPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Nomor Telepon</Label>
          <Input
            id="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => handleChange("phoneNumber")(e.target.value)}
            placeholder="Masukkan nomor telepon"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select value={formData.role} onValueChange={handleChange("role")}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.role !== "super_admin" && (
          <div className="space-y-2">
            <Label htmlFor="tenant">Tenant</Label>
            <Select
              value={formData.tenantID}
              onValueChange={handleChange("tenantID")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih tenant" />
              </SelectTrigger>
              <SelectContent>
                {TENANTS.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    {tenant.name} - {tenant.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Memproses..." : editingUser ? "Update" : "Tambah"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
