import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import './AdminDashboard.css';

/**
 * Admin layout with collapsible sidebar on mobile (<768px).
 */
const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      <button
        type="button"
        className="admin-hamburger md:hidden"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open menu"
      >
        <span />
        <span />
        <span />
      </button>
      {sidebarOpen && (
        <div
          className="admin-overlay md:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === 'Escape' && setSidebarOpen(false)}
          role="button"
          tabIndex={0}
          aria-label="Close menu"
        />
      )}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-main">
        <Header />
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
