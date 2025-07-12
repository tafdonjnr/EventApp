import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        setError('Failed to load events');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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
      <div style={styles.container}>
        <div style={styles.loading}>Loading events...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.title}>Welcome to EventVerse</h1>
        <p style={styles.subtitle}>Discover and register for amazing events</p>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.eventsSection}>
        <h2 style={styles.sectionTitle}>Upcoming Events</h2>
        
        {events.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No events available at the moment.</p>
            <p>Check back later for new events!</p>
          </div>
        ) : (
          <div style={styles.eventsGrid}>
            {events.map((event) => (
              <div key={event._id} style={styles.eventCard}>
                {event.banner && (
                  <img
                    src={`http://localhost:5000${event.banner}`}
                    alt={event.title}
                    style={styles.eventBanner}
                  />
                )}
                
                <div style={styles.eventContent}>
                  <h3 style={styles.eventTitle}>{event.title}</h3>
                  
                  <div style={styles.eventInfo}>
                    <p style={styles.eventDate}>
                      📅 {formatDate(event.date)} at {formatTime(event.date)}
                    </p>
                    <p style={styles.eventVenue}>📍 {event.venue}</p>
                    <p style={styles.eventPrice}>💰 ${event.price}</p>
                    <p style={styles.eventTickets}>
                      🎫 {event.ticketsAvailable} tickets available
                    </p>
                    <p style={styles.eventCategory}>
                      🏷️ {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                    </p>
                  </div>

                  <div style={styles.eventDescription}>
                    {event.description?.length > 100 
                      ? `${event.description.substring(0, 100)}...` 
                      : event.description
                    }
                  </div>

                  <div style={styles.eventActions}>
                    <button
                      style={styles.viewButton}
                      onClick={() => navigate(`/events/${event._id}`)}
                    >
                      View Details
                    </button>
                    
                    {event.ticketsAvailable <= 0 && (
                      <span style={styles.soldOut}>Sold Out</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#1e1e2f',
    color: '#fff',
    minHeight: '100vh',
    padding: '2rem',
  },
  hero: {
    textAlign: 'center',
    marginBottom: '3rem',
    padding: '3rem 0',
  },
  title: {
    fontSize: '3rem',
    marginBottom: '1rem',
    color: '#f4a261',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: '1.3rem',
    marginBottom: '2rem',
    color: '#ccc',
  },
  loading: {
    textAlign: 'center',
    padding: '3rem',
    fontSize: '1.2rem',
    color: '#f4a261',
  },
  error: {
    background: '#ff6b6b',
    color: '#fff',
    padding: '1rem',
    borderRadius: '6px',
    marginBottom: '2rem',
    textAlign: 'center',
  },
  eventsSection: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  sectionTitle: {
    fontSize: '2rem',
    marginBottom: '2rem',
    color: '#f4f4f4',
    textAlign: 'center',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    color: '#888',
    fontSize: '1.1rem',
  },
  eventsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '2rem',
  },
  eventCard: {
    background: '#2b2b3f',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'pointer',
  },
  eventCardHover: {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
  },
  eventBanner: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  },
  eventContent: {
    padding: '1.5rem',
  },
  eventTitle: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    color: '#f4f4f4',
  },
  eventInfo: {
    marginBottom: '1rem',
  },
  eventDate: {
    fontSize: '0.9rem',
    color: '#f4a261',
    marginBottom: '0.5rem',
  },
  eventVenue: {
    fontSize: '0.9rem',
    color: '#ccc',
    marginBottom: '0.5rem',
  },
  eventPrice: {
    fontSize: '1rem',
    color: '#51cf66',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
  },
  eventTickets: {
    fontSize: '0.9rem',
    color: '#ccc',
    marginBottom: '0.5rem',
  },
  eventCategory: {
    fontSize: '0.8rem',
    color: '#888',
    marginBottom: '1rem',
  },
  eventDescription: {
    fontSize: '0.9rem',
    color: '#ccc',
    lineHeight: '1.4',
    marginBottom: '1.5rem',
  },
  eventActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewButton: {
    background: '#f4a261',
    color: '#1e1e2f',
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'background-color 0.3s ease',
  },
  soldOut: {
    background: '#ff6b6b',
    color: '#fff',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
  },
};

export default Home;
