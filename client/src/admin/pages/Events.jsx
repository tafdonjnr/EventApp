import React, { useState, useEffect, useCallback } from 'react';
import { adminFetch } from '../../config/api';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminFetch(
        `/api/admin/events?page=${currentPage}&status=${filterStatus}&search=${searchTerm}`
      );
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterStatus, searchTerm]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchEvents();
  };

  const handleEventAction = async (eventId, action) => {
    try {
      const response = await adminFetch(`/api/admin/events/${eventId}/${action}`, {
        method: 'POST',
      });
      if (response.ok) fetchEvents();
    } catch (error) {
      console.error(`Error ${action} event:`, error);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const eventDate = new Date(event.date);
    
    if (eventDate < now) return 'past';
    if (event.ticketsAvailable === 0) return 'sold-out';
    if (eventDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) return 'upcoming';
    return 'active';
  };

  if (loading) {
    return (
      <div className="events-loading">
        <div className="loading-spinner">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="admin-events">
      <div className="page-header">
        <h1>Event Management</h1>
        <p>Manage all events in the system</p>
      </div>

      {/* Search and Filters */}
      <div className="filters-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search events by title or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">Search</button>
        </form>

        <div className="filter-controls">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
            <option value="sold-out">Sold Out</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="events-table-container">
        <table className="events-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Organizer</th>
              <th>Date & Time</th>
              <th>Location</th>
              <th>Tickets</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event._id}>
                <td className="event-info">
                  <div className="event-image">
                    {event.image ? (
                      <img src={event.image} alt={event.title} />
                    ) : (
                      <div className="event-placeholder">🎉</div>
                    )}
                  </div>
                  <div className="event-details">
                    <p className="event-title">{event.title}</p>
                    <p className="event-price">₦{event.price}</p>
                  </div>
                </td>
                <td>
                  <span className="organizer-name">
                    {event.organizer?.name || 'Unknown'}
                  </span>
                </td>
                <td>
                  <div className="event-datetime">
                    <p className="event-date">
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                    <p className="event-time">
                      {new Date(event.date).toLocaleTimeString()}
                    </p>
                  </div>
                </td>
                <td>{event.location}</td>
                <td>
                  <div className="ticket-info">
                    <span className="available">{event.ticketsAvailable} available</span>
                    <span className="total">/ {event.totalTickets} total</span>
                  </div>
                </td>
                <td>
                  <span className={`status-badge status-${getEventStatus(event)}`}>
                    {getEventStatus(event)}
                  </span>
                </td>
                <td className="actions">
                  <button
                    onClick={() => handleEventAction(event._id, 'approve')}
                    className="action-btn approve"
                    disabled={event.status === 'approved'}
                  >
                    {event.status === 'approved' ? 'Approved' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleEventAction(event._id, 'reject')}
                    className="action-btn reject"
                    disabled={event.status === 'rejected'}
                  >
                    {event.status === 'rejected' ? 'Rejected' : 'Reject'}
                  </button>
                  <button
                    onClick={() => handleEventAction(event._id, 'suspend')}
                    className="action-btn suspend"
                    disabled={event.status === 'suspended'}
                  >
                    {event.status === 'suspended' ? 'Suspended' : 'Suspend'}
                  </button>
                  <button
                    onClick={() => handleEventAction(event._id, 'delete')}
                    className="action-btn delete"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="page-btn"
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`page-btn ${currentPage === page ? 'active' : ''}`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="page-btn"
          >
            Next
          </button>
        </div>
      )}

      {events.length === 0 && (
        <div className="no-events">
          <p>No events found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Events;
