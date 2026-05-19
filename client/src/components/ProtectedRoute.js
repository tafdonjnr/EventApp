import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, ROLES } from '../context/AuthContext';

const LOGIN_PATHS = {
  [ROLES.ATTENDEE]: '/attendee/login',
  [ROLES.ORGANIZER]: '/organizer/login',
  [ROLES.ADMIN]: '/admin/login',
};

const DASHBOARD_PATHS = {
  [ROLES.ATTENDEE]: '/attendee/dashboard',
  [ROLES.ORGANIZER]: '/dashboard',
  [ROLES.ADMIN]: '/admin',
};

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, userRole, loading } = useAuth();

  // Show loading while checking authentication
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

  const loginPath =
    allowedRoles.length === 1 ? LOGIN_PATHS[allowedRoles[0]] : '/';

  // If not authenticated, send to the matching login page
  if (!user || !userRole) {
    return <Navigate to={loginPath} replace />;
  }

  // If specific roles are required and user's role is not allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to={DASHBOARD_PATHS[userRole] || '/'} replace />;
  }

  // User is authenticated and has proper role
  return children;
};

export default ProtectedRoute;
