import React from 'react';
import EventList from '../components/EventList';

function Home() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Welcome to EventVerse</h1>
      <p style={styles.subtitle}>Buy & sell tickets for events easily.</p>
      <button style={styles.button}>Get Started</button>
    </div>

  
  );
}

const styles = {
  container: {
    backgroundColor: '#1e1e2f',
    color: '#fff',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '1.2rem',
    marginBottom: '30px',
  },
  button: {
    backgroundColor: '#f4a261',
    color: '#1e1e2f',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '5px',
    fontWeight: 'bold',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  link: {
    color: '#f4a261',
    margin: '0 10px',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
  

};

export default Home;
