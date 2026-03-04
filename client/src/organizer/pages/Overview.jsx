import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import LoadingState from '../../components/LoadingState';

const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

const Overview = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const orgName = user?.orgName || 'Your Organization';
  const [analytics, setAnalytics] = useState({
    totalEvents: 0,
    ticketsSold: 0,
    totalRevenue: 0,
    upcomingEvents: 0,
    revenueOverTime: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = getToken();
        const res = await fetch('/api/organizers/analytics', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load analytics');
        const data = await res.json();
        setAnalytics({
          totalEvents: data?.totalEvents ?? 0,
          ticketsSold: data?.ticketsSold ?? 0,
          totalRevenue: data?.totalRevenue ?? 0,
          upcomingEvents: data?.upcomingEvents ?? 0,
          revenueOverTime: Array.isArray(data?.revenueOverTime) ? data.revenueOverTime : [],
        });
      } catch (err) {
        setError(err.message || 'Could not load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const stats = [
    { label: 'Total Events', value: analytics?.totalEvents ?? 0, icon: '🎉' },
    { label: 'Tickets Sold', value: analytics?.ticketsSold ?? 0, icon: '🎫' },
    {
      label: 'Revenue (₦)',
      value: (analytics?.totalRevenue ?? 0).toLocaleString(),
      icon: '💰',
    },
    { label: 'Upcoming Events', value: analytics?.upcomingEvents ?? 0, icon: '📅' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 py-6 sm:px-6 sm:py-12 md:py-16">
      <h1 className="heading-1 mb-2 text-xl sm:text-2xl md:text-3xl">Welcome back, {orgName}!</h1>
      <p className="body-text small-text text-mutedText mb-6 sm:mb-8">
        Manage your events and profile
      </p>

      {/* Analytics Section */}
      <section className="mb-6 sm:mb-8">
        <h2 className="heading-3 mb-4 text-lg sm:text-xl">Analytics</h2>
        {loading ? (
          <LoadingState message="Loading analytics..." size="small" />
        ) : error ? (
          <p className="body-text small-text text-red-500">{error}</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 mb-6 sm:mb-8">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4"
                  style={{
                    background: 'linear-gradient(135deg, #93A5CF 0%, #E4EFE9 100%)',
                    border: '1px solid rgba(147,165,207,0.3)',
                  }}
                >
                  <span className="text-2xl sm:text-3xl" aria-hidden="true">
                    {s.icon}
                  </span>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">{s.label}</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
            {analytics?.revenueOverTime?.length > 0 && (
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <div className="min-w-[320px] sm:min-w-0 p-4 sm:p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
                  <h3 className="heading-3 mb-4 text-base sm:text-lg">Revenue Over Time</h3>
                  <div className="h-48 sm:h-64 w-full min-w-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.revenueOverTime}>
                        <defs>
                          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#93A5CF" stopOpacity={0.6} />
                            <stop offset="100%" stopColor="#E4EFE9" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 10 }}
                          tickFormatter={(v) => (v ? v.slice(5) : '')}
                        />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₦${v}`} />
                        <Tooltip
                          formatter={(v) => [`₦${Number(v).toLocaleString()}`, 'Revenue']}
                          labelFormatter={(v) => v}
                          contentStyle={{
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="amount"
                          stroke="#93A5CF"
                          fill="url(#revenueGradient)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Quick Actions */}
      <section
        className="card-standard mb-8 p-4 sm:p-6"
        style={{ border: '1px solid var(--border-color)' }}
      >
        <h2 className="heading-3 mb-4 text-lg sm:text-xl">Quick Actions</h2>
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
          <button
            type="button"
            className="primary-btn w-full sm:w-auto"
            onClick={() => navigate('/dashboard/create')}
          >
            Create New Event
          </button>
          <button
            type="button"
            className="secondary-btn w-full sm:w-auto"
            onClick={() => navigate('/dashboard/events')}
          >
            My Events
          </button>
          <button
            type="button"
            className="secondary-btn w-full sm:w-auto"
            onClick={() => navigate('/dashboard/profile')}
          >
            My Profile
          </button>
        </div>
      </section>
    </div>
  );
};

export default Overview;
