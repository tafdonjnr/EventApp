import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getImageUrl, API_BASE_URL, getAuthToken } from '../config/api';
import LoadingState from '../components/LoadingState';
import EmptyState, { EmptyStates } from '../components/EmptyState';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

/* ─── Inline styles (no new CSS file needed) ─── */
const S = {
  page: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  inner: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '40px 24px 64px',
  },

  /* Header */
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 36,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 14 },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    objectFit: 'cover',
    border: '2px solid var(--border-accent)',
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 12,
    border: '2px solid var(--border-accent)',
    boxSizing: 'border-box',
    background: 'linear-gradient(135deg, var(--bg-button), var(--bg-button-hover))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
  },
  orgName: {
    fontSize: 26,
    fontWeight: 700,
    color: 'var(--text-primary)',
    letterSpacing: '-0.5px',
  },
  subtitle: { fontSize: 13, color: 'var(--text-muted)', marginTop: 2 },
  logoutBtn: {
    padding: '9px 20px',
    borderRadius: 10,
    border: '1px solid var(--border-primary)',
    background: 'transparent',
    color: 'var(--text-secondary)',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  /* Stats row */
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
    marginBottom: 28,
  },
  statCard: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-primary)',
    borderRadius: 16,
    padding: '20px 22px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  statIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    flexShrink: 0,
  },
  statLabel: { fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 },

  /* Chart card */
  chartCard: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-primary)',
    borderRadius: 16,
    padding: '24px',
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: 20,
  },

  /* Actions card */
  actionsCard: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-primary)',
    borderRadius: 16,
    padding: '22px 24px',
    marginBottom: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionBtns: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  primaryBtn: {
    padding: '10px 20px',
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(135deg, var(--bg-button), var(--bg-button-hover))',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    transition: 'opacity 0.2s, transform 0.15s',
    boxShadow: '0 2px 14px var(--shadow-accent)',
  },
  secondaryBtn: {
    padding: '10px 20px',
    borderRadius: 10,
    border: '1px solid var(--border-primary)',
    background: 'var(--bg-tertiary)',
    color: 'var(--text-secondary)',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    transition: 'all 0.2s',
  },

  /* Divider */
  divider: { border: 'none', borderTop: '1px solid var(--border-primary)', margin: '4px 0 28px' },

  /* Events section header */
  eventsHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 10,
  },
  eventsCount: {
    fontSize: 13,
    color: 'var(--text-muted)',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-primary)',
    padding: '3px 12px',
    borderRadius: 20,
    fontWeight: 500,
  },

  /* Event cards grid */
  eventsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
    gap: 20,
  },
  eventCard: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-primary)',
    borderRadius: 16,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
  },
  eventBanner: { width: '100%', height: 148, objectFit: 'cover' },
  bannerPlaceholder: {
    width: '100%',
    height: 148,
    background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 36,
  },
  eventBody: { padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column' },
  eventTitle: { fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12, lineHeight: 1.35 },
  eventMeta: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 },
  metaRow: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' },
  metaIcon: { fontSize: 14, width: 18, textAlign: 'center', flexShrink: 0 },
  ticketsBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    fontWeight: 500,
    padding: '3px 10px',
    borderRadius: 20,
    marginBottom: 14,
    width: 'fit-content',
  },
  cardActions: { display: 'flex', gap: 8, marginTop: 'auto' },
  editBtn: {
    flex: 1,
    padding: '9px 0',
    borderRadius: 9,
    border: '1px solid var(--border-accent)',
    background: 'transparent',
    color: 'var(--text-accent)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  deleteBtn: {
    flex: 1,
    padding: '9px 0',
    borderRadius: 9,
    border: '1px solid var(--text-error)',
    background: 'transparent',
    color: 'var(--text-error)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  /* Alerts */
  alertError: {
    padding: '12px 16px',
    borderRadius: 10,
    background: 'rgba(255,107,107,0.1)',
    border: '1px solid rgba(255,107,107,0.3)',
    color: 'var(--text-error)',
    fontSize: 14,
    marginBottom: 20,
  },
  alertSuccess: {
    padding: '12px 16px',
    borderRadius: 10,
    background: 'rgba(81,207,102,0.1)',
    border: '1px solid rgba(81,207,102,0.3)',
    color: 'var(--text-success)',
    fontSize: 14,
    marginBottom: 20,
  },

  /* Custom tooltip */
  tooltipBox: {
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-primary)',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13,
    color: 'var(--text-primary)',
  },
};

/* ─── Derived stats from events array ─── */
function computeStats(events) {
  const totalEvents = events.length;
  const totalTickets = events.reduce((s, e) => s + (e.ticketsSold || 0), 0);
  const totalRevenue = events.reduce((s, e) => s + ((e.ticketsSold || 0) * (e.price || 0)), 0);
  const upcomingEvents = events.filter((e) => new Date(e.date) > new Date()).length;
  return { totalEvents, totalTickets, totalRevenue, upcomingEvents };
}

/* Build a simple 6-month sales sparkline from events */
function buildChartData(events) {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      name: d.toLocaleString('default', { month: 'short' }),
      year: d.getFullYear(),
      month: d.getMonth(),
      revenue: 0,
      tickets: 0,
    });
  }
  events.forEach((ev) => {
    const evDate = new Date(ev.date);
    const slot = months.find(
      (m) => m.month === evDate.getMonth() && m.year === evDate.getFullYear()
    );
    if (slot) {
      slot.tickets += ev.ticketsSold || 0;
      slot.revenue += (ev.ticketsSold || 0) * (ev.price || 0);
    }
  });
  return months;
}

/* ─── Custom chart tooltip ─── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={S.tooltipBox}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.color }}>
          {p.dataKey === 'revenue' ? `₦${p.value.toLocaleString()}` : `${p.value} tickets`}
        </div>
      ))}
    </div>
  );
}

/* ─── Stat card ─── */
function StatCard({ icon, label, value, accent }) {
  return (
    <div
      style={S.statCard}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 10px 28px var(--shadow-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ ...S.statIconWrap, background: accent + '22', color: accent }}>
        {icon}
      </div>
      <div>
        <div style={S.statLabel}>{label}</div>
        <div style={S.statValue}>{value}</div>
      </div>
    </div>
  );
}

/* ─── Tickets availability badge ─── */
function TicketsBadge({ available, sold }) {
  const pct = available > 0 ? Math.round((sold / (sold + available)) * 100) : 100;
  const color = pct >= 90 ? '#ff6b6b' : pct >= 60 ? '#f4a261' : '#51cf66';
  return (
    <span style={{ ...S.ticketsBadge, background: color + '1a', color }}>
      🎟 {available} left · {pct}% sold
    </span>
  );
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
export default function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orgName, setOrgName] = useState('');
  const [logo, setLogo] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { user, userRole, logout } = useAuth();

  useEffect(() => {
    if (!user || userRole !== 'organizer') {
      navigate('/organizer/login');
    }
  }, [user, userRole, navigate]);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(t);
    }
  }, [message]);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/api/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) { logout(); return; }
      if (!res.ok) throw new Error('Failed to load dashboard data');
      const allEvents = await res.json();
      const organizerEvents = allEvents.filter(
        (ev) => ev.organizer && ev.organizer._id === user?.id
      );
      setOrgName(user?.orgName || 'Your Organization');
      setLogo(user?.logo || '');
      setEvents(organizerEvents.sort((a, b) => new Date(a.date) - new Date(b.date)));
    } catch {
      setError('Failed to load dashboard. Please login again.');
    } finally {
      setLoading(false);
    }
  }, [user, logout]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/api/events/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Delete failed');
      setMessage('Event deleted successfully.');
      loadEvents();
    } catch {
      setError('Failed to delete event.');
    }
  };

  if (loading) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <LoadingState message="Loading your dashboard..." size="large" />
      </div>
    );
  }

  const stats = computeStats(events);
  const chartData = buildChartData(events);

  return (
    <div style={S.page}>
      <div style={S.inner}>

        {/* ── Header ── */}
        <header style={S.header}>
          <div style={S.headerLeft}>
            {logo
              ? <img src={logo} alt="Logo" style={S.logo} />
              : <div style={S.logoPlaceholder}>🎪</div>
            }
            <div>
              <div style={S.orgName}>{orgName}</div>
              <div style={S.subtitle}>Organizer Dashboard</div>
            </div>
          </div>
          <button
            style={S.logoutBtn}
            onClick={logout}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-accent)'; e.currentTarget.style.color = 'var(--text-accent)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            Logout
          </button>
        </header>

        {/* ── Alerts ── */}
        {error && <div style={S.alertError}>⚠️ {error}</div>}
        {message && <div style={S.alertSuccess}>✓ {message}</div>}

        {/* ── Stats ── */}
        <div style={S.statsRow}>
          <StatCard icon="🎉" label="Total Events" value={stats.totalEvents} accent="#f4a261" />
          <StatCard icon="📅" label="Upcoming" value={stats.upcomingEvents} accent="#339af0" />
          <StatCard icon="🎟" label="Tickets Sold" value={stats.totalTickets.toLocaleString()} accent="#cc5de8" />
          <StatCard icon="₦" label="Est. Revenue" value={`₦${stats.totalRevenue.toLocaleString()}`} accent="#51cf66" />
        </div>

        {/* ── Revenue Chart ── */}
        <div style={S.chartCard}>
          <div style={S.sectionTitle}>Revenue Overview — Last 6 Months</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f4a261" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f4a261" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ticketsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#339af0" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#339af0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" opacity={0.35} />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#f4a261" strokeWidth={2} fill="url(#revenueGrad)" />
              <Area type="monotone" dataKey="tickets" stroke="#339af0" strokeWidth={2} fill="url(#ticketsGrad)" />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 20, marginTop: 12, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 24, height: 2, background: '#f4a261', borderRadius: 2, display: 'inline-block' }} />
              Revenue (₦)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 24, height: 2, background: '#339af0', borderRadius: 2, display: 'inline-block' }} />
              Tickets sold
            </span>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div style={S.actionsCard}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Quick Actions</div>
          <div style={S.actionBtns}>
            <button
              style={S.primaryBtn}
              onClick={() => navigate('/organizer/create-event')}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <span>＋</span> Create Event
            </button>
            <button
              style={S.secondaryBtn}
              onClick={() => navigate('/admin')}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-accent)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              📊 Admin Panel
            </button>
          </div>
        </div>

        <hr style={S.divider} />

        {/* ── Events Grid ── */}
        <div style={S.eventsHeader}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Your Events</div>
          <span style={S.eventsCount}>{events.length} event{events.length !== 1 ? 's' : ''}</span>
        </div>

        {events.length === 0 ? (
          <EmptyState {...EmptyStates.organizerEvents} />
        ) : (
          <div style={S.eventsGrid}>
            {events.map((ev) => (
              <EventCard
                key={ev._id}
                ev={ev}
                onEdit={() => navigate(`/organizer/edit-event/${ev._id}`)}
                onDelete={() => handleDelete(ev._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Event Card sub-component ─── */
function EventCard({ ev, onEdit, onDelete }) {
  const dateObj = new Date(ev.date);
  const isPast = dateObj < new Date();

  return (
    <div
      style={S.eventCard}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 12px 32px var(--shadow-secondary)';
        e.currentTarget.style.borderColor = 'var(--border-accent)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'var(--border-primary)';
      }}
    >
      {ev.banner
        ? <img src={getImageUrl(ev.banner)} alt={ev.title} style={S.eventBanner} />
        : <div style={S.bannerPlaceholder}>🎪</div>
      }

      {/* Past event overlay tag */}
      {isPast && (
        <div style={{ background: 'rgba(0,0,0,0.55)', padding: '4px 10px', fontSize: 11, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: 'center' }}>
          Past Event
        </div>
      )}

      <div style={S.eventBody}>
        <div style={S.eventTitle}>{ev.title}</div>
        <div style={S.eventMeta}>
          <div style={S.metaRow}><span style={S.metaIcon}>📅</span>{dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
          <div style={S.metaRow}><span style={S.metaIcon}>🕐</span>{dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</div>
          <div style={S.metaRow}><span style={S.metaIcon}>📍</span><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.venue}</span></div>
          <div style={S.metaRow}><span style={S.metaIcon}>🏷</span>{ev.category}</div>
          <div style={S.metaRow}><span style={S.metaIcon}>💵</span><strong style={{ color: 'var(--text-accent)' }}>₦{Number(ev.price).toLocaleString()}</strong></div>
        </div>

        <TicketsBadge available={ev.ticketsAvailable || 0} sold={ev.ticketsSold || 0} />

        <div style={S.cardActions}>
          <button
            style={S.editBtn}
            onClick={onEdit}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(244,162,97,0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            Edit
          </button>
          <button
            style={S.deleteBtn}
            onClick={onDelete}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,107,107,0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
