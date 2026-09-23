import React from 'react';
import Lightbox from '../components/Lightbox';

const educationList = [
  { 
    logo: '/images/logo/smk-placeholder.png', 
    label: 'SMK XXX XXX',
    href: 'https://maps.google.com'
  },
  { 
    logo: '/images/logo/smp.jpg', 
    label: 'SLB/SMP Katolik Rajawali',
    href: 'https://maps.app.goo.gl/grFvF9Fv8jFkG8ic7'
  },
  { 
    logo: '/images/logo/sd.png', 
    label: 'SLB/SD Katolik Rajawali',
    href: 'https://maps.app.goo.gl/1wveMBJXLBRjdnmQ8'
  },
];

export default function Profile() {
  return (
    <main className="profile-main">
      <div className="profile-container">
        
        {/* Kolom Kiri */}
        <div className="profile-left">
          <div className="profile-logo">
            <img src="/images/profile.jpg" alt="Logo" />
          </div>
          
          <div className="profile-name">
            ELTRI PUTRA ROMBEBUA
          </div>
          
          <div className="profile-education-title">
            <svg className="education-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
            </svg>
            <span>Riwayat Pendidikan</span>
          </div>

          <div className="profile-education">
            <ul>
              {educationList.map((item, index) => (
                <li key={index} className="education-item">
                  <div className="logo-cell">
                    <img className="school-logo" src={item.logo} alt={item.label} />
                  </div>
                  <div className="text-cell">
                    <div className="school-name">{item.label}</div>
                    <a 
                      href={item.href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="location-btn"
                    >
                      <svg className="location-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      Lokasi Lihat
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Kolom Kanan */}
        <div className="profile-right">
          {/* Jendela Kode */}
          <div className="code-window">
            <div className="code-window-header">
              <div className="window-dots">
                <span className="dot dot-red"></span>
                <span className="dot dot-yellow"></span>
                <span className="dot dot-green"></span>
              </div>
              <div className="window-badge">
                <img src="/images/favicon.svg" alt="Badge" />
              </div>
            </div>
            <div className="code-window-body">
              <pre>
                <code>
                  <span className="code-keyword">const</span> profile = {'{\n'}
                  {'  '}name: <span className="code-string">"Eltri Putra Rombebua"</span>,\n
                  {'  '}role: <span className="code-string">"Developer"</span>\n
                  {'}'};
                </code>
              </pre>
            </div>
          </div>

          {/* Kotak Foto 1 */}
          <Lightbox type="image" src="/images/ITS.jpg" alt="Foto 1">
            <div className="photo-card">
              <img src="/images/ITS.jpg" alt="Foto 1" />
            </div>
          </Lightbox>

        </div>

      </div>
    </main>
  ); 
}