import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Products } from "./pages/Products";
import { Brands } from "./pages/Brands";
import { Categories } from "./pages/Categories";
import { Cashier } from "./pages/Cashier";
import { Reports } from "./pages/Reports";
import { useStore } from "./store/useStore";
import { getStoredUser } from "./utils/auth";
import { useAuth } from "./hooks/useAuth";
import { ROUTES } from "./constants";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  const { isAuthenticated } = useStore();

  // Initialize auth hook for automatic token refresh
  useAuth();

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = getStoredUser();
    if (storedUser) {
      useStore.setState({ user: storedUser, isAuthenticated: true });
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PRODUCTS}
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.BRANDS}
          element={
            <ProtectedRoute>
              <Brands />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CATEGORIES}
          element={
            <ProtectedRoute>
              <Categories />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.CASHIER}
          element={
            <ProtectedRoute>
              <Cashier />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.REPORTS}
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <Navigate to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN} replace />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
