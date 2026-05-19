import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminFetch } from '../../config/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    pendingTransactions: 0,
    activeEvents: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard statistics
      const statsResponse = await adminFetch('/api/admin/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch recent transactions
      const transactionsResponse = await adminFetch('/api/admin/transactions/recent');
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setRecentTransactions(transactionsData);
      }

      // Fetch recent events
      const eventsResponse = await adminFetch('/api/admin/events/recent');
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setRecentEvents(eventsData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dash-page dash-page--loading">
        <div className="dash-loading-spinner">Loading...</div>
        <style>{dashStyles}</style>
      </div>
    );
  }

  return (
    <div className="dash-page">
      {/* Stats Overview */}
      <div className="dash-stats-grid">
        <div className="dash-stat-card dash-stat-card--users">
          <div className="dash-stat-icon">👥</div>
          <div className="dash-stat-content">
            <h3 className="dash-stat-label">Total Users</h3>
            <p className="dash-stat-number">{stats.totalUsers}</p>
          </div>
        </div>

        <div className="dash-stat-card dash-stat-card--events">
          <div className="dash-stat-icon">🎉</div>
          <div className="dash-stat-content">
            <h3 className="dash-stat-label">Total Events</h3>
            <p className="dash-stat-number">{stats.totalEvents}</p>
          </div>
        </div>

        <div className="dash-stat-card dash-stat-card--revenue">
          <div className="dash-stat-icon">💰</div>
          <div className="dash-stat-content">
            <h3 className="dash-stat-label">Total Revenue</h3>
            <p className="dash-stat-number">₦{stats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="dash-stat-card dash-stat-card--active">
          <div className="dash-stat-icon">📊</div>
          <div className="dash-stat-content">
            <h3 className="dash-stat-label">Active Events</h3>
            <p className="dash-stat-number">{stats.activeEvents}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <section className="dash-actions-card">
        <h2 className="dash-section-title">Quick Actions</h2>
        <div className="dash-action-buttons">
          <Link to="/admin/users" className="dash-action-btn">
            <span className="dash-action-icon">👥</span>
            Manage Users
          </Link>
          <Link to="/admin/events" className="dash-action-btn">
            <span className="dash-action-icon">🎉</span>
            Manage Events
          </Link>
          <Link to="/admin/transactions" className="dash-action-btn">
            <span className="dash-action-icon">💰</span>
            View Transactions
          </Link>
        </div>
      </section>

      {/* Recent Activity */}
      <div className="dash-activity-row">
        <section className="dash-activity-card">
          <h2 className="dash-section-title">Recent Transactions</h2>
          <div className="dash-activity-list">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <div key={transaction._id} className="dash-activity-item">
                  <div className="dash-activity-icon">💰</div>
                  <div className="dash-activity-details">
                    <p className="dash-activity-title">
                      Payment of ₦{transaction.amount} for {transaction.metadata?.eventTitle}
                    </p>
                    <p className="dash-activity-meta">
                      {new Date(transaction.createdAt).toLocaleDateString()} • {transaction.status}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="dash-no-activity">No recent transactions</p>
            )}
          </div>
        </section>

        <section className="dash-activity-card">
          <h2 className="dash-section-title">Recent Events</h2>
          <div className="dash-activity-list">
            {recentEvents.length > 0 ? (
              recentEvents.map((event) => (
                <div key={event._id} className="dash-activity-item">
                  <div className="dash-activity-icon">🎉</div>
                  <div className="dash-activity-details">
                    <p className="dash-activity-title">{event.title}</p>
                    <p className="dash-activity-meta">
                      {new Date(event.date).toLocaleDateString()} • {event.location}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="dash-no-activity">No recent events</p>
            )}
          </div>
        </section>
      </div>

      <style>{dashStyles}</style>
    </div>
  );
};

const dashStyles = `
  .dash-page {
    min-height: 100vh;
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 24px;
    background-color: var(--bg-primary);
    color: var(--text-primary);
  }

  .dash-page--loading {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dash-loading-spinner {
    font-size: 1.1rem;
    color: var(--text-accent);
    font-weight: 500;
  }

  /* Stats grid */
  .dash-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 18px;
    margin-bottom: 24px;
  }

  .dash-stat-card {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 14px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: 16px;
    padding: 20px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .dash-stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px var(--shadow-primary);
  }

  .dash-stat-icon {
    width: 46px;
    height: 46px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    flex-shrink: 0;
  }

  .dash-stat-card--users .dash-stat-icon {
    background: rgba(51, 154, 240, 0.15);
  }

  .dash-stat-card--events .dash-stat-icon {
    background: rgba(244, 162, 97, 0.15);
  }

  .dash-stat-card--revenue .dash-stat-icon {
    background: rgba(81, 207, 102, 0.15);
  }

  .dash-stat-card--active .dash-stat-icon {
    background: rgba(204, 93, 232, 0.15);
  }

  .dash-stat-content {
    flex: 1;
    min-width: 0;
  }

  .dash-stat-label {
    margin: 0 0 4px;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  .dash-stat-number {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.2;
  }

  .dash-stat-card--users .dash-stat-number { color: #339af0; }
  .dash-stat-card--events .dash-stat-number { color: #f4a261; }
  .dash-stat-card--revenue .dash-stat-number { color: #51cf66; }
  .dash-stat-card--active .dash-stat-number { color: #cc5de8; }

  /* Quick actions */
  .dash-actions-card {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: 16px;
    padding: 18px 22px;
    margin-bottom: 24px;
  }

  .dash-section-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .dash-action-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .dash-action-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    border-radius: 10px;
    border: none;
    background: linear-gradient(135deg, var(--bg-button), var(--bg-button-hover));
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    box-shadow: 0 2px 10px var(--shadow-accent);
    transition: opacity 0.2s ease;
  }

  .dash-action-btn:hover {
    opacity: 0.9;
    color: #fff;
  }

  .dash-action-icon {
    font-size: 16px;
  }

  /* Recent activity */
  .dash-activity-row {
    display: flex;
    flex-direction: row;
    gap: 20px;
    align-items: flex-start;
  }

  .dash-activity-card {
    flex: 1;
    min-width: 0;
    background: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: 16px;
    padding: 22px;
  }

  .dash-activity-card .dash-section-title {
    margin-bottom: 16px;
  }

  .dash-activity-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .dash-activity-item {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 12px;
    background: var(--bg-tertiary);
    border-radius: 10px;
    padding: 12px;
  }

  .dash-activity-icon {
    font-size: 18px;
    flex-shrink: 0;
    line-height: 1.4;
  }

  .dash-activity-details {
    flex: 1;
    min-width: 0;
  }

  .dash-activity-title {
    margin: 0 0 4px;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
    line-height: 1.4;
  }

  .dash-activity-meta {
    margin: 0;
    font-size: 12px;
    color: var(--text-muted);
  }

  .dash-no-activity {
    margin: 0;
    font-size: 13px;
    color: var(--text-muted);
    text-align: center;
    padding: 16px 0;
  }

  @media (max-width: 768px) {
    .dash-page {
      padding: 28px 16px;
    }

    .dash-actions-card {
      flex-direction: column;
      align-items: flex-start;
    }

    .dash-activity-row {
      flex-direction: column;
    }
  }
`;

export default Dashboard;
