import React, { useState } from 'react';
import AuthLayout from '../components/AuthLayout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/organizers/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          orgName: form.orgName,
          bio: form.bio,
          password: form.password,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        const role = data.role || 'organizer';
        const userData = { id: data._id, name: data.name, email: data.email, orgName: data.orgName, role };
        login(userData, data.token, role, true);
        navigate(role === 'admin' ? '/admin' : '/dashboard');
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <h2 className="heading-2 text-center mb-6">Organizer Sign-Up</h2>
      {error && <div className="small-text text-red-600 text-center mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-4" noValidate>
        <input type="text" placeholder="Full Name" name="name" value={form.name} onChange={handleChange} className="input-standard" />
        <input placeholder="Organization Name" name="orgName" value={form.orgName} onChange={handleChange} className="input-standard" />
        <textarea placeholder="Short Bio" name="bio" value={form.bio} onChange={handleChange} className="input-standard" rows={3} />
        <input type="email" placeholder="Email" name="email" value={form.email} onChange={handleChange} className="input-standard" />
        <input type="password" placeholder="Password" name="password" value={form.password} onChange={handleChange} className="input-standard" />
        <input type="password" placeholder="Confirm Password" name="confirm" value={form.confirm} onChange={handleChange} className="input-standard" />
        <button type="submit" disabled={loading} className="primary-btn w-full">
          {loading ? 'Creating Account...' : 'Register'}
        </button>
      </form>
    </AuthLayout>
  );
}
