import React, { useState, useEffect } from "react";
import { User, Lock, Building, Save, Eye, EyeOff } from "lucide-react";
import { Layout } from "../components/Layout/Layout";
import { Button } from "../components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Separator } from "../components/ui/Separator";
import { Badge } from "../components/ui/Badge";
import { useStore } from "../store/useStore";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/ui/Toast";

export const Profile: React.FC = () => {
  const {
    user: currentUser,
    loadProfile,
    updateProfile,
    changePassword,
  } = useStore();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    username: "",
    phoneNumber: "",
    branch: "", // Only for display, not editable
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const { toast, toasts, dismissToast } = useToast();

  useEffect(() => {
    const initializeProfile = async () => {
      // Load fresh profile data from API
      await loadProfile();
    };
    initializeProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name || "",
        username: currentUser.username || currentUser.email || "",
        phoneNumber: currentUser.phoneNumber || "",
        branch: currentUser.tenant?.name || "Main Store",
      });
    }
  }, [currentUser]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    try {
      const success = await updateProfile({
        name: profileData.name,
        username: profileData.username,
        phoneNumber: profileData.phoneNumber,
      });

      if (success) {
        toast({
          title: "Berhasil",
          description: "Profil berhasil diperbarui",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: "Gagal memperbarui profil",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memperbarui profil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Password baru dan konfirmasi tidak cocok",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password minimal 6 karakter",
        variant: "destructive",
      });
      return;
    }

    // Validasi huruf kapital
    if (!/[A-Z]/.test(passwordData.newPassword)) {
      toast({
        title: "Error",
        description: "Password harus mengandung minimal satu huruf kapital",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const success = await changePassword({
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });

      if (success) {
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        toast({
          title: "Berhasil",
          description: "Password berhasil diubah",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: "Gagal mengubah password. Periksa password lama Anda.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengubah password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof typeof profileData) => (value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordChange =
    (field: keyof typeof passwordData) => (value: string) => {
      setPasswordData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  if (!currentUser) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Loading...</h2>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Profile
            </h1>
            <p className="text-gray-600">Kelola informasi akun dan keamanan</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informasi Profil
                </CardTitle>
                <CardDescription>
                  Perbarui informasi dasar akun Anda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => handleChange("name")(e.target.value)}
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={profileData.username}
                      onChange={(e) => handleChange("username")(e.target.value)}
                      placeholder="Masukkan username"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Nomor Telepon</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={profileData.phoneNumber}
                      onChange={(e) =>
                        handleChange("phoneNumber")(e.target.value)
                      }
                      placeholder="Masukkan nomor telepon"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="branch">Cabang</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                      <Input
                        id="branch"
                        value={profileData.branch}
                        placeholder="Cabang"
                        className="pl-10 bg-gray-50 cursor-not-allowed"
                        disabled
                        readOnly
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full flex items-center justify-center"
                    disabled={loading}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {loading ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Account Security */}
            <div className="space-y-6">
              {/* Account Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Akun</CardTitle>
                  <CardDescription>Detail akun dan hak akses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Role</span>
                    <Badge
                      className={
                        currentUser.role === "super_admin"
                          ? "bg-purple-600 text-white"
                          : currentUser.role === "admin"
                          ? "bg-teal-600 text-white"
                          : ""
                      }
                      variant={
                        currentUser.role === "super_admin" ||
                        currentUser.role === "admin"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {currentUser.role === "super_admin"
                        ? "Super Admin"
                        : currentUser.role === "admin"
                        ? "Admin"
                        : "User"}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Cabang</span>
                    <Badge variant="outline">{profileData.branch}</Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Status</span>
                    <Badge variant="success">Aktif</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Change Password */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Ubah Password
                  </CardTitle>
                  <CardDescription>
                    Perbarui password untuk keamanan akun
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">
                        Password Saat Ini
                      </Label>
                      <div className="relative">
                        <Input
                          id="current-password"
                          type={
                            showPasswords.currentPassword ? "text" : "password"
                          }
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            handlePasswordChange("currentPassword")(
                              e.target.value
                            )
                          }
                          placeholder="Masukkan password saat ini"
                          className="pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            togglePasswordVisibility("currentPassword")
                          }
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPasswords.currentPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-password">Password Baru</Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showPasswords.newPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            handlePasswordChange("newPassword")(e.target.value)
                          }
                          placeholder="Masukkan password baru"
                          className="pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            togglePasswordVisibility("newPassword")
                          }
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPasswords.newPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Password minimal 6 karakter dan mengandung minimal satu
                        huruf kapital
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">
                        Konfirmasi Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={
                            showPasswords.confirmPassword ? "text" : "password"
                          }
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            handlePasswordChange("confirmPassword")(
                              e.target.value
                            )
                          }
                          placeholder="Konfirmasi password baru"
                          className="pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            togglePasswordVisibility("confirmPassword")
                          }
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

                    <Separator />

                    <Button
                      type="submit"
                      className="w-full flex items-center justify-center"
                      disabled={loading}
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      {loading ? "Mengubah..." : "Ubah Password"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Toast Container */}
        <ToastContainer toasts={toasts} onClose={dismissToast} />
      </div>
    </Layout>
  );
};
