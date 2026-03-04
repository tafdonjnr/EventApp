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

  const navLinkBase = 'text-white font-semibold rounded-xl px-3 py-2 hover:opacity-90';
  const navLinkDesktop = `${navLinkBase} inline-block`;
  const navLinkMobile = `${navLinkBase} block w-full text-left px-4 py-2 border-b border-white/20`;
  const navBtnMobile = 'block w-full text-left px-4 py-2 text-white font-semibold rounded-xl border-b border-white/20 hover:opacity-90';

  return (
    <nav className="sticky top-0 left-0 w-full z-20 bg-primaryGradient shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 sm:h-14">
          <div className="flex items-center justify-between min-h-[3rem] sm:min-h-0">
            <Link to="/" className="heading-2 text-white hover:opacity-90">
              Verse
            </Link>

            <div className="flex items-center gap-2 sm:hidden">
              <ThemeToggle />
              <button
                data-hamburger
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-xl text-white hover:opacity-90"
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

            <div className="flex items-center gap-2 pl-2 border-l border-white/30">
              <ThemeToggle />

              {user ? (
                <div className="relative" ref={userDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="secondary-btn !text-white !border-white/50 !bg-white/20 min-w-0"
                  >
                    {displayName}
                    <svg className={`w-4 h-4 ml-1 ${userDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-1 w-48 py-1 bg-white rounded-xl shadow-xl border border-softBorder overflow-hidden z-[21]">
                      {userRole === 'admin' && (
                        <Link to="/admin" className="block px-4 py-2 text-sm text-primaryText hover:bg-gray-100" onClick={() => setUserDropdownOpen(false)}>
                          Admin
                        </Link>
                      )}
                      <button type="button" onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-primaryText hover:bg-gray-100">
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
                    triggerClass="primary-btn !text-primaryText"
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
                    triggerClass="secondary-btn !text-primaryText !bg-white/90 !border-white/50"
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
        className={`fixed top-[var(--navbar-height,4rem)] right-0 w-[280px] max-w-[85vw] bottom-0 bg-primaryGradient shadow-2xl z-[19] sm:hidden overflow-y-auto border-l border-white/20 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
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

          <div className="flex items-center gap-2 py-2 border-b border-white/20">
            <ThemeToggle />
            <span className="small-text text-white/90">Theme</span>
          </div>

          {!user && (
            <>
              <p className="small-text uppercase tracking-wider mt-2 mb-1 px-4 py-2 text-white/80">Register</p>
              <Link to="/organizer/register" className={navLinkMobile} onClick={closeAll}>Organizer</Link>
              <Link to="/attendee/register" className={navLinkMobile} onClick={closeAll}>Attendee</Link>
              <p className="small-text uppercase tracking-wider mt-2 mb-1 px-4 py-2 text-white/80">Login</p>
              <Link to="/organizer/login" className={navLinkMobile} onClick={closeAll}>Organizer</Link>
              <Link to="/attendee/login" className={navLinkMobile} onClick={closeAll}>Attendee</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

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
        className={triggerClass || 'secondary-btn'}
      >
        {label}
        <svg className={`w-4 h-4 ml-1 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-1 w-40 py-1 bg-white rounded-xl shadow-xl border border-softBorder overflow-hidden z-[21]"
          onClick={(e) => e.stopPropagation()}
        >
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              role="menuitem"
              className="block px-4 py-2 text-sm text-primaryText hover:bg-gray-100"
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
