import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getImageUrl } from '../config/api';
import LoadingState from '../components/LoadingState';

const styles = {
  page: {
    backgroundColor: 'var(--bg-primary)',
    minHeight: '100vh',
    color: 'var(--text-primary)',
    padding: '2rem',
  },
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    background: 'var(--bg-secondary)',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 10px var(--shadow-primary)',
  },
  banner: {
    width: '100%',
    height: '300px',
    objectFit: 'cover',
  },
  content: {
    padding: '2rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    color: 'var(--text-accent)',
  },
  organizer: {
    fontSize: '1.1rem',
    color: 'var(--text-secondary)',
    marginBottom: '2rem',
    fontStyle: 'italic',
  },
  description: {
    fontSize: '1.1rem',
    lineHeight: '1.6',
    marginBottom: '2rem',
    color: 'var(--text-primary)',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  infoCard: {
    background: 'var(--bg-card)',
    padding: '1.5rem',
    borderRadius: '8px',
    border: '1px solid var(--border-primary)',
  },
  infoLabel: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    marginBottom: '0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  infoValue: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  price: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'var(--text-success)',
  },
  category: {
    display: 'inline-block',
    background: 'var(--text-accent)',
    color: 'var(--bg-primary)',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  actionSection: {
    background: 'var(--bg-card)',
    padding: '2rem',
    borderTop: '1px solid var(--border-primary)',
  },
  ticketInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  ticketCount: {
    fontSize: '1.1rem',
    color: 'var(--text-secondary)',
  },
  registerButton: {
    background: 'var(--bg-button)',
    color: 'var(--text-primary)',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.25s ease',
  },
  registerButtonHover: {
    background: 'var(--bg-button-hover)',
  },
  registerButtonDisabled: {
    background: 'var(--bg-button-secondary)',
    color: 'var(--text-muted)',
    cursor: 'not-allowed',
  },
  backButton: {
    background: 'var(--bg-button-secondary)',
    color: 'var(--text-primary)',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    marginBottom: '1rem',
    transition: 'background-color 0.25s ease',
  },
  error: {
    color: 'var(--text-error)',
    textAlign: 'center',
    padding: '1rem',
    backgroundColor: 'var(--bg-card)',
    borderRadius: '8px',
    marginBottom: '1rem',
  },
  success: {
    color: 'var(--text-success)',
    textAlign: 'center',
    padding: '1rem',
    backgroundColor: 'var(--bg-card)',
    borderRadius: '8px',
    marginBottom: '1rem',
  },
};

export default function EventDetail() {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message] = useState('');
  const [isRegistered] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/events/${id}`);
        
        if (!response.ok) {
          throw new Error('Event not found');
        }
        
        const data = await response.json();
        setEvent(data);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event details.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRegister = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      if (!token) {
        navigate('/attendee/login');
        return;
      }

      // Initiate Paystack payment via backend
      const initRes = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventId: id, ticketCount: 1 }),
      });

      const initData = await initRes.json();
      if (!initRes.ok) {
        setError(initData.message || 'Could not start payment');
        return;
      }

      // Redirect to Paystack authorization URL
      if (initData.authorizationUrl) {
        window.location.href = initData.authorizationUrl;
      }
    } catch (err) {
      setError('Failed to start payment');
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <LoadingState 
          message="Loading event details..." 
          size="large"
          containerStyle={{ minHeight: '60vh' }}
        />
      </div>
    );
  }

  if (error && !event) {
    return (
      <div style={styles.page}>
        <div style={styles.error}>{error}</div>
        <button 
          style={styles.backButton}
          onClick={() => navigate('/')}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-button)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--bg-button-secondary)'}
        >
          ← Back to Events
        </button>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={styles.page}>
        <div style={styles.error}>Event not found</div>
        <button 
          style={styles.backButton}
          onClick={() => navigate('/')}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-button)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--bg-button-secondary)'}
        >
          ← Back to Events
        </button>
      </div>
    );
  }

  const isSoldOut = event.ticketsAvailable <= 0;
  const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
  const canRegister = !isRegistered && !isSoldOut && userRole === 'attendee';

  return (
    <div style={styles.page}>
      <button 
        style={styles.backButton} 
        onClick={() => navigate('/')}
        onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-button)'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--bg-button-secondary)'}
      >
        ← Back to Events
      </button>

      {error && <div style={styles.error}>{error}</div>}
      {message && <div style={styles.success}>{message}</div>}

      <div style={styles.container}>
        {event.banner && (
          <img
            src={getImageUrl(event.banner)}
            alt={event.title}
            style={styles.banner}
          />
        )}

        <div style={styles.content}>
          <h1 style={styles.title}>{event.title}</h1>
          <p style={styles.organizer}>
            Organized by {event.organizer?.orgName || 'Unknown Organizer'}
          </p>

          <div style={styles.infoGrid}>
            <div style={styles.infoCard}>
              <div style={styles.infoLabel}>Date & Time</div>
              <div style={styles.infoValue}>
                {formatDate(event.date)}
                <br />
                {formatTime(event.date)}
              </div>
            </div>

            <div style={styles.infoCard}>
              <div style={styles.infoLabel}>Venue</div>
              <div style={styles.infoValue}>{event.venue}</div>
            </div>

            <div style={styles.infoCard}>
              <div style={styles.infoLabel}>Category</div>
              <div style={styles.infoValue}>
                <span style={styles.category}>{event.category}</span>
              </div>
            </div>

            <div style={styles.infoCard}>
              <div style={styles.infoLabel}>Ticket Price</div>
              <div style={styles.price}>${event.price}</div>
            </div>
          </div>

          <div style={styles.description}>
            <h3>About This Event</h3>
            <p>{event.description}</p>
          </div>
        </div>

        <div style={styles.actionSection}>
          <div style={styles.ticketInfo}>
            <div style={styles.ticketCount}>
              {isSoldOut ? 'Sold Out' : `${event.ticketsAvailable} tickets available`}
            </div>
            {canRegister && (
              <button
                style={styles.registerButton}
                onClick={handleRegister}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-button-hover)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--bg-button)'}
              >
                Register for Event
              </button>
            )}
            {isRegistered && (
              <div style={{ color: 'var(--text-success)', fontWeight: '600' }}>
                ✓ Registered
              </div>
            )}
            {!userRole && (
              <button
                style={styles.registerButton}
                onClick={() => navigate('/attendee/login')}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-button-hover)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--bg-button)'}
              >
                Login to Register
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
