import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Organizer sidebar navigation.
 * Collapses into hamburger overlay on screens <768px.
 */
const OrganizerSidebar = ({ isOpen = false, onClose }) => {
  const { user, userRole } = useAuth();

  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose?.();
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const navItems = [
    { path: '/dashboard', label: 'Overview', icon: '📊' },
    { path: '/dashboard/events', label: 'My Events', icon: '🎉' },
    { path: '/dashboard/create', label: 'Create Event', icon: '➕' },
    { path: '/dashboard/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <div className={`organizer-sidebar ${isOpen ? 'open' : ''}`} role="navigation">
      {onClose && (
        <button
          type="button"
          className="organizer-sidebar-close md:hidden"
          onClick={onClose}
          aria-label="Close menu"
        >
          ×
        </button>
      )}
      <div className="sidebar-header">
        <h2>Organizer</h2>
        <p className="user-info">
          <span className="user-role">{userRole || user?.role || ''}</span>
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
            end={item.path === '/dashboard'}
            onClick={onClose}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default OrganizerSidebar;
