import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../config/api';
import LoadingState from '../components/LoadingState';
import EmptyState, { EmptyStates } from '../components/EmptyState';

const styles = {
  page: {
    backgroundColor: 'var(--bg-primary)',
    minHeight: '100vh',
    color: 'var(--text-primary)',
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
    color: 'var(--text-accent)',
  },
  button: {
    background: 'var(--bg-button)',
    color: 'var(--text-primary)',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.25s ease',
  },
  section: {
    background: 'var(--bg-secondary)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem',
    boxShadow: '0 4px 10px var(--shadow-primary)',
  },
  sectionTitle: {
    fontSize: '1.4rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: 'var(--text-accent)',
  },
  profileInfo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem',
  },
  infoItem: {
    background: 'var(--bg-card)',
    padding: '1rem',
    borderRadius: '8px',
  },
  infoLabel: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    marginBottom: '0.5rem',
  },
  infoValue: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  eventGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  eventCard: {
    background: 'var(--bg-card)',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 6px var(--shadow-primary)',
    border: '1px solid var(--border-primary)',
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
    color: 'var(--text-accent)',
  },
  eventInfo: {
    fontSize: '0.9rem',
    marginBottom: '0.25rem',
    color: 'var(--text-secondary)',
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
    background: 'var(--bg-button-success)',
    color: 'var(--text-primary)',
  },
  statusAttended: {
    background: 'var(--bg-button-info)',
    color: 'var(--text-primary)',
  },
  statusCancelled: {
    background: 'var(--bg-button-danger)',
    color: 'var(--text-primary)',
  },
  error: {
    color: 'var(--text-error)',
    marginBottom: '1rem',
    textAlign: 'center',
    padding: '1rem',
    backgroundColor: 'var(--bg-card)',
    borderRadius: '8px',
  },
  quickActions: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  actionButton: {
    background: 'var(--bg-button)',
    color: 'var(--text-primary)',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.25s ease',
    fontSize: '1rem',
  },
};

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
        <LoadingState 
          message="Loading your dashboard..." 
          size="large"
          containerStyle={{ minHeight: '60vh' }}
        />
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Welcome back, {attendee?.name}!</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your events and profile</p>
        </div>
        <button 
          style={styles.button} 
          onClick={logout}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-button-hover)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--bg-button)'}
        >
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

      {/* Quick Actions Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Quick Actions</h2>
        <div style={styles.quickActions}>
          <button 
            style={styles.actionButton}
            onClick={() => navigate('/attendee/tickets')}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--accent-color)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--bg-button)'}
          >
            🎫 View My Tickets
          </button>
        </div>
      </div>

      {/* Registered Events Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>My Events</h2>
        
        {!attendee?.registeredEvents || attendee.registeredEvents.length === 0 ? (
          <EmptyState {...EmptyStates.attendeeEvents} />
        ) : (
          <div style={styles.eventGrid}>
            {attendee.registeredEvents.map((registration) => (
              <div key={registration._id} style={styles.eventCard}>
                {registration.event?.banner && (
                  <img
                    src={getImageUrl(registration.event.banner)}
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