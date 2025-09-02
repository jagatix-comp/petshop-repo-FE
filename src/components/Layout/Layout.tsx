import React from "react";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="fixed left-0 top-0 h-full z-30">
        <Sidebar />
      </div>
      <main className="flex-1 ml-64 overflow-auto">{children}</main>
    </div>
  );
};
