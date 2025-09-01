import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  LogOut,
  PawPrint,
  ChevronDown,
  ChevronRight,
  Tag,
  Bookmark,
} from "lucide-react";
import { useStore } from "../../store/useStore";

export const Sidebar: React.FC = () => {
  const logout = useStore((state) => state.logout);
  const location = useLocation();
  const [isProductsOpen, setIsProductsOpen] = useState(
    location.pathname.includes("/products") ||
      location.pathname.includes("/brands") ||
      location.pathname.includes("/categories")
  );

  useEffect(() => {
    setIsProductsOpen(
      location.pathname.includes("/products") ||
        location.pathname.includes("/brands") ||
        location.pathname.includes("/categories")
    );
  }, [location.pathname]);

  const navItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    {
      path: "/products",
      icon: Package,
      label: "Produk",
      hasDropdown: true,
      children: [
        { path: "/products", icon: Package, label: "Semua Produk" },
        { path: "/brands", icon: Tag, label: "Brand" },
        { path: "/categories", icon: Bookmark, label: "Kategori" },
      ],
    },
    { path: "/cashier", icon: ShoppingCart, label: "Kasir" },
    { path: "/reports", icon: FileText, label: "Laporan" },
  ];

  return (
    <div className="bg-white h-screen w-64 shadow-lg flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-teal-600 p-2 rounded-lg">
            <PawPrint className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Pet Shop</h1>
            <p className="text-sm text-gray-600">Management System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              {item.hasDropdown ? (
                <div>
                  <button
                    onClick={() => setIsProductsOpen(!isProductsOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {isProductsOpen ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>
                  {isProductsOpen && (
                    <ul className="ml-4 mt-2 space-y-1">
                      {item.children?.map((child) => (
                        <li key={child.path}>
                          <NavLink
                            to={child.path}
                            className={({ isActive }) =>
                              `flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                                isActive
                                  ? "bg-teal-100 text-teal-700"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                              }`
                            }
                          >
                            <child.icon size={18} />
                            <span className="font-medium">{child.label}</span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-teal-100 text-teal-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`
                  }
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};
