import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [openReg, setReg] = useState(false);
  const [openLog, setLog] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));
  const navigate = useNavigate();

  // Listen for changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
      setUserRole(localStorage.getItem('userRole'));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Also check localStorage on every render (for same-tab changes)
  useEffect(() => {
    setToken(localStorage.getItem('token'));
    setUserRole(localStorage.getItem('userRole'));
  });

  const handleCreate = () => {
    if (token && userRole === 'organizer') {
      navigate('/organizer/create-event');
    } else if (token && userRole === 'attendee') {
      navigate('/attendee/dashboard');
    } else {
      navigate('/organizer/register');
    }
    setIsOpen(false);
    setReg(false);
    setLog(false);
  };

  const handleDashboard = () => {
    if (userRole === 'organizer') {
      navigate('/organizer/dashboard');
    } else if (userRole === 'attendee') {
      navigate('/attendee/dashboard');
    }
    setIsOpen(false);
    setReg(false);
    setLog(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    setToken(null);
    setUserRole(null);
    navigate('/');
    setIsOpen(false);
  };

  return (
    <>
      <nav style={styles.navbar}>
        <div style={styles.container}>
          <Link to="/" style={styles.brand}>Verse</Link>

          {/* Desktop Navigation */}
          <div style={styles.desktopNav}>
            <NavLinks 
              token={token} 
              userRole={userRole}
              onCreate={handleCreate} 
              onDashboard={handleDashboard}
              onLogout={handleLogout} 
            />

            {!token && (
              <>
                <Dropdown
                  label="Register ▾"
                  open={openReg}
                  setOpen={setReg}
                  items={[
                    { to: '/organizer/register', label: 'Organizer' },
                    { to: '/attendee/register', label: 'Attendee' },
                  ]}
                />
                <Dropdown
                  label="Login ▾"
                  open={openLog}
                  setOpen={setLog}
                  items={[
                    { to: '/organizer/login', label: 'Organizer' },
                    { to: '/attendee/login', label: 'Attendee' },
                  ]}
                />
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            style={styles.mobileButton}
            onClick={() => setIsOpen(!isOpen)}
          >
            <span style={styles.hamburger}>
              <span style={{ ...styles.hamburgerLine, transform: isOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }}></span>
              <span style={{ ...styles.hamburgerLine, opacity: isOpen ? 0 : 1 }}></span>
              <span style={{ ...styles.hamburgerLine, transform: isOpen ? 'rotate(-45deg) translate(7px, -6px)' : 'none' }}></span>
            </span>
          </button>
        </div>

        {/* Mobile Menu */}
        <div 
          style={{ 
            ...styles.mobileMenu, 
            transform: isOpen ? 'translateX(0)' : 'translateX(100%)'
          }}
        >
          <div style={styles.mobileMenuContent}>
            <NavLinks 
              token={token} 
              userRole={userRole}
              onCreate={handleCreate} 
              onDashboard={handleDashboard}
              onLogout={handleLogout} 
              mobile={true} 
            />
            
            {!token && (
              <div style={styles.mobileAuth}>
                <div style={styles.mobileSection}>
                  <h3 style={styles.mobileSectionTitle}>Register</h3>
                  <Link to="/organizer/register" style={styles.mobileLink} onClick={() => setIsOpen(false)}>
                    Organizer
                  </Link>
                  <Link to="/attendee/register" style={styles.mobileLink} onClick={() => setIsOpen(false)}>
                    Attendee
                  </Link>
                </div>
                
                <div style={styles.mobileSection}>
                  <h3 style={styles.mobileSectionTitle}>Login</h3>
                  <Link to="/organizer/login" style={styles.mobileLink} onClick={() => setIsOpen(false)}>
                    Organizer
                  </Link>
                  <Link to="/attendee/login" style={styles.mobileLink} onClick={() => setIsOpen(false)}>
                    Attendee
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isOpen && <div style={styles.overlay} onClick={() => setIsOpen(false)} />}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .desktopNav { display: none !important; }
          .mobileButton { display: block !important; }
        }
        @media (min-width: 769px) {
          .mobileButton { display: none !important; }
          .mobileMenu { display: none !important; }
        }
        body { margin: 0; padding-top: 70px; }
      `}</style>
    </>
  );
}

function Dropdown({ label, open, setOpen, items }) {
  return (
    <div style={styles.dropdown}>
      <button onClick={() => setOpen(!open)} style={styles.dropBtn}>{label}</button>
      {open && (
        <div style={styles.dropdownMenu}>
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              style={styles.dropdownItem}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function NavLinks({ token, userRole, onCreate, onDashboard, onLogout, mobile = false }) {
  const linkStyle = mobile ? styles.mobileNavLink : styles.navLink;
  const buttonStyle = mobile ? styles.mobileNavButton : styles.navButton;

  return (
    <>
      <Link to="/" style={linkStyle}>Home</Link>

      {token && (
        <>
          {userRole === 'organizer' && (
            <>
              <Link to="/organizer/profile" style={linkStyle}>My Profile</Link>
              <button onClick={onDashboard} style={buttonStyle}>Dashboard</button>
              <button onClick={onCreate} style={buttonStyle}>Create Event</button>
            </>
          )}
          {userRole === 'attendee' && (
            <>
              <Link to="/attendee/dashboard" style={linkStyle}>My Dashboard</Link>
              <button onClick={onCreate} style={buttonStyle}>My Events</button>
            </>
          )}
          <button onClick={onLogout} style={buttonStyle}>Logout</button>
        </>
      )}

      {!token && (
        <button onClick={onCreate} style={buttonStyle}>
          Create Event
        </button>
      )}
    </>
  );
}

const styles = {
  navbar: {
    background: '#1e1e2f',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
    borderBottom: '1px solid #2b2b3f',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '70px',
  },
  brand: {
    color: '#f4a261',
    fontWeight: 'bold',
    fontSize: '1.8rem',
    textDecoration: 'none',
  },
  desktopNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  navLink: {
    color: '#f4a261',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '1rem',
    padding: '8px 12px',
    borderRadius: '6px',
  },
  navButton: {
    background: 'none',
    border: 'none',
    color: '#f4a261',
    fontWeight: '600',
    fontSize: '1rem',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  dropdown: {
    position: 'relative',
  },
  dropBtn: {
    background: 'none',
    border: 'none',
    color: '#f4a261',
    fontWeight: '600',
    fontSize: '1rem',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    background: '#2b2b3f',
    borderRadius: '8px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
    minWidth: '150px',
    padding: '8px 0',
    marginTop: '5px',
  },
  dropdownItem: {
    display: 'block',
    padding: '10px 16px',
    color: '#f4a261',
    textDecoration: 'none',
    fontWeight: '500',
  },
  mobileButton: {
    display: 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '6px',
  },
  hamburger: {
    display: 'flex',
    flexDirection: 'column',
    width: '24px',
    height: '18px',
    justifyContent: 'space-between',
  },
  hamburgerLine: {
    width: '100%',
    height: '2px',
    backgroundColor: '#f4a261',
    transition: 'all 0.3s ease',
  },
  mobileMenu: {
    position: 'fixed',
    top: '70px',
    right: 0,
    width: '280px',
    height: 'calc(100vh - 70px)',
    background: '#1e1e2f',
    boxShadow: '-2px 0 10px rgba(0,0,0,0.3)',
    transition: 'transform 0.3s ease',
    zIndex: 999,
    overflowY: 'auto',
  },
  mobileMenuContent: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  mobileNavLink: {
    color: '#f4a261',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '1.1rem',
    padding: '12px 0',
    borderBottom: '1px solid #2b2b3f',
  },
  mobileNavButton: {
    background: 'none',
    border: 'none',
    color: '#f4a261',
    fontWeight: '600',
    fontSize: '1.1rem',
    padding: '12px 0',
    borderBottom: '1px solid #2b2b3f',
    cursor: 'pointer',
    textAlign: 'left',
  },
  mobileAuth: {
    marginTop: '20px',
  },
  mobileSection: {
    marginBottom: '20px',
  },
  mobileSectionTitle: {
    color: '#888',
    fontSize: '0.9rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '10px',
  },
  mobileLink: {
    display: 'block',
    color: '#f4a261',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '1rem',
    padding: '8px 0',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.5)',
    zIndex: 998,
  },
}; 