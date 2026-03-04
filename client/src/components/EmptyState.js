import React from 'react';

const EmptyState = ({
  title,
  message,
  icon = null,
  actionButton = null,
  containerStyle = {},
}) => (
  <div
    className="flex flex-col items-center justify-center py-12 px-6 text-center text-mutedText max-w-md mx-auto"
    style={containerStyle}
  >
    {icon && <div className="text-5xl mb-6 opacity-60">{icon}</div>}
    {title && <h3 className="heading-3 mb-2">{title}</h3>}
    {message && <p className="body-text small-text mb-8 max-w-md">{message}</p>}
    {actionButton && (
      <button type="button" className="primary-btn" onClick={actionButton.onClick}>
        {actionButton.text}
      </button>
    )}
  </div>
);

export const EmptyStates = {
  events: {
    title: 'No events yet',
    message: 'Be the first to create an amazing event!',
    icon: '🎉',
    actionButton: { text: 'Create Event', onClick: () => (window.location.href = '/dashboard/create') },
  },
  organizerEvents: {
    title: 'No events created yet',
    message: 'Start building your event portfolio by creating your first event.',
    icon: '📅',
    actionButton: { text: 'Create Event', onClick: () => (window.location.href = '/dashboard/create') },
  },
  attendeeEvents: {
    title: 'No events registered',
    message: "You haven't registered for any events yet. Browse our events to get started!",
    icon: '🎫',
    actionButton: { text: 'Browse Events', onClick: () => (window.location.href = '/') },
  },
  searchResults: {
    title: 'No results found',
    message: 'Try adjusting your search criteria or browse all events.',
    icon: '🔍',
    actionButton: { text: 'Browse All Events', onClick: () => (window.location.href = '/') },
  },
  profile: {
    title: 'Profile incomplete',
    message: 'Complete your profile to help others discover your events.',
    icon: '👤',
    actionButton: { text: 'Edit Profile', onClick: () => (window.location.href = '/dashboard/profile') },
  },
  tickets: {
    title: 'No tickets purchased',
    message: "You haven't purchased any tickets yet. Check out our upcoming events!",
    icon: '🎫',
    actionButton: { text: 'Browse Events', onClick: () => (window.location.href = '/') },
  },
};

export default EmptyState;
