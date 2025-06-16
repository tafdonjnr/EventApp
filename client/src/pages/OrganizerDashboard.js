import React, { useEffect, useState } from 'react';
import EventModal from '../components/EventModal';
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
};

export default function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShow] = useState(false);
  const [editEvent, setEdit] = useState(null);
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

  const loadEvents = async () => {
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
  };

  useEffect(() => {
    loadEvents();
  }, []);

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
        onClick={() => {
          setEdit(null);
          setShow(true);
        }}
      >
        Create New Event
      </button>

      <hr style={{ borderColor: '#444', margin: '1.5rem 0' }} />

      {events.length === 0 ? (
        <p>You have no events yet. Click "Create New Event" to add one!</p>
      ) : (
        events.map((ev) => (
          <div key={ev._id} style={styles.card}>
            <h3>{ev.title}</h3>
            <p>{ev.description}</p>
            <p>
              <strong>Date:</strong>{' '}
              {new Date(ev.date).toLocaleString()}
            </p>
            <p>
              <strong>Location:</strong> {ev.location}
            </p>
            <button
              style={{ ...styles.smallBtn, background: '#f4a261' }}
              onClick={() => {
                setEdit(ev);
                setShow(true);
              }}
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
        ))
      )}

      <EventModal
        open={showModal}
        onClose={() => setShow(false)}
        initial={editEvent || {}}
        onSaved={loadEvents}
      />
    </div>
  );
}
