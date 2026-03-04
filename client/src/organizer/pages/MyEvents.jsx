import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../config/api';
import LoadingState from '../../components/LoadingState';
import EmptyState, { EmptyStates } from '../../components/EmptyState';

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { user, userRole, logout } = useAuth();

  useEffect(() => {
    if (!user || userRole !== 'organizer') {
      navigate('/');
      return;
    }
  }, [user, userRole, navigate]);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(t);
    }
  }, [message]);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch('/api/events', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }
      if (!res.ok) throw new Error('Failed to load events');
      const allEvents = await res.json();
      const organizerEvents = allEvents.filter(
        (event) => event.organizer && event.organizer._id === user?.id
      );
      const sorted = organizerEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
      setEvents(sorted);
    } catch (err) {
      setError('Failed to load events. Please login again.');
    } finally {
      setLoading(false);
    }
  }, [user, logout]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Delete failed');
      setMessage('Event deleted successfully.');
      loadEvents();
    } catch (err) {
      setError('Failed to delete event.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 min-h-[60vh] flex items-center justify-center">
        <LoadingState message="Loading your events..." size="large" containerStyle={{ minHeight: '60vh' }} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="heading-1">My Events</h1>
        <button
          type="button"
          className="primary-btn"
          onClick={() => navigate('/dashboard/create')}
        >
          Create New Event
        </button>
      </div>

      {error && (
        <div className="card-standard mb-6 text-red-600 border-red-200 bg-red-50">{error}</div>
      )}
      {message && (
        <div className="card-standard mb-6 text-green-700 border-green-200 bg-green-50">{message}</div>
      )}

      {events.length === 0 ? (
        <EmptyState {...EmptyStates.organizerEvents} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {events.map((ev) => (
            <div key={ev._id} className="card-standard p-0 overflow-hidden flex flex-col">
              {ev.banner && (
                <img
                  src={getImageUrl(ev.banner)}
                  alt={ev.title}
                  className="w-full h-36 sm:h-40 object-cover"
                />
              )}
              <div className="p-4 flex-1">
                <h3 className="heading-3 mb-3">{ev.title}</h3>
                <div className="space-y-1 small-text mb-4">
                  <p><strong>Date:</strong> {new Date(ev.date).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {new Date(ev.date).toLocaleTimeString()}</p>
                  <p><strong>Venue:</strong> {ev.venue}</p>
                  <p><strong>Price:</strong> ${ev.price}</p>
                  <p><strong>Tickets:</strong> {ev.ticketsAvailable} available</p>
                  <p><strong>Category:</strong> {ev.category}</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    className="primary-btn flex-1"
                    onClick={() => navigate(`/dashboard/edit/${ev._id}`)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="secondary-btn flex-1 border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(ev._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEvents;
