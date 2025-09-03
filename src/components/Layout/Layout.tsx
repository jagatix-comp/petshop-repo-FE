import React, { useState, useEffect } from "react";
import { Menu, X, User, Settings, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useStore } from "../../store/useStore";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const user = useStore((state) => state.user);
  const logout = useStore((state) => state.logout);

  // Check if screen is mobile size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false); // Close sidebar on mobile by default
      } else {
        setIsSidebarOpen(true); // Open sidebar on desktop by default
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest("[data-profile-dropdown]")) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${isMobile ? "w-64" : "w-64"}`}
      >
        <Sidebar onClose={() => setIsSidebarOpen(false)} isMobile={isMobile} />
      </div>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isSidebarOpen && !isMobile ? "ml-64" : "ml-0"
        } overflow-auto`}
      >
        {/* Header with Menu Button */}
        <div className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <Menu size={20} className="text-gray-600" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative" data-profile-dropdown>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name || user?.username || "User"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.role === "super_admin" ? "Super Admin" : "Admin"}
                  </p>
                </div>
                <ChevronDown size={16} className="text-gray-600" />
              </button>

              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.name || user?.username || "User"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.role === "super_admin" ? "Super Admin" : "Admin"}
                    </p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    <Settings size={16} className="mr-2" />
                    Profile & Settings
                  </Link>
                  <button
                    onClick={async () => {
                      setIsProfileDropdownOpen(false);
                      await logout();
                      window.location.href = "/login";
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <X size={16} className="mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
};
