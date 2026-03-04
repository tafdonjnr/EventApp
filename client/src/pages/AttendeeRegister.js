import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { API_BASE_URL } from '../config/api';

export default function AttendeeRegister() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    if (form.password !== form.confirmPassword) {
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
      const response = await fetch(`${API_BASE_URL}/api/attendees/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        setTimeout(() => navigate('/attendee/login'), 2000);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="heading-2 text-center mb-6">Attendee Registration</h2>
      {error && <div className="small-text text-red-600 text-center mb-4">{error}</div>}
      {success && <div className="small-text text-green-600 text-center mb-4">{success}</div>}
      <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-4" noValidate>
        <input type="text" placeholder="Full Name" name="name" value={form.name} onChange={handleChange} className="input-standard" />
        <input type="email" placeholder="Email" name="email" value={form.email} onChange={handleChange} className="input-standard" />
        <input type="password" placeholder="Password" name="password" value={form.password} onChange={handleChange} className="input-standard" />
        <input type="password" placeholder="Confirm Password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="input-standard" />
        <input type="tel" placeholder="Phone Number (optional)" name="phone" value={form.phone} onChange={handleChange} className="input-standard" />
        <button type="submit" disabled={loading} className="primary-btn w-full">
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      <Link to="/attendee/login" className="body-text small-text text-center block mt-4 text-primaryStart hover:underline">
        Already have an account? Sign in here
      </Link>
    </AuthLayout>
  );
}
