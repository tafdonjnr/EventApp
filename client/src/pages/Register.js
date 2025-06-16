import React from 'react';

function Register() {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Register</h2>
      <input type="text" placeholder="Full Name" style={styles.input} />
      <input type="email" placeholder="Email" style={styles.input} />
      <input type="password" placeholder="Password" style={styles.input} />
      <button style={styles.button}>Sign Up</button>
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
    padding: '20px',
  },
  title: {
    marginBottom: '20px',
    fontSize: '2rem',
  },
  input: {
    width: '250px',
    padding: '12px',
    marginBottom: '15px',
    borderRadius: '5px',
    border: 'none',
    fontSize: '1rem',
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
};

export default Register;
