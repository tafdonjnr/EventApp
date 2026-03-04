import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import { API_BASE_URL } from '../config/api';

/**
 * Hidden admin login — only admin accounts can log in here.
 * Organizer accounts receive 403 Unauthorized from backend.
 */
export default function AdminLogin() {
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
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Please fill in all fields');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Login failed');
        return;
      }
      const userData = {
        id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
      };
      login(userData, data.token, data.role, form.rememberMe);
      navigate('/admin');
    } catch (err) {
      setError('Network error. Please try again.');
    }
  }

  return (
    <AuthLayout>
      <h2 className="heading-2 text-center mb-6">Admin Login</h2>
      {error && <div className="small-text text-red-600 text-center mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-4" noValidate>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="input-standard"
          autoComplete="email"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="input-standard"
          autoComplete="current-password"
        />
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="rememberMe"
            name="rememberMe"
            checked={form.rememberMe}
            onChange={handleChange}
            className="rounded border-softBorder text-primaryStart focus:ring-primaryStart"
          />
          <label htmlFor="rememberMe" className="body-text small-text cursor-pointer">
            Remember Me
          </label>
        </div>
        <button type="submit" className="primary-btn w-full">
          Log In
        </button>
      </form>
      <p className="small-text text-mutedText text-center mt-4">
        <a href="/" className="text-accentColor hover:underline">← Back to Home</a>
      </p>
    </AuthLayout>
  );
}
