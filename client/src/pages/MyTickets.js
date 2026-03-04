import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingState from '../components/LoadingState';
import { API_BASE_URL, getAuthToken } from '../config/api';

export default function MyTickets() {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTickets = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/tickets/my-tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch tickets');
      const data = await response.json();
      setTickets(data.tickets || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || userRole !== 'attendee') {
      navigate('/');
      return;
    }
    fetchTickets();
  }, [user, userRole, navigate]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 min-h-[60vh] flex items-center justify-center">
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 text-center">
        <div className="card-standard max-w-md mx-auto">
          <h2 className="heading-2 mb-4">Error Loading Tickets</h2>
          <p className="body-text small-text mb-6">{error}</p>
          <button type="button" className="primary-btn" onClick={fetchTickets}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 text-center">
        <div className="card-standard max-w-md mx-auto">
          <h2 className="heading-2 mb-4">No Tickets Yet</h2>
          <p className="body-text small-text mb-6">You haven&apos;t purchased any event tickets yet.</p>
          <button type="button" className="primary-btn" onClick={() => navigate('/')}>
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  const statusClass = (status) => {
    if (status === 'active') return 'bg-green-100 text-green-800';
    if (status === 'used') return 'bg-gray-100 text-gray-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 sm:px-6">
      <header className="text-center mb-12">
        <h1 className="heading-1 mb-2">My Tickets</h1>
        <p className="body-text small-text text-mutedText">
          You have {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {tickets.map((ticket) => (
          <div key={ticket.ticketId} className="card-standard">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6 pb-4 border-b border-softBorder">
              <h3 className="heading-3 m-0">{ticket.eventTitle}</h3>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold uppercase ${statusClass(ticket.status)}`}
              >
                {ticket.status}
              </span>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="small-text font-semibold text-mutedText">Ticket ID</span>
                <span className="body-text">{ticket.ticketId}</span>
              </div>
              <div className="flex justify-between">
                <span className="small-text font-semibold text-mutedText">Date</span>
                <span className="body-text">{new Date(ticket.eventDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="small-text font-semibold text-mutedText">Location</span>
                <span className="body-text">{ticket.eventLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="small-text font-semibold text-mutedText">Amount</span>
                <span className="body-text">{ticket.currency} {ticket.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="small-text font-semibold text-mutedText">Purchased</span>
                <span className="body-text">{new Date(ticket.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="pt-6 border-t border-softBorder text-center">
              <p className="small-text text-mutedText mb-4">Present this QR code at the event:</p>
              <img
                src={`/api/tickets/${ticket.ticketId}/qr`}
                alt="QR Code"
                className="max-w-[150px] mx-auto border-2 border-softBorder rounded-xl"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
