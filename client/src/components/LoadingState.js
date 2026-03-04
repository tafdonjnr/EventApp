import React from 'react';
import VerseLoader from './VerseLoader';

const sizeMap = {
  small: 'text-2xl mb-2',
  medium: 'text-4xl mb-6',
  large: 'text-5xl mb-8',
};

const LoadingState = ({
  message = 'Loading...',
  size = 'medium',
  showVerseLoader = true,
  containerStyle = {},
}) => (
  <div
    className="flex flex-col items-center justify-center py-8 px-4 text-center text-primaryText"
    style={containerStyle}
  >
    {showVerseLoader && <div className={sizeMap[size]}><VerseLoader /></div>}
    {message && <p className="body-text small-text mt-4">{message}</p>}
  </div>
);

export default LoadingState;
