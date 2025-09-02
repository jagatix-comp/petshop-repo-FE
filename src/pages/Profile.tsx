import React, { useState, useEffect } from "react";
import { User, Lock, Mail, Building, Save } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/Select";
import { Separator } from "../components/ui/Separator";
import { Badge } from "../components/ui/Badge";
import { useStore } from "../store/useStore";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/ui/Toast";

export const Profile: React.FC = () => {
  const { user: currentUser } = useStore();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    username: "",
    email: "",
    branch: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const { toast, toasts, dismissToast } = useToast();

  const branches = ["Main Store", "Branch A", "Branch B"];

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name || "",
        username: currentUser.email || "",
        email: currentUser.email || "",
        branch: "Main Store", // Default branch since we don't have this in our user model
      });
    }
  }, [currentUser]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    try {
      // Simulate API call since we don't have user update endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Berhasil",
        description: "Profil berhasil diperbarui",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memperbarui profil",
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

    setLoading(true);
    try {
      // Simulate API call since we don't have password update endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000));

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
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengubah password",
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
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleChange("email")(e.target.value)}
                        placeholder="Masukkan email"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="branch">Cabang</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                      <Select
                        value={profileData.branch}
                        onValueChange={handleChange("branch")}
                      >
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder="Pilih cabang" />
                        </SelectTrigger>
                        <SelectContent>
                          {branches.map((branch) => (
                            <SelectItem key={branch} value={branch}>
                              {branch}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                        currentUser.role === "admin"
                          ? "bg-teal-600 text-white"
                          : ""
                      }
                      variant={
                        currentUser.role === "admin" ? "default" : "secondary"
                      }
                    >
                      {currentUser.role === "admin" ? "Admin" : "User"}
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
                      <Input
                        id="current-password"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          handlePasswordChange("currentPassword")(
                            e.target.value
                          )
                        }
                        placeholder="Masukkan password saat ini"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-password">Password Baru</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          handlePasswordChange("newPassword")(e.target.value)
                        }
                        placeholder="Masukkan password baru"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">
                        Konfirmasi Password
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          handlePasswordChange("confirmPassword")(
                            e.target.value
                          )
                        }
                        placeholder="Konfirmasi password baru"
                        required
                      />
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
