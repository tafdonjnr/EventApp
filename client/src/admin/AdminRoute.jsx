import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protects admin routes: only users with role "admin" can access.
 * Redirects to login if not authenticated, or to home if not admin.
 */
const AdminRoute = ({ children }) => {
  const { user, userRole, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: 'var(--text-accent)',
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated() || !user) {
    return <Navigate to="/organizer/login" replace />;
  }

  if (userRole !== 'admin' && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
