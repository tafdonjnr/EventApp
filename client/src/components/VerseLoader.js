import React from 'react';
import './VerseLoader.css';

export default function VerseLoader() {
  return (
    <div className="verse-loader">
      {['V', 'e', 'r', 's', 'e'].map((c, i) => (
        <span key={i} className="verse-letter" style={{ animationDelay: `${i * 0.14}s` }}>
          {c}
        </span>
      ))}
    </div>
  );
}
