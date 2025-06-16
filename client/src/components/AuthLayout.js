import React from 'react';
import VerseLoader from '../components/VerseLoader';

const layoutStyles = {
  wrapper: {
    minHeight: '100vh',
    background: '#1e1e2f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  },
  card: {
    width: '100%',
    maxWidth: 440,
    background: '#2b2b3f',
    borderRadius: 12,
    padding: '2.5rem 2rem',
    boxShadow: '0 6px 18px rgba(0,0,0,0.6)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
};

export default function AuthLayout({ children }) {
  return (
    <div style={layoutStyles.wrapper}>
      <div style={layoutStyles.card}>
        {/* animated “Verse” word lives here and keeps layout intact */}
        <VerseLoader />
        {children}
      </div>
    </div>
  );
}
