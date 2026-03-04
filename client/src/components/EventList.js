import React, { useEffect, useState } from 'react';
import LoadingState from './LoadingState';
import EmptyState, { EmptyStates } from './EmptyState';

function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/events');
        if (!response.ok) throw new Error('Failed to load events');
        const data = await response.json();
        setEvents(data);
      } catch (err) {
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
        <LoadingState message="Loading events..." size="medium" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
        <div className="card-standard text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
      <h2 className="heading-2 text-center mb-8 sm:mb-12">Upcoming Events</h2>

      {events.length === 0 ? (
        <EmptyState {...EmptyStates.events} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {events.map((event) => (
            <div key={event._id} className="card-standard">
              <h3 className="heading-3 mb-2">{event.title}</h3>
              <p className="small-text mb-2">
                {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString()}
              </p>
              <p className="body-text small-text">{event.description || 'No description available'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EventList;
