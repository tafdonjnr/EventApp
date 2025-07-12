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
  successMsg: {
    color: '#51cf66',
    marginBottom: '1rem',
    textAlign: 'center',
  },
  link: {
    color: '#f4a261',
    textDecoration: 'none',
    textAlign: 'center',
    display: 'block',
    marginTop: '1rem',
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

export default function AttendeeLogin() {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!form.email || !form.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/attendees/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Login successful! Redirecting...');
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', 'attendee');
        localStorage.setItem('userData', JSON.stringify(data.attendee));
        
        setTimeout(() => {
          navigate('/attendee/dashboard');
        }, 1500);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <h2 style={styles.header}>Attendee Login</h2>

      {error && <div style={styles.errorMsg}>{error}</div>}
      {success && <div style={styles.successMsg}>{success}</div>}

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
          disabled={loading}
          style={styles.button}
          onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#e08a3f')}
          onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#f4a261')}
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <a href="/attendee/register" style={styles.link}>
        Don't have an account? Sign up here
      </a>
    </AuthLayout>
  );
}
