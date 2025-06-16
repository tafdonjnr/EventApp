import React, { useState, useEffect } from 'react';

export default function EventModal({ open, onClose, initial = {}, onSaved }) {
  const [form, setForm] = useState({
    title: '', description: '', date: '', location: '',
    price: '', ticketsAvailable: ''
  });

  useEffect(() => {
    setForm(prev => ({ ...prev, ...initial }));
  }, [initial]);

  if (!open) return null;

  const token = localStorage.getItem('token');
  const isEdit = Boolean(initial._id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `/api/events/${initial._id}` : '/api/events';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      onSaved();
      onClose();
    } else {
      alert('Error saving event');
    }
  };

  const overlay = {
    position: 'fixed',
    top: 0, left: 0, width: '100vw', height: '100vh',
    background: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(2px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 200,
    animation: 'fadeIn 0.3s ease-in-out',
  };

  const modalContainer = {
    background: '#2b2b3f',
    color: '#fff',
    borderRadius: 12,
    padding: '24px 20px',
    maxWidth: '95%',
    width: '400px',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
    animation: 'slideUp 0.3s ease-out',
  };

  const label = {
    fontSize: '0.9rem',
    marginBottom: 4,
    color: '#ddd',
    fontWeight: 500,
  };

  const input = {
    padding: '10px', borderRadius: 6, border: '1px solid #444',
    background: '#1e1e2f', color: '#fff', fontSize: '1rem',
    marginBottom: 10, width: '100%',
  };

  const btn = {
    background: '#f4a261', border: 'none', padding: '10px 14px',
    borderRadius: 6, fontWeight: 'bold', cursor: 'pointer',
    color: '#1e1e2f', fontSize: '1rem', marginTop: 8,
  };

  // 🔑 Add animations to <style> tag directly in component
  const animations = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;

  return (
    <>
      <style>{animations}</style>
      <div style={overlay} onClick={onClose}>
        <form
          style={modalContainer}
          onClick={(e) => e.stopPropagation()}
          onSubmit={handleSubmit}
        >
          <h2 style={{ textAlign: 'center', marginBottom: 10 }}>
            {isEdit ? 'Edit Event' : 'Create Event'}
          </h2>

          <div>
            <label style={label}>Title</label>
            <input
              style={input}
              type="text"
              value={form.title || ''}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label style={label}>Description</label>
            <textarea
              style={{ ...input, height: 80, resize: 'vertical' }}
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div>
            <label style={label}>Date</label>
            <input
              style={input}
              type="date"
              value={form.date || ''}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>

          <div>
            <label style={label}>Location</label>
            <input
              style={input}
              type="text"
              value={form.location || ''}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>

          <div>
            <label style={label}>Ticket Price (₦)</label>
            <input
              style={input}
              type="number"
              min="0"
              value={form.price || ''}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>

          <div>
            <label style={label}>Tickets Available</label>
            <input
              style={input}
              type="number"
              min="1"
              value={form.ticketsAvailable || ''}
              onChange={(e) => setForm({ ...form, ticketsAvailable: e.target.value })}
            />
          </div>

          <button type="submit" style={btn}>
            {isEdit ? 'Update Event' : 'Create Event'}
          </button>
        </form>
      </div>
    </>
  );
}
