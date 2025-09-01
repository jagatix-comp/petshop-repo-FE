import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Cashier } from './pages/Cashier';
import { Reports } from './pages/Reports';
import { useStore } from './store/useStore';
import { getStoredUser } from './utils/auth';
import { useAuth } from './hooks/useAuth';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/products" element={
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        } />
        <Route path="/cashier" element={
          <ProtectedRoute>
            <Cashier />
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        } />
        <Route path="/" element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
        } />
      </Routes>
    </Router>
  );
}

export default App;