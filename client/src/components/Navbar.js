import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const [open, setOpen]       = useState(false);   // mobile overlay
  const [openReg, setReg]     = useState(false);   // desktop Register ▾
  const [openLog, setLog]     = useState(false);   // desktop Login ▾
  const token  = localStorage.getItem('token');
  const nav    = useNavigate();

  // Dash/Create handler
  const handleCreate = () => {
    if (token) nav('/organizer/dashboard');
    else       nav('/organizer/register');
    setOpen(false); setReg(false); setLog(false);
  };

  return (
    <>
      <nav style={styles.nav}>
        <div style={styles.container}>
          <Link to="/" style={styles.brand}>Verse</Link>

          {/* DESKTOP LINKS */}
          <div className="nav-links" style={{ display:'flex', gap:20 }}>
            <NavLinks token={token} onCreate={handleCreate} />

            {!token && (
              <>
                {/* Register ▾ */}
                <Dropdown
                  label="Register ▾"
                  open={openReg}
                  setOpen={setReg}
                  items={[
                    { to:'/organizer/register', label:'Organizer' },
                    { to:'/attendee/register',  label:'Attendee'  },
                  ]}
                />
                {/* Login ▾ */}
                <Dropdown
                  label="Login ▾"
                  open={openLog}
                  setOpen={setLog}
                  items={[
                    { to:'/organizer/login', label:'Organizer' },
                    { to:'/attendee/login',  label:'Attendee'  },
                  ]}
                />
              </>
            )}
          </div>

          {/* Burger (mobile) */}
          <button className="burger" onClick={() => setOpen(!open)} style={styles.burger}>☰</button>
        </div>
      </nav>

      {/* MOBILE OVERLAY */}
      {open && (
        <div style={styles.overlay}>
          <NavLinks token={token} onCreate={handleCreate} />

          {!token && (
            <>
              <Link to="/organizer/register" style={styles.overlayLink} onClick={() => setOpen(false)}>Register as Organizer</Link>
              <Link to="/attendee/register"  style={styles.overlayLink} onClick={() => setOpen(false)}>Register as Attendee</Link>
              <Link to="/organizer/login"    style={styles.overlayLink} onClick={() => setOpen(false)}>Login as Organizer</Link>
              <Link to="/attendee/login"     style={styles.overlayLink} onClick={() => setOpen(false)}>Login as Attendee</Link>
            </>
          )}

          <button onClick={() => setOpen(false)} style={{ ...styles.burger,fontSize:'2rem',marginTop:'2rem' }}>✕</button>
        </div>
      )}

      {/* media queries */}
      <style>{`
        @media (min-width:768px){ .burger{display:none;} }
        @media (max-width:767px){ .nav-links{display:none;} }
        body{margin:0;padding-top:70px;}
      `}</style>
    </>
  );
}

/* ---------- Dropdown helper ---------- */
function Dropdown({ label, open, setOpen, items }) {
  return (
    <div style={{ position:'relative' }}>
      <button onClick={() => setOpen(!open)} style={styles.dropBtn}>{label}</button>
      {open && (
        <div style={styles.dropdown}>
          {items.map(it => (
            <Link key={it.to} to={it.to} style={styles.dropItem} onClick={() => setOpen(false)}>
              {it.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Reusable Nav links ---------- */
function NavLinks({ token, onCreate }) {
  const link = { color:'#f4a261', textDecoration:'none', fontWeight:'bold', fontSize:'1.05rem', margin:'0 12px' };

  return (
    <>
      <Link to="/" style={link}>Home</Link>

      {token && (
        <>
          <Link to="/organizer/profile" style={link}>My Profile</Link>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/';
            }}
            style={{ ...link, background:'none', border:'none', cursor:'pointer' }}
          >
            Logout
          </button>
        </>
      )}

      <button onClick={onCreate} style={{ ...link, background:'none', border:'none', cursor:'pointer' }}>
        {token ? 'Dashboard' : 'Create Event'}
      </button>
    </>
  );
}

/* ---------- Styles ---------- */
const styles = {
  nav:{ background:'#1e1e2f', position:'fixed', top:0, width:'100%', zIndex:50, boxShadow:'0 2px 8px rgba(0,0,0,0.3)' },
  container:{ maxWidth:'1000px', margin:'0 auto', padding:'12px 20px',
    display:'flex', alignItems:'center', justifyContent:'space-between' },
  brand:{ color:'#f4a261', fontWeight:'bold', fontSize:'1.5rem', textDecoration:'none' },
  burger:{ background:'none', border:'none', fontSize:'1.8rem', color:'#f4a261', cursor:'pointer' },
  overlay:{ position:'fixed', top:0, left:0, width:'100vw', height:'100vh',
    background:'rgba(30,30,47,0.9)', backdropFilter:'blur(2px)',
    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'1.5rem', zIndex:100 },
  overlayLink:{ color:'#f4a261', textDecoration:'none', fontSize:'1.2rem', fontWeight:'bold' },
  dropBtn:{ background:'none', border:'none', color:'#f4a261', fontWeight:'bold', fontSize:'1.05rem', cursor:'pointer' },
  dropdown:{ position:'absolute', top:'110%', right:0, background:'#2b2b3f',
    borderRadius:6, boxShadow:'0 4px 10px rgba(0,0,0,0.5)', display:'flex', flexDirection:'column' },
  dropItem:{ padding:'10px 16px', color:'#f4a261', textDecoration:'none', fontWeight:'bold', whiteSpace:'nowrap' },
};
