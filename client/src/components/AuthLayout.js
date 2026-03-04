import React from 'react';
import VerseLoader from './VerseLoader';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="card-standard w-full max-w-md flex flex-col items-center">
        <VerseLoader />
        {children}
      </div>
    </div>
  );
}
