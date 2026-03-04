import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl, getAuthToken } from '../config/api';
import LoadingState from '../components/LoadingState';

// Inline styles for consistent UI
const styles = {
  page: {
    backgroundColor: 'var(--bg-primary)',
    minHeight: '100vh',
    color: 'var(--text-primary)',
    padding: '2rem',
    display: 'flex',
    justifyContent: 'center',
  },
  container: {
    background: 'var(--bg-secondary)',
    borderRadius: '12px',
    padding: '2rem',
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 4px 10px var(--shadow-primary)',
  },
  heading: {
    fontSize: '2rem',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '2rem',
    color: 'var(--text-accent)',
  },
  profileImage: {
    width: '120px',
    height: '120px',
    objectFit: 'cover',
    borderRadius: '50%',
    border: '3px solid var(--border-accent)',
    display: 'block',
    margin: '0 auto 1.5rem',
  },
  field: {
    fontWeight: '600',
    color: 'var(--text-secondary)',
    marginTop: '1.2rem',
  },
  value: {
    fontWeight: 'bold',
    color: 'var(--text-primary)',
    fontSize: '1.05rem',
    marginBottom: '1rem',
  },
  input: {
    width: '100%',
    padding: '0.6rem',
    borderRadius: '6px',
    background: 'var(--bg-input)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-primary)',
    marginBottom: '1rem',
  },
  button: {
    width: '100%',
    background: 'var(--bg-button)',
    color: 'var(--text-primary)',
    padding: '10px',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '1.5rem',
    transition: '0.3s',
  },
  buttonHover: {
    background: 'var(--bg-button-hover)',
  },
  btnGroup: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  saveBtn: {
    flex: 1,
    background: 'var(--bg-button-success)',
    padding: '10px',
    border: 'none',
    color: 'var(--text-primary)',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: '0.3s',
  },
  cancelBtn: {
    flex: 1,
    background: 'var(--bg-button-secondary)',
    padding: '10px',
    border: 'none',
    color: 'var(--text-accent)',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  error: {
    color: 'var(--text-error)',
    textAlign: 'center',
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: 'var(--bg-card)',
    borderRadius: '8px',
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

  const token = getAuthToken();
  const navigate = useNavigate();

  // 🟢 Fetch organizer profile when component mounts
  useEffect(() => {
    const fetchOrganizer = async () => {
      // If there is no token at all, send user to organizer login
      if (!token) {
        navigate('/organizer/login');
        return;
      }

      try {
        const res = await fetch('/api/organizers/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401 || res.status === 403) {
          // Token invalid or expired: clear auth and send to organizer login
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userData');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('userRole');
          sessionStorage.removeItem('userData');
          navigate('/organizer/login');
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

  if (loading) {
    return (
      <div style={styles.page}>
        <LoadingState 
          message="Loading your profile..." 
          size="large"
          containerStyle={{ minHeight: '60vh' }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.error}>{error}</div>
        </div>
      </div>
    );
  }

  // Safety guard: if organizer data is missing, avoid accessing properties on null
  if (!organizer) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.error}>Profile data is not available. Please try again.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.heading}>Organizer Profile</h2>

        {!editMode ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1.5rem' }}>
              {formData.logo ? (
                <img
                  src={getImageUrl(formData.logo)}
                  alt="Organizer Logo"
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid var(--border-accent)',
                    boxShadow: '0 4px 8px var(--shadow-primary)'
                  }}
                />
              ) : (
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '3px solid var(--border-accent)',
                  fontSize: '3rem',
                  color: 'var(--text-muted)'
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
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
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
                    border: '2px solid var(--border-accent)',
                    boxShadow: '0 2px 6px var(--shadow-primary)'
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
