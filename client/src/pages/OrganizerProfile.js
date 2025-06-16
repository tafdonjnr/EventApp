import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Inline styles object for the component UI
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
  // State for organizer profile data
  const [organizer, setOrganizer] = useState(null);
  // Loading state while fetching profile
  const [loading, setLoading] = useState(true);
  // Error message state
  const [error, setError] = useState('');
  // Edit mode toggle
  const [editMode, setEditMode] = useState(false);
  // Hover state for the edit button styling
  const [hovering, setHovering] = useState(false);
  // State to store the selected logo file before upload
  const [logoFile, setLogoFile] = useState(null);
  // Submitting state to disable form during update
  const [submitting, setSubmitting] = useState(false);

  // Form fields state
  const [formData, setFormData] = useState({
    name: '',
    orgName: '',
    email: '',
    logo: '',
    twitter: '',
    instagram: '',
  });

  // Get token from localStorage for auth
  const token = localStorage.getItem('token');
  // useNavigate hook to redirect user
  const navigate = useNavigate();

  // Fetch organizer profile on component mount
  useEffect(() => {
    const fetchOrganizer = async () => {
      try {
        // Fetch organizer data from API with auth header
        const res = await fetch('/api/organizers/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // If unauthorized, remove token and redirect to home/login
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('token');
          navigate('/');
          return;
        }

        const data = await res.json();

        if (!data.organizer) {
          setError('Organizer not found.');
        } else {
          // Set organizer state and populate form fields
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
        console.error('Error fetching profile:', err);
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizer();
  }, [token, navigate]);

  // Cleanup to revoke object URL when logo preview changes
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

  // Handle input changes, including file input for logo
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'logo' && files.length > 0) {
      // If a logo file is selected, create an object URL for preview
      const file = files[0];
      setLogoFile(file);
      const imageUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, logo: imageUrl }));
    } else {
      // Update normal text inputs
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle form submit for profile update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Prepare form data to send (including file)
      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('orgName', formData.orgName);
      formPayload.append('email', formData.email);
      formPayload.append('twitter', formData.twitter);
      formPayload.append('instagram', formData.instagram);

      if (logoFile) {
        formPayload.append('logo', logoFile);
      }

      // Send PUT request to update profile
      const response = await fetch('/api/organizers/profile', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          // Note: Do NOT set Content-Type here when sending FormData, browser sets it automatically
        },
        body: formPayload,
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error('Server error. Please try again later.');
      }

      if (response.ok) {
        // Update local state with updated profile, reset edit mode and logoFile
        setOrganizer(data.updatedOrganizer || formData);
        setEditMode(false);
        setLogoFile(null);
      } else {
        setError(data.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError(err.message || 'An error occurred while updating.');
    } finally {
      setSubmitting(false);
    }
  };

  // Render loading state
  if (loading) return <p style={styles.loading}>Loading...</p>;
  // Render error state
  if (error) return <p style={styles.error}>{error}</p>;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.heading}>Organizer Profile</h2>

        {!editMode ? (
          <>
            {/* Show profile logo or default */}
            <img
              src={organizer.logo || '/default-logo.png'}
              alt="Logo"
              style={styles.profileImage}
            />
            <div>
              {/* Display profile fields */}
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

            {/* Button to switch to edit mode */}
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
          // Edit form mode
          <form onSubmit={handleSubmit}>
            {/* Render text inputs for editable fields */}
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

            {/* File input for logo */}
            <input
              type="file"
              accept="image/*"
              name="logo"
              onChange={handleChange}
              style={styles.input}
            />

            {/* Preview logo image if available */}
            {formData.logo && (
              <img src={formData.logo} alt="Preview" style={styles.profileImage} />
            )}

            {/* Buttons for save and cancel */}
            <div style={styles.btnGroup}>
              <button type="submit" style={styles.saveBtn} disabled={submitting}>
                {submitting ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => {
                  // Cancel editing: reset form data to original profile and clear logoFile
                  setEditMode(false);
                  setLogoFile(null);
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
