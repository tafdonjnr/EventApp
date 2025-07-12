import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function CreateEvent() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    price: '',
    ticketsAvailable: '',
    category: 'general',
  });
  
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem('token');

  const fetchEventData = useCallback(async () => {
    try {
      const response = await fetch(`/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const event = await response.json();
        setFormData({
          title: event.title || '',
          description: event.description || '',
          date: event.date ? event.date.split('T')[0] : '',
          time: event.date ? event.date.split('T')[1]?.substring(0, 5) : '',
          venue: event.venue || '',
          price: event.price || '',
          ticketsAvailable: event.ticketsAvailable || '',
          category: event.category || 'general',
        });
        
        if (event.banner) {
          setBannerPreview(`http://localhost:5000${event.banner}`);
        }
      }
    } catch (err) {
      setError('Failed to load event data');
    }
  }, [id, token]);

  useEffect(() => {
    if (!token) {
      navigate('/organizer/login');
      return;
    }

    // If editing, fetch event data
    if (id) {
      setIsEdit(true);
      fetchEventData();
    }
  }, [id, token, navigate, fetchEventData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setBannerPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted!');
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Creating FormData...');
      const formPayload = new FormData();
      formPayload.append('title', formData.title);
      formPayload.append('description', formData.description);
      formPayload.append('date', `${formData.date}T${formData.time}`);
      formPayload.append('venue', formData.venue);
      formPayload.append('price', formData.price);
      formPayload.append('ticketsAvailable', formData.ticketsAvailable);
      formPayload.append('category', formData.category);
      
      if (bannerFile) {
        formPayload.append('banner', bannerFile);
        console.log('Banner file added:', bannerFile.name);
      }

      const url = isEdit ? `/api/events/${id}` : '/api/events';
      const method = isEdit ? 'PUT' : 'POST';
      
      console.log('Making request to:', url, 'with method:', method);
      console.log('Token:', token ? 'Present' : 'Missing');

      const response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formPayload,
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        setSuccess(isEdit ? 'Event updated successfully!' : 'Event created successfully!');
        setTimeout(() => {
          navigate('/organizer/dashboard');
        }, 2000);
      } else {
        setError(data.message || 'Failed to save event');
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'music', label: 'Music' },
    { value: 'sports', label: 'Sports' },
    { value: 'business', label: 'Business' },
    { value: 'technology', label: 'Technology' },
    { value: 'arts', label: 'Arts & Culture' },
    { value: 'food', label: 'Food & Drink' },
    { value: 'education', label: 'Education' },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>
          {isEdit ? 'Edit Event' : 'Create New Event'}
        </h1>
        
        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Basic Information */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Event Information</h3>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Event Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter event title"
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your event..."
                style={styles.textarea}
                rows="4"
                required
              />
            </div>

            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  style={styles.select}
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Venue *</label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleInputChange}
                  placeholder="Event location"
                  style={styles.input}
                  required
                />
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Date & Time</h3>
            
            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Date *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Time *</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </div>
            </div>
          </div>

          {/* Ticket Information */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Ticket Information</h3>
            
            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Ticket Price ($) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Available Tickets *</label>
                <input
                  type="number"
                  name="ticketsAvailable"
                  value={formData.ticketsAvailable}
                  onChange={handleInputChange}
                  placeholder="100"
                  min="1"
                  style={styles.input}
                  required
                />
              </div>
            </div>
          </div>

          {/* Banner Image */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Event Banner (Optional)</h3>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Upload Banner Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerChange}
                style={styles.fileInput}
              />
              <p style={styles.helpText}>
                Recommended size: 1200x400px. Max file size: 5MB
              </p>
            </div>

            {bannerPreview && (
              <div style={styles.previewContainer}>
                <label style={styles.label}>Preview:</label>
                <img
                  src={bannerPreview}
                  alt="Banner preview"
                  style={styles.bannerPreview}
                />
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div style={styles.buttonGroup}>
            <button
              type="button"
              onClick={() => navigate('/organizer/dashboard')}
              style={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={styles.submitButton}
            >
              {loading ? 'Saving...' : (isEdit ? 'Update Event' : 'Create Event')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    backgroundColor: '#1e1e2f',
    minHeight: '100vh',
    color: '#fff',
    padding: '2rem',
  },
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    background: '#2b2b3f',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '2rem',
    color: '#f4a261',
  },
  form: {
    width: '100%',
  },
  section: {
    marginBottom: '2rem',
    padding: '1.5rem',
    background: '#1e1e2f',
    borderRadius: '8px',
  },
  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#f4a261',
  },
  inputGroup: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '600',
    color: '#f4f4f4',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '6px',
    background: '#2b2b3f',
    color: '#fff',
    border: '1px solid #555',
    fontSize: '1rem',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '6px',
    background: '#2b2b3f',
    color: '#fff',
    border: '1px solid #555',
    fontSize: '1rem',
    resize: 'vertical',
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '6px',
    background: '#2b2b3f',
    color: '#fff',
    border: '1px solid #555',
    fontSize: '1rem',
  },
  fileInput: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '6px',
    background: '#2b2b3f',
    color: '#fff',
    border: '1px solid #555',
    fontSize: '1rem',
  },
  helpText: {
    fontSize: '0.9rem',
    color: '#888',
    marginTop: '0.5rem',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  previewContainer: {
    marginTop: '1rem',
  },
  bannerPreview: {
    width: '100%',
    maxHeight: '200px',
    objectFit: 'cover',
    borderRadius: '6px',
    border: '1px solid #555',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    marginTop: '2rem',
  },
  submitButton: {
    background: '#f4a261',
    color: '#1e1e2f',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  cancelButton: {
    background: '#666',
    color: '#fff',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  error: {
    background: '#ff6b6b',
    color: '#fff',
    padding: '1rem',
    borderRadius: '6px',
    marginBottom: '1rem',
    textAlign: 'center',
  },
  success: {
    background: '#51cf66',
    color: '#fff',
    padding: '1rem',
    borderRadius: '6px',
    marginBottom: '1rem',
    textAlign: 'center',
  },
}; 