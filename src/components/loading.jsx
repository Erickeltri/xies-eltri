import React, { useState, useEffect } from 'react';

export default function Loading({ progress = 0 }) {
  const [status, setStatus] = useState('CONNECTING TO SERVER...');

  useEffect(() => {
    const t1 = setTimeout(() => setStatus('AUTHENTICATING NETWORK...'), 800);
    const t2 = setTimeout(() => setStatus('ESTABLISHING SECURE CONNECTION...'), 1600);
    const t3 = setTimeout(() => setStatus('DOWNLOADING PROFILE DATA...'), 2500);
    const t4 = setTimeout(() => setStatus('VERIFYING ENCRYPTION KEYS...'), 3400);
    const t5 = setTimeout(() => setStatus('FINALIZING SYNCHRONIZATION...'), 4200);
    const t6 = setTimeout(() => setStatus('CONNECTION ESTABLISHED!'), 4750);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, []);

  const isComplete = progress === 100;

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
            {status}
          </p>
          <div className="progress-bar-bg">
            <div 
              className="progress-bar-fill" 
              style={{ 
                width: `${progress}%`,
                transition: 'width 0.6s cubic-bezier(0.25, 1, 0.5, 1)'
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