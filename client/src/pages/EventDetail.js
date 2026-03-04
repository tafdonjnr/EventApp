import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getImageUrl, API_BASE_URL, getAuthToken } from '../config/api';
import LoadingState from '../components/LoadingState';

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
        const response = await fetch(`${API_BASE_URL}/api/events/${id}`);
        
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
      const token = getAuthToken();
      if (!token) {
        navigate('/attendee/login');
        return;
      }

      const initRes = await fetch(`${API_BASE_URL}/api/payments/initiate`, {
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
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 min-h-[60vh] flex items-center justify-center">
        <LoadingState message="Loading event details..." size="large" containerStyle={{ minHeight: '60vh' }} />
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
        <div className="card-standard mb-6 text-red-600">{error}</div>
        <button type="button" className="secondary-btn" onClick={() => navigate('/')}>← Back to Events</button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
        <div className="card-standard mb-6 text-red-600">Event not found</div>
        <button type="button" className="secondary-btn" onClick={() => navigate('/')}>← Back to Events</button>
      </div>
    );
  }

  const isSoldOut = event.ticketsAvailable <= 0;
  const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
  const canRegister = !isRegistered && !isSoldOut && userRole === 'attendee';

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 sm:px-6">
      <button type="button" className="secondary-btn mb-6" onClick={() => navigate('/')}>← Back to Events</button>
      {error && <div className="card-standard mb-6 text-red-600 border-red-200 bg-red-50">{error}</div>}
      {message && <div className="card-standard mb-6 text-green-700 border-green-200 bg-green-50">{message}</div>}

      <div className="card-standard p-0 overflow-hidden max-w-4xl mx-auto">
        {event.banner && (
          <img src={getImageUrl(event.banner)} alt={event.title} className="w-full h-56 sm:h-72 object-cover" />
        )}
        <div className="p-6 sm:p-8">
          <h1 className="heading-1 mb-2">{event.title}</h1>
          <p className="body-text small-text italic mb-8">Organized by {event.organizer?.orgName || 'Unknown Organizer'}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="card-standard">
              <div className="small-text uppercase tracking-wider text-mutedText mb-1">Date & Time</div>
              <div className="body-text font-semibold">{formatDate(event.date)}<br />{formatTime(event.date)}</div>
            </div>
            <div className="card-standard">
              <div className="small-text uppercase tracking-wider text-mutedText mb-1">Venue</div>
              <div className="body-text font-semibold">{event.venue}</div>
            </div>
            <div className="card-standard">
              <div className="small-text uppercase tracking-wider text-mutedText mb-1">Category</div>
              <div className="body-text font-semibold">
                <span className="inline-block px-3 py-1 rounded-full bg-primaryStart/20 text-primaryText text-sm font-semibold uppercase">{event.category}</span>
              </div>
            </div>
            <div className="card-standard">
              <div className="small-text uppercase tracking-wider text-mutedText mb-1">Ticket Price</div>
              <div className="heading-3 text-green-600">${event.price}</div>
            </div>
          </div>
          <div className="mb-8">
            <h3 className="heading-3 mb-2">About This Event</h3>
            <p className="body-text">{event.description}</p>
          </div>
          <div className="card-standard border-t border-softBorder rounded-t-none flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="small-text">{isSoldOut ? 'Sold Out' : `${event.ticketsAvailable} tickets available`}</div>
            <div className="flex flex-wrap gap-2">
              {canRegister && <button type="button" className="primary-btn" onClick={handleRegister}>Register for Event</button>}
              {isRegistered && <span className="body-text font-semibold text-green-600">✓ Registered</span>}
              {!userRole && <button type="button" className="primary-btn" onClick={() => navigate('/attendee/login')}>Login to Register</button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
