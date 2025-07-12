import React, { useState } from 'react';
import axios from 'axios';
import AuthLayout from '../components/AuthLayout';
import { useNavigate } from 'react-router-dom';

const styles = {
  // ... (unchanged styles)
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
  textarea: {
    minHeight: 90,
    resize: 'vertical',
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

function TextAreaField({ placeholder, name, value, onChange }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{
        ...styles.input,
        ...styles.textarea,
        ...(focused ? styles.inputFocus : {}),
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

export default function OrganizerRegister() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    orgName: '',
    bio: '',
    password: '',
    confirm: '',
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

async function handleSubmit(e) {
  e.preventDefault();

  if (form.password !== form.confirm) {
    setError("Passwords do not match.");
    return;
  }

  try {
    const res = await axios.post('http://localhost:5000/api/organizers/register', {
      name: form.name,
      email: form.email,
      orgName: form.orgName,
      bio: form.bio,
      password: form.password,
    });

    // Save token and user role
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('userRole', 'organizer');
    localStorage.setItem('userData', JSON.stringify(res.data.organizer || {}));
    
    navigate('/organizer/dashboard');
  } catch (err) {
    setError(err.response?.data?.message || 'Registration failed.');
  }
}
  return (
    <AuthLayout>
      <h2 style={styles.header}>Organizer Sign-Up</h2>

      <form onSubmit={handleSubmit} style={styles.form} noValidate>
        <InputField
          placeholder="Full Name"
          name="name"
          value={form.name}
          onChange={handleChange}
        />
        <InputField
          placeholder="Organization Name"
          name="orgName"
          value={form.orgName}
          onChange={handleChange}
        />
        <TextAreaField
          placeholder="Short Bio"
          name="bio"
          value={form.bio}
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

        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

        <button
          type="submit"
          style={styles.button}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#e08a3f')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#f4a261')}
        >
          Register
        </button>
      </form>
    </AuthLayout>
  );
}
