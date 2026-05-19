import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [openReg, setOpenReg] = useState(false);
  const [openLog, setOpenLog] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const userDropdownRef = useRef(null);
  const registerDropdownRef = useRef(null);
  const loginDropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user, userRole, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target) && !e.target.closest('[data-hamburger]')) {
        setIsOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      const insideRegister = registerDropdownRef.current?.contains(e.target);
      const insideLogin = loginDropdownRef.current?.contains(e.target);
      if (!insideRegister && !insideLogin) {
        setOpenReg(false);
        setOpenLog(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeAll = () => {
    setIsOpen(false);
    setOpenReg(false);
    setOpenLog(false);
    setUserDropdownOpen(false);
  };

  const handleCreate = () => {
    if (user && userRole === 'organizer') {
      navigate('/dashboard/create');
    } else if (user && userRole === 'attendee') {
      navigate('/attendee/dashboard');
    } else {
      navigate('/organizer/register');
    }
    closeAll();
  };

  const handleDashboard = () => {
    if (userRole === 'organizer') {
      navigate('/dashboard');
    } else if (userRole === 'attendee') {
      navigate('/attendee/dashboard');
    }
    closeAll();
  };

  const handleLogout = () => {
    logout();
    closeAll();
  };

  const displayName = user?.name || user?.email || 'Account';

  const navLinkBase = 'nav-link';
  const navLinkDesktop = `${navLinkBase} nav-link--desktop`;
  const navLinkMobile = `${navLinkBase} nav-link--mobile`;
  const navBtnMobile = 'nav-link nav-btn--mobile';

  return (
    <nav className="nav-bar sticky top-0 left-0 w-full z-20">
      <div className="max-w-7xl mx-auto px-4 py-2 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 sm:h-14">
          <div className="flex items-center justify-between min-h-[3rem] sm:min-h-0">
            <Link to="/" className="nav-brand">
              Verse
            </Link>

            <div className="flex items-center gap-2 sm:hidden">
              <ThemeToggle />
              <button
                data-hamburger
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="nav-hamburger"
                aria-label="Toggle menu"
              >
                <span className="block w-6 h-5 relative">
                  <span className={`absolute left-0 w-6 h-0.5 bg-white block ${isOpen ? 'top-2 rotate-45' : 'top-0'}`} />
                  <span className={`absolute left-0 w-6 h-0.5 bg-white block top-2 ${isOpen ? 'opacity-0' : 'opacity-100'}`} />
                  <span className={`absolute left-0 w-6 h-0.5 bg-white block ${isOpen ? 'top-2 -rotate-45' : 'top-4'}`} />
                </span>
              </button>
            </div>
          </div>

          {/* Desktop: nav links + theme + register/login or user dropdown */}
          <div className="hidden sm:flex sm:flex-row sm:items-center sm:gap-4 lg:gap-6 flex-wrap">
            <NavLinks
              user={user}
              userRole={userRole}
              onCreate={handleCreate}
              onDashboard={handleDashboard}
              onLogout={handleLogout}
              mobile={false}
              onNavigate={closeAll}
              linkClass={navLinkDesktop}
              btnClass={navLinkDesktop}
            />

            <div className="nav-toolbar flex items-center gap-2 pl-2">
              <ThemeToggle />

              {user ? (
                <div className="relative" ref={userDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="nav-user-btn"
                  >
                    {displayName}
                    <svg className={`w-4 h-4 ml-1 ${userDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {userDropdownOpen && (
                    <div className="nav-dropdown-menu absolute right-0 mt-1 w-48 py-1 overflow-hidden z-[21]">
                      {userRole === 'admin' && (
                        <Link to="/admin" className="nav-dropdown-item" onClick={() => setUserDropdownOpen(false)}>
                          Admin
                        </Link>
                      )}
                      <button type="button" onClick={handleLogout} className="nav-dropdown-item nav-dropdown-item--btn">
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <AuthDropdown
                    ref={registerDropdownRef}
                    label="Register"
                    open={openReg}
                    onToggle={() => { setOpenLog(false); setOpenReg((p) => !p); }}
                    onClose={() => setOpenReg(false)}
                    items={[
                      { to: '/organizer/register', label: 'Organizer' },
                      { to: '/attendee/register', label: 'Attendee' },
                    ]}
                    triggerClass="nav-register-btn"
                  />
                  <AuthDropdown
                    ref={loginDropdownRef}
                    label="Login"
                    open={openLog}
                    onToggle={() => { setOpenReg(false); setOpenLog((p) => !p); }}
                    onClose={() => setOpenLog(false)}
                    items={[
                      { to: '/organizer/login', label: 'Organizer' },
                      { to: '/attendee/login', label: 'Attendee' },
                    ]}
                    triggerClass="nav-login-btn"
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-[18] sm:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ top: 'var(--navbar-height, 4rem)' }}
        onClick={closeAll}
        aria-hidden="true"
      />

      {/* Mobile menu */}
      <div
        ref={mobileMenuRef}
        className={`nav-mobile-panel fixed top-[var(--navbar-height,4rem)] right-0 w-[280px] max-w-[85vw] bottom-0 z-[19] sm:hidden overflow-y-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col gap-0 px-4 py-2 sm:px-6">
          <NavLinks
            user={user}
            userRole={userRole}
            onCreate={handleCreate}
            onDashboard={handleDashboard}
            onLogout={handleLogout}
            mobile={true}
            onNavigate={closeAll}
            linkClass={navLinkMobile}
            btnClass={navBtnMobile}
          />

          {user && userRole === 'admin' && (
            <Link to="/admin" className={navLinkMobile} onClick={closeAll}>Admin</Link>
          )}

          <div className="nav-mobile-theme-row flex items-center gap-2 py-2">
            <ThemeToggle />
            <span className="nav-mobile-theme-label">Theme</span>
          </div>

          {!user && (
            <>
              <p className="nav-mobile-section-label">Register</p>
              <Link to="/organizer/register" className={navLinkMobile} onClick={closeAll}>Organizer</Link>
              <Link to="/attendee/register" className={navLinkMobile} onClick={closeAll}>Attendee</Link>
              <p className="nav-mobile-section-label">Login</p>
              <Link to="/organizer/login" className={navLinkMobile} onClick={closeAll}>Organizer</Link>
              <Link to="/attendee/login" className={navLinkMobile} onClick={closeAll}>Attendee</Link>
            </>
          )}
        </div>
      </div>

      <style>{navStyles}</style>
    </nav>
  );
}

const navStyles = `
  .nav-bar {
    background: rgba(15, 15, 35, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
  }

  .nav-brand {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.5px;
    color: #fff;
    text-decoration: none;
    transition: opacity 0.2s ease;
  }

  .nav-brand:hover {
    opacity: 0.92;
    color: #fff;
  }

  .nav-link {
    font-size: 14px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
    padding: 7px 14px;
    border-radius: 8px;
    text-decoration: none;
    transition: opacity 0.2s ease, background 0.2s ease, color 0.2s ease;
    border: none;
    background: transparent;
    cursor: pointer;
    font-family: inherit;
  }

  .nav-link--desktop {
    display: inline-block;
  }

  .nav-link--mobile,
  .nav-btn--mobile {
    display: block;
    width: 100%;
    text-align: left;
    padding: 12px 20px;
    color: rgba(255, 255, 255, 0.85);
    border-radius: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .nav-link:hover,
  .nav-link:focus-visible {
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
  }

  .nav-toolbar {
    border-left: 1px solid rgba(255, 255, 255, 0.12);
  }

  .nav-register-btn,
  .nav-login-btn,
  .nav-user-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-size: 14px;
    font-weight: 600;
    padding: 9px 18px;
    border-radius: 9px;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.2s ease, opacity 0.2s ease, border-color 0.2s ease;
    white-space: nowrap;
  }

  .nav-register-btn {
    background: linear-gradient(135deg, var(--bg-button), var(--bg-button-hover));
    color: #fff;
    border: none;
    box-shadow: 0 2px 10px var(--shadow-accent);
  }

  .nav-register-btn:hover {
    opacity: 0.92;
    color: #fff;
  }

  .nav-login-btn,
  .nav-user-btn {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.25);
    color: #fff;
  }

  .nav-login-btn:hover,
  .nav-user-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
  }

  .nav-dropdown-menu {
    background: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: 12px;
    box-shadow: 0 8px 24px var(--shadow-primary);
  }

  .nav-dropdown-item {
    display: block;
    width: 100%;
    padding: 10px 16px;
    font-size: 14px;
    color: var(--text-primary);
    text-decoration: none;
    text-align: left;
    background: transparent;
    border: none;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.15s ease;
  }

  .nav-dropdown-item:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
  }

  .nav-dropdown-item--btn {
    border-top: 1px solid var(--border-primary);
  }

  .nav-hamburger {
    padding: 8px;
    background: transparent;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .nav-hamburger:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  .nav-mobile-panel {
    background: rgba(15, 15, 35, 0.97);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-left: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: -8px 0 32px rgba(0, 0, 0, 0.35);
    transition: transform 0.3s ease;
  }

  .nav-mobile-theme-row {
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    padding-left: 20px;
    padding-right: 20px;
  }

  .nav-mobile-theme-label {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.85);
  }

  .nav-mobile-section-label {
    margin: 12px 0 4px;
    padding: 8px 20px 4px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: rgba(255, 255, 255, 0.55);
  }
`;

const AuthDropdown = React.forwardRef(function AuthDropdown(
  { label, open, onToggle, onClose, items, triggerClass },
  ref
) {
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-haspopup="true"
        className={triggerClass || 'nav-login-btn'}
      >
        {label}
        <svg className={`w-4 h-4 ml-1 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div
          role="menu"
          className="nav-dropdown-menu absolute right-0 mt-1 w-40 py-1 overflow-hidden z-[21]"
          onClick={(e) => e.stopPropagation()}
        >
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              role="menuitem"
              className="nav-dropdown-item"
              onClick={onClose}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
});

function NavLinks({ user, userRole, onCreate, onDashboard, onLogout, mobile, onNavigate, linkClass, btnClass }) {
  return (
    <>
      <Link to="/" className={linkClass} onClick={onNavigate}>Home</Link>
      <Link to="/" className={linkClass} onClick={onNavigate}>Events</Link>

      {user && (
        <>
          {userRole === 'organizer' && (
            <>
              <Link to="/dashboard/profile" className={linkClass} onClick={onNavigate}>My Profile</Link>
              <button type="button" onClick={onDashboard} className={btnClass}>Dashboard</button>
              <button type="button" onClick={onCreate} className={btnClass}>Create Event</button>
            </>
          )}
          {userRole === 'attendee' && (
            <>
              <Link to="/attendee/dashboard" className={linkClass} onClick={onNavigate}>My Dashboard</Link>
              <button type="button" onClick={onCreate} className={btnClass}>My Events</button>
            </>
          )}
          {!mobile && <button type="button" onClick={onLogout} className={btnClass}>Logout</button>}
        </>
      )}

      {!user && (
        <button type="button" onClick={onCreate} className={btnClass}>Create Event</button>
      )}
    </>
  );
}
