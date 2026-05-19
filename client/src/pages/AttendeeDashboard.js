import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getImageUrl, API_BASE_URL, getAuthToken } from '../config/api';
import LoadingState from '../components/LoadingState';
import EmptyState, { EmptyStates } from '../components/EmptyState';

export default function AttendeeDashboard() {
  const [attendee, setAttendee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, userRole, logout, clearAuth } = useAuth();

  const loadAttendeeData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/attendees/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401 || response.status === 403) {
        clearAuth();
        navigate('/attendee/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to load attendee data');
      }

      const data = await response.json();
      setAttendee(data);
    } catch (err) {
      console.error('Load attendee data error:', err);
      setError('Failed to load dashboard data. Please login again.');
    } finally {
      setLoading(false);
    }
  }, [clearAuth, navigate]);

  useEffect(() => {
    if (!user || userRole !== 'attendee') {
      navigate('/attendee/login');
      return;
    }
    loadAttendeeData();
  }, [user, userRole, navigate, loadAttendeeData]);

  if (loading) {
    return (
      <div className="ad-page max-w-7xl mx-auto px-4 py-12 sm:py-16 sm:px-6 min-h-[60vh] flex items-center justify-center">
        <LoadingState message="Loading your dashboard..." size="large" containerStyle={{ minHeight: '60vh' }} />
      </div>
    );
  }

  return (
    <div className="ad-page max-w-7xl mx-auto px-4 py-12 sm:py-16 sm:px-6">
      <div className="ad-inner">

        {/* ── Header ── */}
        <header className="ad-header">
          <div>
            <h1 className="ad-welcome">Welcome back, {attendee?.name}!</h1>
            <p className="ad-subtitle">Manage your events and profile</p>
          </div>
          <button type="button" className="ad-logout-btn" onClick={logout}>
            Logout
          </button>
        </header>

        {/* ── Error ── */}
        {error && (
          <div className="ad-alert ad-alert--error">{error}</div>
        )}

        {/* ── Profile Card ── */}
        <section className="ad-section">
          <h2 className="ad-section-title">Profile Information</h2>
          <div className="ad-profile-grid">
            <div className="ad-profile-item">
              <span className="ad-profile-label">Name</span>
              <span className="ad-profile-value">{attendee?.name}</span>
            </div>
            <div className="ad-profile-item">
              <span className="ad-profile-label">Email</span>
              <span className="ad-profile-value">{attendee?.email}</span>
            </div>
            <div className="ad-profile-item">
              <span className="ad-profile-label">Phone</span>
              <span className="ad-profile-value">{attendee?.phone || 'Not provided'}</span>
            </div>
            <div className="ad-profile-item ad-profile-item--accent">
              <span className="ad-profile-label">Events Registered</span>
              <span className="ad-profile-value ad-profile-value--big">{attendee?.registeredEvents?.length || 0}</span>
            </div>
          </div>
        </section>

        {/* ── Quick Actions ── */}
        <section className="ad-actions-card">
          <span className="ad-actions-label">Quick Actions</span>
          <button
            type="button"
            className="ad-btn-primary"
            onClick={() => navigate('/attendee/tickets')}
          >
            🎫 View My Tickets
          </button>
        </section>

        {/* ── Events ── */}
        <section className="ad-section">
          <div className="ad-events-header">
            <h2 className="ad-section-title" style={{ margin: 0 }}>My Events</h2>
            {attendee?.registeredEvents?.length > 0 && (
              <span className="ad-events-count">
                {attendee.registeredEvents.length} registered
              </span>
            )}
          </div>

          {!attendee?.registeredEvents || attendee.registeredEvents.length === 0 ? (
            <EmptyState {...EmptyStates.attendeeEvents} />
          ) : (
            <div className="ad-grid">
              {attendee.registeredEvents.map((registration) => (
                <div key={registration._id} className="ad-card">
                  {registration.event?.banner && (
                    <img
                      src={getImageUrl(registration.event.banner)}
                      alt={registration.event.title}
                      className="ad-card-banner"
                    />
                  )}
                  {!registration.event?.banner && (
                    <div className="ad-card-banner-placeholder">🎟</div>
                  )}

                  <div className="ad-card-body">
                    <div className="ad-card-top">
                      <h3 className="ad-card-title">{registration.event?.title}</h3>
                      <span
                        className={`ad-status-badge ad-status-badge--${registration.status === 'registered' || registration.status === 'attended' || registration.status === 'cancelled' ? registration.status : 'default'}`}
                      >
                        {registration.status
                          ? `${registration.status.charAt(0).toUpperCase()}${registration.status.slice(1)}`
                          : '—'}
                      </span>
                    </div>

                    <div className="ad-card-meta">
                      <p><span className="ad-meta-icon">📅</span>{registration.event?.date ? new Date(registration.event.date).toLocaleDateString() : 'TBD'}</p>
                      <p><span className="ad-meta-icon">🕐</span>{registration.event?.date ? new Date(registration.event.date).toLocaleTimeString() : 'TBD'}</p>
                      <p><span className="ad-meta-icon">📍</span>{registration.event?.venue}</p>
                      <p><span className="ad-meta-icon">💵</span><strong className="ad-price">₦{Number(registration.event?.price ?? 0).toLocaleString()}</strong></p>
                      <p><span className="ad-meta-icon">🗓</span>Registered {new Date(registration.registrationDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <style>{`
        .ad-page {
          min-height: 100vh;
          background-color: var(--bg-primary);
          color: var(--text-primary);
        }
        .ad-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0;
        }

        /* Header */
        .ad-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 32px;
        }
        .ad-welcome {
          margin: 0 0 4px;
          font-size: 26px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.4px;
        }
        .ad-subtitle {
          margin: 0;
          font-size: 13px;
          color: var(--text-muted);
        }
        .ad-logout-btn {
          padding: 9px 20px;
          border-radius: 10px;
          border: 1px solid var(--border-primary);
          background: transparent;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
        }
        .ad-logout-btn:hover {
          border-color: var(--border-accent);
          color: var(--text-accent);
        }

        /* Alert */
        .ad-alert {
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 14px;
          margin-bottom: 20px;
        }
        .ad-alert--error {
          background: rgba(255,107,107,0.1);
          border: 1px solid rgba(255,107,107,0.3);
          color: var(--text-error);
        }

        /* Section */
        .ad-section {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 16px;
          padding: 22px 24px;
          margin-bottom: 20px;
        }
        .ad-section-title {
          margin: 0 0 18px;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }

        /* Profile grid */
        .ad-profile-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
        }
        .ad-profile-item {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .ad-profile-item--accent {
          border-color: var(--border-accent);
          background: rgba(244,162,97,0.06);
        }
        .ad-profile-label {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .ad-profile-value {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          word-break: break-word;
        }
        .ad-profile-value--big {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-accent);
          line-height: 1;
          margin-top: 2px;
        }

        /* Actions card */
        .ad-actions-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 16px;
          padding: 18px 22px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .ad-actions-label {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .ad-btn-primary {
          padding: 10px 20px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, var(--bg-button), var(--bg-button-hover));
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
          box-shadow: 0 2px 10px var(--shadow-accent);
        }
        .ad-btn-primary:hover { opacity: 0.88; }

        /* Events section header */
        .ad-events-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
          flex-wrap: wrap;
          gap: 10px;
        }
        .ad-events-count {
          font-size: 13px;
          color: var(--text-muted);
          background: var(--bg-tertiary);
          border: 1px solid var(--border-primary);
          padding: 3px 12px;
          border-radius: 20px;
          font-weight: 500;
        }

        /* Events grid */
        .ad-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: 18px;
        }

        /* Event card */
        .ad-card {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-primary);
          border-radius: 14px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
        }
        .ad-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 28px var(--shadow-secondary);
          border-color: var(--border-accent);
        }
        .ad-card-banner {
          width: 100%;
          height: 140px;
          object-fit: cover;
        }
        .ad-card-banner-placeholder {
          width: 100%;
          height: 140px;
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 34px;
        }
        .ad-card-body {
          padding: 14px 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .ad-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
        }
        .ad-card-title {
          margin: 0;
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.35;
          flex: 1;
        }
        .ad-status-badge {
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          flex-shrink: 0;
          border: 1px solid transparent;
        }
        /* Badges: rgba fills read on dark + light; text uses theme tokens */
        .ad-status-badge--registered {
          background: rgba(81, 207, 102, 0.14);
          border-color: rgba(81, 207, 102, 0.38);
          color: var(--text-success);
        }
        .ad-status-badge--attended {
          background: rgba(51, 154, 240, 0.14);
          border-color: rgba(51, 154, 240, 0.38);
          color: #339af0;
        }
        [data-theme="light"] .ad-status-badge--attended {
          color: #1d4ed8;
        }
        .ad-status-badge--cancelled {
          background: rgba(255, 107, 107, 0.14);
          border-color: rgba(255, 107, 107, 0.38);
          color: var(--text-error);
        }
        .ad-status-badge--default {
          background: rgba(136, 136, 136, 0.12);
          border-color: rgba(136, 136, 136, 0.35);
          color: var(--text-muted);
        }
        .ad-card-meta {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .ad-card-meta p {
          margin: 0;
          font-size: 13px;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ad-meta-icon {
          width: 18px;
          text-align: center;
          font-size: 13px;
          flex-shrink: 0;
        }
        .ad-price {
          color: var(--text-accent);
          font-weight: 600;
        }

        /* Responsive */
        @media (max-width: 640px) {
          .ad-grid { grid-template-columns: 1fr; }
          .ad-profile-grid { grid-template-columns: 1fr 1fr; }
          .ad-actions-card { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </div>
  );
}
