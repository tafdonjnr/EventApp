import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Inline styles for consistent UI
const styles = {
  page: {
    backgroundColor: '#1e1e2f',
    minHeight: '100vh',
    color: '#fff',
    padding: '2rem',
    display: 'flex',
    justifyContent: 'center',
  },
  container: {
    background: '#2b2b3f',
    borderRadius: '12px',
    padding: '2rem',
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
  },
  heading: {
    fontSize: '2rem',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '2rem',
  },
  profileImage: {
    width: '120px',
    height: '120px',
    objectFit: 'cover',
    borderRadius: '50%',
    border: '3px solid #f4a261',
    display: 'block',
    margin: '0 auto 1.5rem',
  },
  field: {
    fontWeight: '600',
    color: '#f4f4f4',
    marginTop: '1.2rem',
  },
  value: {
    fontWeight: 'bold',
    color: '#e0e0e0',
    fontSize: '1.05rem',
    marginBottom: '1rem',
  },
  input: {
    width: '100%',
    padding: '0.6rem',
    borderRadius: '6px',
    background: '#1e1e2f',
    color: '#fff',
    border: '1px solid #555',
    marginBottom: '1rem',
  },
  button: {
    width: '100%',
    background: '#f4a261',
    color: '#1e1e2f',
    padding: '10px',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '1.5rem',
    transition: '0.3s',
  },
  buttonHover: {
    background: '#e07a3f',
  },
  btnGroup: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  saveBtn: {
    flex: 1,
    background: '#2a9d8f',
    padding: '10px',
    border: 'none',
    color: '#fff',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: '0.3s',
  },
  cancelBtn: {
    flex: 1,
    background: '#aaa',
    padding: '10px',
    border: 'none',
    color: '#1e1e2f',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  error: {
    color: '#ff6b6b',
    textAlign: 'center',
    marginTop: '1rem',
  },
  loading: {
    textAlign: 'center',
    marginTop: '2rem',
  },
};

export default function OrganizerProfile() {
  const [organizer, setOrganizer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    orgName: '',
    email: '',
    logo: '',
    twitter: '',
    instagram: '',
  });

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // 🟢 Fetch organizer profile when component mounts
  useEffect(() => {
    const fetchOrganizer = async () => {
      try {
        const res = await fetch('/api/organizers/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('token');
          navigate('/');
          return;
        }

        const data = await res.json();

        if (!data.organizer) {
          setError('Organizer not found.');
        } else {
          setOrganizer(data.organizer);
          setFormData({
            name: data.organizer.name || '',
            orgName: data.organizer.orgName || '',
            email: data.organizer.email || '',
            logo: data.organizer.logo || '',
            twitter: data.organizer.twitter || '',
            instagram: data.organizer.instagram || '',
          });
        }
      } catch (err) {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizer();
  }, [token, navigate]);

  // 🧹 Clean up preview blob URLs
  useEffect(() => {
    return () => {
      if (
        formData.logo &&
        typeof formData.logo === 'string' &&
        formData.logo.startsWith('blob:')
      ) {
        URL.revokeObjectURL(formData.logo);
      }
    };
  }, [formData.logo]);

  // 🖊️ Handle form input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'logo' && files.length > 0) {
      const file = files[0];
      setLogoFile(file);
      const imageUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, logo: imageUrl }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ✅ Save updated profile
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('orgName', formData.orgName);
      formPayload.append('email', formData.email);
      formPayload.append('twitter', formData.twitter);
      formPayload.append('instagram', formData.instagram);
      if (logoFile) {
        formPayload.append('logo', logoFile);
      }

      const response = await fetch('/api/organizers/profile', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: formPayload,
      });

      const data = await response.json();

      if (response.ok) {
        // Use the response data directly instead of making another API call
        if (data.organizer) {
          setOrganizer(data.organizer);
          setFormData({
            name: data.organizer.name || '',
            orgName: data.organizer.orgName || '',
            email: data.organizer.email || '',
            logo: data.organizer.logo || '',
            twitter: data.organizer.twitter || '',
            instagram: data.organizer.instagram || '',
          });
        }

        setEditMode(false);
        setLogoFile(null);
      } else {
        setError(data.message || 'Failed to update profile.');
      }
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p style={styles.loading}>Loading...</p>;
  if (error) return <p style={styles.error}>{error}</p>;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.heading}>Organizer Profile</h2>

        {!editMode ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1.5rem' }}>
              {formData.logo ? (
                <img
                  src={formData.logo.startsWith('blob:') ? formData.logo : `http://localhost:5000${formData.logo}`}
                  alt="Organizer Logo"
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #f4a261',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                  }}
                />
              ) : (
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  backgroundColor: '#444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '3px solid #f4a261',
                  fontSize: '3rem',
                  color: '#888'
                }}>
                  <i className="fas fa-user" />
                </div>
              )}
            </div>

            {/* Profile Details */}
            <div>
              <div style={styles.field}>Name:</div>
              <div style={styles.value}>{organizer.name || 'N/A'}</div>

              <div style={styles.field}>Organization:</div>
              <div style={styles.value}>{organizer.orgName || 'N/A'}</div>

              <div style={styles.field}>Email:</div>
              <div style={styles.value}>{organizer.email || 'N/A'}</div>

              <div style={styles.field}>Twitter:</div>
              <div style={styles.value}>{organizer.twitter || 'N/A'}</div>

              <div style={styles.field}>Instagram:</div>
              <div style={styles.value}>{organizer.instagram || 'N/A'}</div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setEditMode(true)}
              style={{ ...styles.button, ...(hovering ? styles.buttonHover : {}) }}
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
            >
              Edit Profile
            </button>
          </>
        ) : (
          // ✏️ Editable Form
          <form onSubmit={handleProfileSave}>
            {['name', 'orgName', 'email', 'twitter', 'instagram'].map((field) => (
              <input
                key={field}
                type="text"
                name={field}
                value={formData[field]}
                onChange={handleChange}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                style={styles.input}
              />
            ))}

            {/* Logo Upload */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#f4f4f4', fontWeight: '600' }}>
                Logo Image:
              </label>
              <input
                type="file"
                accept="image/*"
                name="logo"
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            {/* Preview uploaded logo */}
            {formData.logo && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <img 
                  src={formData.logo} 
                  alt="Preview" 
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #f4a261',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                  }} 
                />
              </div>
            )}

            {/* Save and Cancel Buttons */}
            <div style={styles.btnGroup}>
              <button type="submit" style={styles.saveBtn} disabled={submitting}>
                {submitting ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditMode(false);
                  setLogoFile(null);
                  // Clean up any blob URL
                  if (formData.logo && formData.logo.startsWith('blob:')) {
                    URL.revokeObjectURL(formData.logo);
                  }
                  setFormData({
                    name: organizer.name || '',
                    orgName: organizer.orgName || '',
                    email: organizer.email || '',
                    logo: organizer.logo || '',
                    twitter: organizer.twitter || '',
                    instagram: organizer.instagram || '',
                  });
                }}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
