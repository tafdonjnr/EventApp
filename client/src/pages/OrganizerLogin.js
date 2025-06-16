import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';

const styles = {
  header: {
    color: '#fff',
    fontSize: '1.8rem',
    marginBottom: '1.5rem',
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 400,
    margin: '0 auto',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    marginBottom: '1.2rem',
    borderRadius: 8,
    border: '2px solid transparent',
    backgroundColor: '#1e1e2f',
    color: '#fff',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border 0.25s ease, box-shadow 0.25s ease',
    fontFamily: 'inherit',
  },
  inputFocus: {
    borderColor: '#f4a261',
    boxShadow: '0 0 8px rgba(244,162,97,0.7)',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#f4a261',
    color: '#1e1e2f',
    fontWeight: 700,
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: '1.1rem',
    transition: 'background-color 0.25s ease',
  },
  errorMsg: {
    color: '#ff6b6b',
    marginBottom: '1rem',
    textAlign: 'center',
  },
};

function InputField({ type = 'text', placeholder, name, value, onChange }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{
        ...styles.input,
        ...(focused ? styles.inputFocus : {}),
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      autoComplete="off"
    />
  );
}

export default function OrganizerLogin() {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('/api/organizers/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      // Save token
      localStorage.setItem('token', data.token);

      // Redirect to organizer dashboard
      navigate('/organizer/dashboard');
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Login error:', err);
    }
  }

  return (
    <AuthLayout>
      <h2 style={styles.header}>Organizer Login</h2>

      {error && <div style={styles.errorMsg}>{error}</div>}

      <form onSubmit={handleSubmit} style={styles.form} noValidate>
        <InputField
          type="email"
          placeholder="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
        />
        <InputField
          type="password"
          placeholder="Password"
          name="password"
          value={form.password}
          onChange={handleChange}
        />

        <button
          type="submit"
          style={styles.button}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#e08a3f')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#f4a261')}
        >
          Log In
        </button>
      </form>
    </AuthLayout>
  );
}
