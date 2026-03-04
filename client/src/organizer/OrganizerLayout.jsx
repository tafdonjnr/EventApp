import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import OrganizerSidebar from './components/OrganizerSidebar';
import './OrganizerLayout.css';

/**
 * Organizer layout with collapsible sidebar on mobile (<768px).
 * Sidebar becomes hamburger overlay on small screens.
 */
const OrganizerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="organizer-layout">
      <button
        type="button"
        className="organizer-hamburger md:hidden"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open menu"
      >
        <span />
        <span />
        <span />
      </button>
      {sidebarOpen && (
        <div
          className="organizer-overlay md:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === 'Escape' && setSidebarOpen(false)}
          role="button"
          tabIndex={0}
          aria-label="Close menu"
        />
      )}
      <OrganizerSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="organizer-main">
        <div className="organizer-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default OrganizerLayout;
