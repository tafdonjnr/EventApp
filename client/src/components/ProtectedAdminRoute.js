import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../context/AuthContext';

/**
 * Protects admin routes: only users with role "admin" can access.
 * Redirects to "/" if not authenticated or not admin.
 */
const ProtectedAdminRoute = ({ children }) => {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-accent)',
        fontSize: '1.2rem'
      }}>
        Loading...
      </div>
    );
  }

  if (!user || !userRole) {
    return <Navigate to="/" replace />;
  }

  const role = user?.role || userRole;
  if (role !== ROLES.ADMIN) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
