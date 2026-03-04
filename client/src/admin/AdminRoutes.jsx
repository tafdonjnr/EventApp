import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminLayout from './AdminLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Events from './pages/Events';
import Transactions from './pages/Transactions';

const AdminRoutes = () => {
  const { user, userRole, isAuthenticated } = useAuth();
  const isAuth = typeof isAuthenticated === 'function' ? isAuthenticated() : isAuthenticated;

  if (!isAuth || !user) {
    return <Navigate to="/" replace />;
  }
  if (user?.role !== 'admin' && userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="events" element={<Events />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
