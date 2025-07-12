import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const styles = {
  page: {
    backgroundColor: '#1e1e2f',
    minHeight: '100vh',
    color: '#fff',
    padding: '2rem',
  },
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    background: '#2b2b3f',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
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
    color: '#f4a261',
  },
  organizer: {
    fontSize: '1.1rem',
    color: '#ccc',
    marginBottom: '2rem',
    fontStyle: 'italic',
  },
  description: {
    fontSize: '1.1rem',
    lineHeight: '1.6',
    marginBottom: '2rem',
    color: '#f4f4f4',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  infoCard: {
    background: '#1e1e2f',
    padding: '1.5rem',
    borderRadius: '8px',
    border: '1px solid #444',
  },
  infoLabel: {
    fontSize: '0.9rem',
    color: '#888',
    marginBottom: '0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  infoValue: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#f4f4f4',
  },
  price: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#51cf66',
  },
  category: {
    display: 'inline-block',
    background: '#f4a261',
    color: '#1e1e2f',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  actionSection: {
    background: '#1e1e2f',
    padding: '2rem',
    borderTop: '1px solid #444',
  },
  ticketInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  ticketCount: {
    fontSize: '1.1rem',
    color: '#ccc',
  },
  registerButton: {
    background: '#51cf66',
    color: '#fff',
    padding: '1rem 2rem',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    width: '100%',
  },
  registerButtonDisabled: {
    background: '#666',
    color: '#ccc',
    cursor: 'not-allowed',
  },
  registerButtonLoading: {
    background: '#f4a261',
    color: '#1e1e2f',
  },
  error: {
    background: '#ff6b6b',
    color: '#fff',
    padding: '1rem',
    borderRadius: '6px',
    marginBottom: '1rem',
    textAlign: 'center',
  },
  success: {
    background: '#51cf66',
    color: '#fff',
    padding: '1rem',
    borderRadius: '6px',
    marginBottom: '1rem',
    textAlign: 'center',
  },
  loading: {
    textAlign: 'center',
    padding: '3rem',
    color: '#f4a261',
    fontSize: '1.2rem',
  },
  backButton: {
    background: '#666',
    color: '#fff',
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginBottom: '1rem',
    fontSize: '1rem',
  },
};

export default function EventDetail() {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const response = await fetch(`/api/events/${id}`);
      if (response.ok) {
        const eventData = await response.json();
        setEvent(eventData);
        
        // Check if user is registered for this event
        if (token && userRole === 'attendee') {
          checkRegistrationStatus(eventData._id);
        }
      } else {
        setError('Event not found');
      }
    } catch (err) {
      setError('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const checkRegistrationStatus = async (eventId) => {
    try {
      const response = await fetch(`/api/attendees/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const attendeeData = await response.json();
        const isRegisteredForEvent = attendeeData.registeredEvents?.some(
          reg => reg.event._id === eventId
        );
        setIsRegistered(isRegisteredForEvent);
      }
    } catch (err) {
      console.error('Error checking registration status:', err);
    }
  };

  const handleRegister = async () => {
    if (!token) {
      navigate('/attendee/login');
      return;
    }

    if (userRole !== 'attendee') {
      setError('Only attendees can register for events');
      return;
    }

    setRegistering(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/events/${id}/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Successfully registered for event!');
        setIsRegistered(true);
        // Refresh event data to update ticket count
        fetchEventDetails();
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>Loading event details...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={styles.page}>
        <div style={styles.error}>Event not found</div>
        <button style={styles.backButton} onClick={() => navigate('/')}>
          Back to Home
        </button>
      </div>
    );
  }

  const isSoldOut = event.ticketsAvailable <= 0;
  const canRegister = !isRegistered && !isSoldOut && userRole === 'attendee';

  return (
    <div style={styles.page}>
      <button style={styles.backButton} onClick={() => navigate('/')}>
        ← Back to Events
      </button>

      <div style={styles.container}>
        {event.banner && (
          <img
            src={`http://localhost:5000${event.banner}`}
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
          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}

          <div style={styles.ticketInfo}>
            <div style={styles.ticketCount}>
              {isSoldOut ? (
                <span style={{ color: '#ff6b6b' }}>Sold Out</span>
              ) : (
                `${event.ticketsAvailable} tickets available`
              )}
            </div>
          </div>

          {isRegistered ? (
            <button style={{ ...styles.registerButton, ...styles.registerButtonDisabled }}>
              Already Registered ✓
            </button>
          ) : !token ? (
            <button 
              style={styles.registerButton}
              onClick={() => navigate('/attendee/login')}
            >
              Login to Register
            </button>
          ) : userRole !== 'attendee' ? (
            <button style={{ ...styles.registerButton, ...styles.registerButtonDisabled }}>
              Only attendees can register for events
            </button>
          ) : (
            <button
              style={{
                ...styles.registerButton,
                ...(registering ? styles.registerButtonLoading : {}),
                ...(isSoldOut ? styles.registerButtonDisabled : {})
              }}
              onClick={handleRegister}
              disabled={registering || isSoldOut}
            >
              {registering ? 'Registering...' : isSoldOut ? 'Sold Out' : 'Register for Event'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
