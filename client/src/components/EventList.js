import React, { useEffect, useState } from 'react';

function EventList() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/events')
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Upcoming Events</h2>
      {events.length === 0 ? (
        <p>No events yet.</p>
      ) : (
        <ul>
          {events.map(event => (
            <li key={event._id}>
              <strong>{event.title}</strong> — {new Date(event.date).toLocaleDateString()}
              <p>{event.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default EventList;
