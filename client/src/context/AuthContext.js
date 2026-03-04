import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

/** Role constants - single source of truth for role checks */
export const ROLES = {
  ORGANIZER: 'organizer',
  ADMIN: 'admin',
  ATTENDEE: 'attendee',
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing auth on app load
  useEffect(() => {
    const checkAuth = () => {
      try {
        // Check both localStorage and sessionStorage for auth data
        const localToken = localStorage.getItem('token');
        const sessionToken = sessionStorage.getItem('token');
        
        let token = null;
        let role = null;
        let userData = null;
        let storageType = null;

        // Prioritize sessionStorage over localStorage for security
        if (sessionToken) {
          token = sessionToken;
          role = sessionStorage.getItem('userRole');
          userData = sessionStorage.getItem('userData');
          storageType = 'session';
        } else if (localToken) {
          token = localToken;
          role = localStorage.getItem('userRole');
          userData = localStorage.getItem('userData');
          storageType = 'local';
        }

        if (token && role && userData) {
          try {
            const parsedUserData = JSON.parse(userData);
            setUser(parsedUserData);
            setUserRole(role);
            
            // Store storage type for logout cleanup
            localStorage.setItem('authStorageType', storageType);
          } catch (error) {
            console.error('Error parsing user data:', error);
            clearAuth();
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData, token, role, rememberMe = false) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    const storageType = rememberMe ? 'local' : 'session';
    
    storage.setItem('token', token);
    storage.setItem('userRole', role);
    storage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('authStorageType', storageType);
    
    setUser(userData);
    setUserRole(role);
  };

  const logout = () => {
    clearAuth();
    navigate('/');
  };

  const clearAuth = () => {
    // Clear both storage types to be safe
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    localStorage.removeItem('authStorageType');
    
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userData');
    
    setUser(null);
    setUserRole(null);
  };

  const isAuthenticated = () => {
    return !!user && !!userRole;
  };

  const value = {
    user,
    userRole,
    loading,
    login,
    logout,
    clearAuth,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
