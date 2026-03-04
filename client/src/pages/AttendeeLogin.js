import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import { API_BASE_URL } from '../config/api';

export default function AttendeeLogin() {
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/attendees/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Login successful! Redirecting...');
        login(data.attendee, data.token, 'attendee', form.rememberMe);
        setTimeout(() => navigate('/attendee/dashboard'), 1000);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <h2 className="heading-2 text-center mb-6">Attendee Login</h2>
      {error && <div className="small-text text-red-600 text-center mb-4">{error}</div>}
      {success && <div className="small-text text-green-600 text-center mb-4">{success}</div>}
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
          <label htmlFor="rememberMe" className="body-text small-text cursor-pointer">Remember Me</label>
        </div>
        <button type="submit" disabled={loading} className="primary-btn w-full">
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
      <Link to="/attendee/register" className="body-text small-text text-center block mt-4 text-primaryStart hover:underline">
        Don't have an account? Sign up here
      </Link>
    </AuthLayout>
  );
}
