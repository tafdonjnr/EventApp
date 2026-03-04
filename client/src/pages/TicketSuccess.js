import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingState from '../components/LoadingState';
import { API_BASE_URL, getAuthToken } from '../config/api';

const TicketSuccess = () => {
  const { ref } = useParams();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTicketData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // First verify the payment
      const verifyResponse = await fetch(`/api/payments/verify/${ref}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!verifyResponse.ok) {
        throw new Error('Failed to verify payment');
      }

      const paymentData = await verifyResponse.json();
      
      if (paymentData.status !== 'success') {
        throw new Error('Payment not successful');
      }

      // Get the ticket details
      const ticketResponse = await fetch(`${API_BASE_URL}/api/tickets/my-tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!ticketResponse.ok) {
        throw new Error('Failed to fetch ticket');
      }

      const ticketData = await ticketResponse.json();
      
      // Find the ticket for this transaction
      const foundTicket = ticketData.tickets.find(t => 
        t.transactionId === paymentData.transactionId
      );

      if (foundTicket) {
        setTicket(foundTicket);
      } else {
        throw new Error('Ticket not found');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [ref]);

  useEffect(() => {
    if (!user || userRole !== 'attendee') {
      navigate('/attendee/login');
      return;
    }

    if (ref) {
      fetchTicketData();
    }
  }, [user, userRole, navigate, ref, fetchTicketData]);

  if (loading) {
    return <LoadingState message="Loading your ticket..." />;
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <h2 style={styles.errorTitle}>Error Loading Ticket</h2>
          <p style={styles.errorMessage}>{error}</p>
          <button 
            onClick={() => navigate('/attendee/dashboard')}
            style={styles.button}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <h2 style={styles.errorTitle}>Ticket Not Found</h2>
          <p style={styles.errorMessage}>Unable to find your ticket. Please check your dashboard.</p>
          <button 
            onClick={() => navigate('/attendee/dashboard')}
            style={styles.button}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.successHeader}>
        <div style={styles.successIcon}>🎉</div>
        <h1 style={styles.title}>Payment Successful!</h1>
        <p style={styles.subtitle}>Your ticket has been generated successfully</p>
      </div>

      <div style={styles.ticketContainer}>
        <div style={styles.ticketCard}>
          <div style={styles.ticketHeader}>
            <h2 style={styles.eventTitle}>{ticket.eventTitle}</h2>
            <span style={styles.status}>Active</span>
          </div>

          <div style={styles.ticketDetails}>
            <div style={styles.detailRow}>
              <span style={styles.label}>Ticket ID:</span>
              <span style={styles.value}>{ticket.ticketId}</span>
            </div>
            
            <div style={styles.detailRow}>
              <span style={styles.label}>Event Date:</span>
              <span style={styles.value}>
                {new Date(ticket.eventDate).toLocaleDateString()}
              </span>
            </div>
            
            <div style={styles.detailRow}>
              <span style={styles.label}>Location:</span>
              <span style={styles.value}>{ticket.eventLocation}</span>
            </div>
            
            <div style={styles.detailRow}>
              <span style={styles.label}>Amount Paid:</span>
              <span style={styles.value}>
                {ticket.currency} {ticket.amount}
              </span>
            </div>
            
            <div style={styles.detailRow}>
              <span style={styles.label}>Purchase Date:</span>
              <span style={styles.value}>
                {new Date(ticket.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div style={styles.qrSection}>
            <h3 style={styles.qrTitle}>Your QR Code</h3>
            <p style={styles.qrText}>Present this QR code at the event entrance</p>
            <div style={styles.qrContainer}>
              <img 
                src={`/api/tickets/${ticket.ticketId}/qr`} 
                alt="QR Code" 
                style={styles.qrCode}
              />
            </div>
            <p style={styles.qrNote}>Keep this ticket safe and easily accessible</p>
          </div>
        </div>
      </div>

      <div style={styles.actions}>
        <button 
          onClick={() => navigate('/attendee/tickets')}
          style={styles.secondaryButton}
        >
          View All Tickets
        </button>
        <button 
          onClick={() => navigate('/')}
          style={styles.primaryButton}
        >
          Browse More Events
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    padding: '20px',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  successHeader: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  successIcon: {
    fontSize: '4rem',
    marginBottom: '20px'
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '10px',
    color: 'var(--text-primary)'
  },
  subtitle: {
    fontSize: '1.2rem',
    color: 'var(--text-secondary)'
  },
  ticketContainer: {
    maxWidth: '600px',
    width: '100%',
    marginBottom: '40px'
  },
  ticketCard: {
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '16px',
    padding: '30px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    border: '2px solid var(--border-color)'
  },
  ticketHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    paddingBottom: '20px',
    borderBottom: '2px solid var(--border-color)'
  },
  eventTitle: {
    fontSize: '1.6rem',
    margin: 0,
    color: 'var(--text-primary)',
    flex: 1
  },
  status: {
    backgroundColor: '#10b981',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  ticketDetails: {
    marginBottom: '30px'
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '15px',
    padding: '10px 0'
  },
  label: {
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  value: {
    color: 'var(--text-primary)',
    fontWeight: '500'
  },
  qrSection: {
    textAlign: 'center',
    paddingTop: '25px',
    borderTop: '2px solid var(--border-color)'
  },
  qrTitle: {
    fontSize: '1.3rem',
    marginBottom: '15px',
    color: 'var(--text-primary)'
  },
  qrText: {
    marginBottom: '20px',
    color: 'var(--text-secondary)',
    fontSize: '1rem'
  },
  qrContainer: {
    marginBottom: '20px'
  },
  qrCode: {
    maxWidth: '200px',
    border: '3px solid var(--border-color)',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
  },
  qrNote: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    fontStyle: 'italic'
  },
  actions: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  primaryButton: {
    backgroundColor: 'var(--accent-color)',
    color: 'white',
    border: 'none',
    padding: '14px 28px',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  secondaryButton: {
    backgroundColor: 'var(--bg-button)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
    padding: '14px 28px',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  button: {
    backgroundColor: 'var(--accent-color)',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  errorContainer: {
    textAlign: 'center',
    padding: '60px 20px',
    maxWidth: '500px'
  },
  errorTitle: {
    fontSize: '2rem',
    marginBottom: '20px',
    color: 'var(--text-primary)'
  },
  errorMessage: {
    fontSize: '1.1rem',
    marginBottom: '30px',
    color: 'var(--text-secondary)'
  }
};

export default TicketSuccess;
