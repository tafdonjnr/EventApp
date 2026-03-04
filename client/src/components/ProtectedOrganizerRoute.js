import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, ROLES } from '../context/AuthContext';

/**
 * Protects organizer routes: only users with role "organizer" can access.
 * Waits for auth to finish loading before deciding.
 */
const ProtectedOrganizerRoute = ({ children }) => {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-accent)',
          fontSize: '1.2rem',
        }}
      >
        Loading...
      </div>
    );
  }

  const role = user?.role || userRole;

  if (!user || role !== ROLES.ORGANIZER) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedOrganizerRoute;
