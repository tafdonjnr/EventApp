import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const styles = {
  page: {
    backgroundColor: '#1e1e2f',
    minHeight: '100vh',
    color: '#fff',
    padding: '2rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '2.2rem',
    marginBottom: '1rem',
  },
  button: {
    background: '#f4a261',
    color: '#1e1e2f',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '1.5rem',
    transition: 'background 0.25s',
  },
  card: {
    background: '#2b2b3f',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
  },
  smallBtn: {
    marginRight: 8,
    padding: '6px 10px',
    fontSize: '0.85rem',
    borderRadius: 4,
    border: 'none',
    cursor: 'pointer',
  },
  eventGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem',
    marginTop: '1rem',
  },
  eventCard: {
    background: '#2b2b3f',
    borderRadius: '8px',
    padding: '1rem',
    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
    border: '1px solid #444',
  },
  eventBanner: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '6px',
    marginBottom: '1rem',
  },
  eventTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: '#f4a261',
  },
  eventInfo: {
    fontSize: '0.9rem',
    marginBottom: '0.25rem',
    color: '#ccc',
  },
  buttonGroup: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '1rem',
  },
};

export default function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orgName, setOrgName] = useState('');
  const [logo, setLogo] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) navigate('/');
  }, [token, navigate]);

  useEffect(() => {
    if (message) {
      const timeout = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timeout);
    }
  }, [message]);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/organizers/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token');
        navigate('/');
        return;
      }

      if (!res.ok) throw new Error('Failed to load dashboard data');

      const data = await res.json();

      setOrgName(data.organizer.orgName || 'Your Organization');
      setLogo(data.organizer.logo || '');

      const sortedEvents = (data.events || []).sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      setEvents(sortedEvents);
    } catch (err) {
      setError('Failed to load dashboard. Please login again.');
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Delete failed');
      setMessage('Event deleted successfully.');
      loadEvents();
    } catch (err) {
      console.error('Delete failed:', err);
      setMessage('Failed to delete event.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <p>Loading events...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {logo && (
            <img
              src={logo}
              alt="Logo"
              style={{ height: '50px', borderRadius: '6px' }}
            />
          )}
          <h1>{orgName}</h1>
        </div>
        <button style={styles.button} onClick={handleLogout}>
          Logout
        </button>
      </header>

      <h2 style={{ fontSize: '1.6rem', marginBottom: '1rem' }}>
        Welcome back, {orgName}!
      </h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'lightgreen' }}>{message}</p>}

      <button
        style={styles.button}
        onClick={() => navigate('/organizer/create-event')}
      >
        Create New Event
      </button>

      <hr style={{ borderColor: '#444', margin: '1.5rem 0' }} />

      {events.length === 0 ? (
        <p>You have no events yet. Click "Create New Event" to add one!</p>
      ) : (
        <div style={styles.eventGrid}>
          {events.map((ev) => (
            <div key={ev._id} style={styles.eventCard}>
              {ev.banner && (
                <img
                  src={`http://localhost:5000${ev.banner}`}
                  alt={ev.title}
                  style={styles.eventBanner}
                />
              )}
              <h3 style={styles.eventTitle}>{ev.title}</h3>
              <p style={styles.eventInfo}>
                <strong>Date:</strong> {new Date(ev.date).toLocaleDateString()}
              </p>
              <p style={styles.eventInfo}>
                <strong>Time:</strong> {new Date(ev.date).toLocaleTimeString()}
              </p>
              <p style={styles.eventInfo}>
                <strong>Venue:</strong> {ev.venue}
              </p>
              <p style={styles.eventInfo}>
                <strong>Price:</strong> ${ev.price}
              </p>
              <p style={styles.eventInfo}>
                <strong>Tickets:</strong> {ev.ticketsAvailable} available
              </p>
              <p style={styles.eventInfo}>
                <strong>Category:</strong> {ev.category}
              </p>
              <div style={styles.buttonGroup}>
                <button
                  style={{ ...styles.smallBtn, background: '#f4a261' }}
                  onClick={() => navigate(`/organizer/edit-event/${ev._id}`)}
                >
                  Edit
                </button>
                <button
                  style={{
                    ...styles.smallBtn,
                    background: '#ff6b6b',
                    color: '#fff',
                  }}
                  onClick={() => handleDelete(ev._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
