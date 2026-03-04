import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen = false, onClose }) => {
  const { user } = useAuth();

  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose?.();
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/events', label: 'Events', icon: '🎉' },
    { path: '/admin/transactions', label: 'Transactions', icon: '💰' },
  ];

  return (
    <div className={`admin-sidebar ${isOpen ? 'open' : ''}`} role="navigation">
      {onClose && (
        <button
          type="button"
          className="admin-sidebar-close md:hidden"
          onClick={onClose}
          aria-label="Close menu"
        >
          ×
        </button>
      )}
      <div className="sidebar-header">
        <h2>Admin Panel</h2>
        <p className="user-info">
          <span className="user-role">{user?.role}</span>
          <span className="user-name">{user?.name || user?.email}</span>
        </p>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
            onClick={onClose}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/" className="back-link">
          ← Back to Home
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
