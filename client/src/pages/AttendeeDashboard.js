import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../config/api';
import LoadingState from '../components/LoadingState';
import EmptyState, { EmptyStates } from '../components/EmptyState';

export default function AttendeeDashboard() {
  const [attendee, setAttendee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, userRole, logout } = useAuth();

  const loadAttendeeData = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      // Get token from storage (AuthContext handles this)
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await fetch('/api/attendees/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401 || response.status === 403) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to load attendee data');
      }

      const data = await response.json();
      setAttendee(data);
    } catch (err) {
      console.error('Load attendee data error:', err);
      setError('Failed to load dashboard data. Please login again.');
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (!user || userRole !== 'attendee') {
      navigate('/attendee/login');
      return;
    }
    loadAttendeeData();
  }, [user, userRole, navigate, loadAttendeeData]);

  const getStatusClass = (status) => {
    switch (status) {
      case 'registered': return 'bg-green-100 text-green-800';
      case 'attended': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 min-h-[60vh] flex items-center justify-center">
        <LoadingState message="Loading your dashboard..." size="large" containerStyle={{ minHeight: '60vh' }} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 sm:px-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="heading-1 mb-1">Welcome back, {attendee?.name}!</h1>
          <p className="body-text small-text text-mutedText">Manage your events and profile</p>
        </div>
        <button type="button" className="secondary-btn" onClick={logout}>Logout</button>
      </header>

      {error && <div className="card-standard mb-6 text-red-600 border-red-200 bg-red-50">{error}</div>}

      <section className="card-standard mb-8">
        <h2 className="heading-3 mb-4">Profile Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-standard">
            <div className="small-text text-mutedText mb-1">Name</div>
            <div className="body-text font-semibold">{attendee?.name}</div>
          </div>
          <div className="card-standard">
            <div className="small-text text-mutedText mb-1">Email</div>
            <div className="body-text font-semibold">{attendee?.email}</div>
          </div>
          <div className="card-standard">
            <div className="small-text text-mutedText mb-1">Phone</div>
            <div className="body-text font-semibold">{attendee?.phone || 'Not provided'}</div>
          </div>
          <div className="card-standard">
            <div className="small-text text-mutedText mb-1">Events Registered</div>
            <div className="body-text font-semibold">{attendee?.registeredEvents?.length || 0}</div>
          </div>
        </div>
      </section>

      <section className="card-standard mb-8">
        <h2 className="heading-3 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button type="button" className="primary-btn" onClick={() => navigate('/attendee/tickets')}>
            🎫 View My Tickets
          </button>
        </div>
      </section>

      <section className="card-standard">
        <h2 className="heading-3 mb-6">My Events</h2>
        {!attendee?.registeredEvents || attendee.registeredEvents.length === 0 ? (
          <EmptyState {...EmptyStates.attendeeEvents} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {attendee.registeredEvents.map((registration) => (
              <div key={registration._id} className="card-standard p-0 overflow-hidden flex flex-col">
                {registration.event?.banner && (
                  <img src={getImageUrl(registration.event.banner)} alt={registration.event.title} className="w-full h-36 sm:h-40 object-cover" />
                )}
                <div className="p-4 flex-1">
                  <h3 className="heading-3 mb-2">{registration.event?.title}</h3>
                  <div className="space-y-1 small-text mb-3">
                    <p><strong>Date:</strong> {registration.event?.date ? new Date(registration.event.date).toLocaleDateString() : 'TBD'}</p>
                    <p><strong>Time:</strong> {registration.event?.date ? new Date(registration.event.date).toLocaleTimeString() : 'TBD'}</p>
                    <p><strong>Venue:</strong> {registration.event?.venue}</p>
                    <p><strong>Price:</strong> ${registration.event?.price}</p>
                    <p><strong>Registered:</strong> {new Date(registration.registrationDate).toLocaleDateString()}</p>
                  </div>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusClass(registration.status)}`}>
                    {registration.status?.charAt(0).toUpperCase() + registration.status?.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
} 