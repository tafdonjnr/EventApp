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
    fontWeight: '700',
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
  const [focused, setFocused] = useState(false);
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

export default function AttendeeRegister() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    phone: '',
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

    // Validation
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/attendees/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/attendee/login');
        }, 2000);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <h2 style={styles.header}>Attendee Sign-Up</h2>

      {error && <div style={styles.errorMsg}>{error}</div>}
      {success && <div style={styles.successMsg}>{success}</div>}

      <form onSubmit={handleSubmit} style={styles.form} noValidate>
        <InputField
          placeholder="Full Name"
          name="name"
          value={form.name}
          onChange={handleChange}
        />
        <InputField
          type="email"
          placeholder="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
        />
        <InputField
          type="tel"
          placeholder="Phone (optional)"
          name="phone"
          value={form.phone}
          onChange={handleChange}
        />
        <InputField
          type="password"
          placeholder="Password"
          name="password"
          value={form.password}
          onChange={handleChange}
        />
        <InputField
          type="password"
          placeholder="Confirm Password"
          name="confirm"
          value={form.confirm}
          onChange={handleChange}
        />

        <button
          type="submit"
          disabled={loading}
          style={styles.button}
          onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#e08a3f')}
          onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#f4a261')}
        >
          {loading ? 'Creating Account...' : 'Register'}
        </button>
      </form>

      <a href="/attendee/login" style={styles.link}>
        Already have an account? Log in here
      </a>
    </AuthLayout>
  );
}
