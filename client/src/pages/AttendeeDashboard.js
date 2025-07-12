import React, { useState, useEffect, useCallback } from 'react';
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
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2.2rem',
    marginBottom: '1rem',
    color: '#f4a261',
  },
  button: {
    background: '#f4a261',
    color: '#1e1e2f',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background 0.25s',
  },
  section: {
    background: '#2b2b3f',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem',
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
  },
  sectionTitle: {
    fontSize: '1.4rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#f4a261',
  },
  profileInfo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem',
  },
  infoItem: {
    background: '#1e1e2f',
    padding: '1rem',
    borderRadius: '8px',
  },
  infoLabel: {
    fontSize: '0.9rem',
    color: '#888',
    marginBottom: '0.5rem',
  },
  infoValue: {
    fontSize: '1.1rem',
    fontWeight: '600',
  },
  eventGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  eventCard: {
    background: '#1e1e2f',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
    border: '1px solid #444',
  },
  eventBanner: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
  },
  eventContent: {
    padding: '1rem',
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
  eventStatus: {
    display: 'inline-block',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: '600',
    marginTop: '0.5rem',
  },
  statusRegistered: {
    background: '#51cf66',
    color: '#fff',
  },
  statusAttended: {
    background: '#339af0',
    color: '#fff',
  },
  statusCancelled: {
    background: '#ff6b6b',
    color: '#fff',
  },
  emptyState: {
    textAlign: 'center',
    padding: '2rem',
    color: '#888',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    color: '#f4a261',
  },
  error: {
    background: '#ff6b6b',
    color: '#fff',
    padding: '1rem',
    borderRadius: '6px',
    marginBottom: '1rem',
    textAlign: 'center',
  },
};

export default function AttendeeDashboard() {
  const [attendee, setAttendee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    if (!token || userRole !== 'attendee') {
      navigate('/attendee/login');
      return;
    }
    loadAttendeeData();
  }, [token, userRole, navigate]);

  const loadAttendeeData = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/attendees/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userData');
        navigate('/attendee/login');
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
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    navigate('/');
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'registered':
        return styles.statusRegistered;
      case 'attended':
        return styles.statusAttended;
      case 'cancelled':
        return styles.statusCancelled;
      default:
        return styles.statusRegistered;
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Welcome back, {attendee?.name}!</h1>
          <p>Manage your events and profile</p>
        </div>
        <button style={styles.button} onClick={handleLogout}>
          Logout
        </button>
      </header>

      {error && <div style={styles.error}>{error}</div>}

      {/* Profile Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Profile Information</h2>
        <div style={styles.profileInfo}>
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>Name</div>
            <div style={styles.infoValue}>{attendee?.name}</div>
          </div>
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>Email</div>
            <div style={styles.infoValue}>{attendee?.email}</div>
          </div>
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>Phone</div>
            <div style={styles.infoValue}>{attendee?.phone || 'Not provided'}</div>
          </div>
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>Events Registered</div>
            <div style={styles.infoValue}>{attendee?.registeredEvents?.length || 0}</div>
          </div>
        </div>
      </div>

      {/* Registered Events Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>My Events</h2>
        
        {!attendee?.registeredEvents || attendee.registeredEvents.length === 0 ? (
          <div style={styles.emptyState}>
            <p>You haven't registered for any events yet.</p>
            <button 
              style={styles.button}
              onClick={() => navigate('/')}
            >
              Browse Events
            </button>
          </div>
        ) : (
          <div style={styles.eventGrid}>
            {attendee.registeredEvents.map((registration) => (
              <div key={registration._id} style={styles.eventCard}>
                {registration.event?.banner && (
                  <img
                    src={`http://localhost:5000${registration.event.banner}`}
                    alt={registration.event.title}
                    style={styles.eventBanner}
                  />
                )}
                <div style={styles.eventContent}>
                  <h3 style={styles.eventTitle}>{registration.event?.title}</h3>
                  <p style={styles.eventInfo}>
                    <strong>Date:</strong> {registration.event?.date ? 
                      new Date(registration.event.date).toLocaleDateString() : 'TBD'}
                  </p>
                  <p style={styles.eventInfo}>
                    <strong>Time:</strong> {registration.event?.date ? 
                      new Date(registration.event.date).toLocaleTimeString() : 'TBD'}
                  </p>
                  <p style={styles.eventInfo}>
                    <strong>Venue:</strong> {registration.event?.venue}
                  </p>
                  <p style={styles.eventInfo}>
                    <strong>Price:</strong> ${registration.event?.price}
                  </p>
                  <p style={styles.eventInfo}>
                    <strong>Registered:</strong> {new Date(registration.registrationDate).toLocaleDateString()}
                  </p>
                  <span style={{...styles.eventStatus, ...getStatusStyle(registration.status)}}>
                    {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 