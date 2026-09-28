import React from 'react';

export default function Loading({ progress = 0 }) {
  // Menentukan status teks berdasarkan range persentase progress
  const getStatusText = (pct) => {
    if (pct < 15) return 'CONNECTING TO SERVER...';
    if (pct < 35) return 'AUTHENTICATING NETWORK...';
    if (pct < 60) return 'ESTABLISHING SECURE CONNECTION...';
    if (pct < 80) return 'DOWNLOADING PROFILE DATA...';
    if (pct < 99) return 'VERIFYING ENCRYPTION KEYS...';
    if (pct < 100) return 'FINALIZING SYNCHRONIZATION...';
    return 'CONNECTION ESTABLISHED!';
  };

  const isComplete = progress === 100;
  const currentStatus = getStatusText(progress);

  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <img 
          src="/images/logo.png" 
          alt="NERV Logo" 
          className="nerv-logo-large" 
        />

        <div className="server-status-container">
          <p className={`loading-text ${isComplete ? 'complete-glow' : ''}`}>
            {currentStatus}
          </p>
          <div className="progress-bar-bg">
            <div 
              className="progress-bar-fill" 
              style={{ 
                width: `${progress}%`,
                transition: 'width 0.2s ease-out'
              }}
            ></div>
          </div>
          <span className={`progress-percent ${isComplete ? 'complete-glow' : ''}`}>
            {progress}%
          </span>
        </div>
      </div>
    </div>
  );
}