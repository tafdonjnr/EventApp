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
      <div className="dashboard-loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-number">{stats.totalUsers}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎉</div>
          <div className="stat-content">
            <h3>Total Events</h3>
            <p className="stat-number">{stats.totalEvents}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p className="stat-number">₦{stats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Active Events</h3>
            <p className="stat-number">{stats.activeEvents}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/admin/users" className="action-btn">
            <span className="action-icon">👥</span>
            Manage Users
          </Link>
          <Link to="/admin/events" className="action-btn">
            <span className="action-icon">🎉</span>
            Manage Events
          </Link>
          <Link to="/admin/transactions" className="action-btn">
            <span className="action-icon">💰</span>
            View Transactions
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <div className="activity-section">
          <h2>Recent Transactions</h2>
          <div className="activity-list">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <div key={transaction._id} className="activity-item">
                  <div className="activity-icon">💰</div>
                  <div className="activity-details">
                    <p className="activity-title">
                      Payment of ₦{transaction.amount} for {transaction.metadata?.eventTitle}
                    </p>
                    <p className="activity-meta">
                      {new Date(transaction.createdAt).toLocaleDateString()} • {transaction.status}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-activity">No recent transactions</p>
            )}
          </div>
        </div>

        <div className="activity-section">
          <h2>Recent Events</h2>
          <div className="activity-list">
            {recentEvents.length > 0 ? (
              recentEvents.map((event) => (
                <div key={event._id} className="activity-item">
                  <div className="activity-icon">🎉</div>
                  <div className="activity-details">
                    <p className="activity-title">{event.title}</p>
                    <p className="activity-meta">
                      {new Date(event.date).toLocaleDateString()} • {event.location}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-activity">No recent events</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
