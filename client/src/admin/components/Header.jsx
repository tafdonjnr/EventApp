import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
//import ThemeToggle from '../ThemeToggle';

const Header = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  return (
    <header className="admin-header">
      <div className="header-left">
        <h1 className="page-title">Admin Dashboard</h1>
      </div>
      
      <div className="header-right">
        {/*<ThemeToggle />*/}
        
        <div className="user-menu">
          <button 
            className="user-button"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="user-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <span className="user-name">{user?.name || user?.email}</span>
            <span className="dropdown-arrow">▼</span>
          </button>
          
          {showDropdown && (
            <div className="user-dropdown">
              <div className="dropdown-item">
                <span className="user-email">{user?.email}</span>
                <span className="user-role">{user?.role}</span>
              </div>
              <hr />
              <button className="dropdown-item" onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
