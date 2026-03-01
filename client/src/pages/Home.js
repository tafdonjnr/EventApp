import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../config/api';
import LoadingState from '../components/LoadingState';
import EmptyState, { EmptyStates } from '../components/EmptyState';

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
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingState message="Loading events..." size="large" containerStyle={{ minHeight: '60vh' }} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 sm:px-6">
      <div className="text-center mb-12 sm:mb-16 py-8 sm:py-12">
        <h1 className="heading-1 mb-4">Welcome to EventVerse</h1>
        <p className="body-text text-mutedText">Discover and register for amazing events</p>
      </div>

      {error && (
        <div className="card-standard mb-8 text-center text-red-600 bg-red-50 border-red-200">
          {error}
        </div>
      )}

      <section className="max-w-7xl mx-auto">
        <h2 className="heading-2 text-center mb-8 sm:mb-12">Upcoming Events</h2>

        {events.length === 0 ? (
          <EmptyState {...EmptyStates.events} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {events.map((event) => (
              <article key={event._id} className="card-standard overflow-hidden p-0 flex flex-col">
                {event.banner && (
                  <img
                    src={getImageUrl(event.banner)}
                    alt={event.title}
                    className="w-full h-48 sm:h-52 object-cover"
                  />
                )}
                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  <h3 className="heading-3 mb-3">{event.title}</h3>
                  <div className="space-y-1 mb-3">
                    <p className="small-text">📅 {formatDate(event.date)} at {formatTime(event.date)}</p>
                    <p className="small-text">📍 {event.venue}</p>
                    <p className="small-text font-semibold text-green-600">💰 ${event.price}</p>
                    <p className="small-text">🎫 {event.ticketsAvailable} tickets available</p>
                    <p className="small-text">🏷️ {event.category?.charAt(0).toUpperCase() + event.category?.slice(1)}</p>
                  </div>
                  <p className="body-text small-text flex-1 mb-4">
                    {event.description?.length > 100 ? `${event.description.substring(0, 100)}...` : event.description}
                  </p>
                  <div className="flex justify-between items-center gap-2 mt-auto">
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => navigate(`/events/${event._id}`)}
                    >
                      View Details
                    </button>
                    {event.ticketsAvailable <= 0 && (
                      <span className="secondary-btn opacity-80 cursor-default">Sold Out</span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
