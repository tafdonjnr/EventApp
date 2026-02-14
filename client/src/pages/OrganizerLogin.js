import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import { API_BASE_URL } from '../config/api';

const styles = {
  header: {
    color: 'var(--text-primary)',
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
    backgroundColor: 'var(--bg-input)',
    color: 'var(--text-primary)',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border 0.25s ease, box-shadow 0.25s ease',
    fontFamily: 'inherit',
  },
  inputFocus: {
    borderColor: 'var(--border-accent)',
    boxShadow: '0 0 8px var(--shadow-accent)',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'var(--bg-button)',
    color: 'var(--text-primary)',
    fontWeight: 700,
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: '1.1rem',
    transition: 'background-color 0.25s ease',
  },
  errorMsg: {
    color: 'var(--text-error)',
    marginBottom: '1rem',
    textAlign: 'center',
  },
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1.2rem',
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    marginRight: '10px',
    accentColor: 'var(--text-accent)',
    cursor: 'pointer',
  },
  checkboxLabel: {
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    cursor: 'pointer',
    userSelect: 'none',
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
    rememberMe: false,
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ 
      ...form, 
      [name]: type === 'checkbox' ? checked : value 
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/organizers/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      // Use AuthContext login function (API returns _id, name, email, role, token)
      const organizer = data.organizer || {
        id: data._id,
        name: data.name,
        email: data.email,
        role: data.role || 'organizer',
      };
      login(organizer, data.token, data.role || 'organizer', form.rememberMe);

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

        <div style={styles.checkboxContainer}>
          <input
            type="checkbox"
            id="rememberMe"
            name="rememberMe"
            checked={form.rememberMe}
            onChange={handleChange}
            style={styles.checkbox}
          />
          <label htmlFor="rememberMe" style={styles.checkboxLabel}>
            Remember Me
          </label>
        </div>

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
