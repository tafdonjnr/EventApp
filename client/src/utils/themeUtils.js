// Theme utility functions

// Common theme-aware styles
export const themeStyles = {
  // Background colors
  bgPrimary: { backgroundColor: 'var(--bg-primary)' },
  bgSecondary: { backgroundColor: 'var(--bg-secondary)' },
  bgTertiary: { backgroundColor: 'var(--bg-tertiary)' },
  bgCard: { backgroundColor: 'var(--bg-card)' },
  bgInput: { backgroundColor: 'var(--bg-input)' },
  
  // Text colors
  textPrimary: { color: 'var(--text-primary)' },
  textSecondary: { color: 'var(--text-secondary)' },
  textMuted: { color: 'var(--text-muted)' },
  textAccent: { color: 'var(--text-accent)' },
  textError: { color: 'var(--text-error)' },
  textSuccess: { color: 'var(--text-success)' },
  
  // Button styles
  buttonPrimary: {
    backgroundColor: 'var(--bg-button)',
    color: 'var(--text-primary)',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.25s ease',
  },
  buttonSecondary: {
    backgroundColor: 'var(--bg-button-secondary)',
    color: 'var(--text-accent)',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.25s ease',
  },
  buttonDanger: {
    backgroundColor: 'var(--bg-button-danger)',
    color: 'var(--text-primary)',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.25s ease',
  },
  buttonSuccess: {
    backgroundColor: 'var(--bg-button-success)',
    color: 'var(--text-primary)',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.25s ease',
  },
  
  // Input styles
  input: {
    width: '100%',
    padding: '12px 14px',
    marginBottom: '1.2rem',
    borderRadius: '8px',
    border: '2px solid transparent',
    backgroundColor: 'var(--bg-input)',
    color: 'var(--text-primary)',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border 0.25s ease, box-shadow 0.25s ease',
    fontFamily: 'inherit',
  },
  inputFocus: {
    borderColor: 'var(--border-accent)',
    boxShadow: '0 0 8px var(--shadow-accent)',
  },
  
  // Card styles
  card: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1rem',
    boxShadow: '0 4px 10px var(--shadow-primary)',
    border: '1px solid var(--border-primary)',
  },
  
  // Section styles
  section: {
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem',
    boxShadow: '0 4px 10px var(--shadow-primary)',
  },
  
  // Page styles
  page: {
    backgroundColor: 'var(--bg-primary)',
    minHeight: '100vh',
    color: 'var(--text-primary)',
    padding: '2rem',
  },
};

// Helper function to merge theme styles with custom styles
export const mergeThemeStyles = (themeStyle, customStyle = {}) => {
  return { ...themeStyle, ...customStyle };
};

// Helper function to create hover effects
export const createHoverEffect = (baseStyle, hoverStyle) => {
  return {
    ...baseStyle,
    ':hover': hoverStyle,
  };
};

// Common hover effects
export const hoverEffects = {
  buttonPrimary: {
    backgroundColor: 'var(--bg-button-hover)',
  },
  buttonSecondary: {
    backgroundColor: 'var(--bg-tertiary)',
  },
  link: {
    color: 'var(--text-accent)',
    textDecoration: 'underline',
  },
};

// Status colors
export const statusColors = {
  registered: {
    backgroundColor: 'var(--bg-button-success)',
    color: 'var(--text-primary)',
  },
  attended: {
    backgroundColor: 'var(--bg-button-info)',
    color: 'var(--text-primary)',
  },
  cancelled: {
    backgroundColor: 'var(--bg-button-danger)',
    color: 'var(--text-primary)',
  },
};
