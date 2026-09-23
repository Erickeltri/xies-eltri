import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Loading from './components/loading.jsx';

import Home from './pages/Home';
import About from './pages/About';
import Profile from './pages/Profile';
import Alamat from './pages/Alamat';
import LoginPesan from './pages/LoginPesan';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [progress, setProgress] = useState(0);

  // Ambil lokasi URL saat ini
  const location = useLocation();

  useEffect(() => {
    // Pesan Kustom Console NERV Theme
    console.log(
      '%c I LOVE U / ELTRI     %c System Status: ONLINE ',
      'font-size: 14px; font-weight: bold; color: #ff3333; text-shadow: 0 0 8px #ff3333; padding: 6px;',
      'font-size: 12px; color: #00ff66; padding: 6px;'
    );

    console.log(
      '%c"System operational. Developed with love by Eltri Putra Rombebua."%c',
      'color: #00ff66; font-style: italic; font-size: 11px; font-family: monospace;',
      ''
    );
    
    // Tahapan persentase jaringan
    const networkSteps = [
      { pct: 1, delay: 10 },
      { pct: 3, delay: 20 },
      { pct: 5, delay: 30 },
      { pct: 6, delay: 40 },
      { pct: 8, delay: 50 },
      { pct: 9, delay: 60 },
      { pct: 10, delay: 70 },
      { pct: 12, delay: 90 },
      { pct: 15, delay: 100 },
      { pct: 18, delay: 200 },
      { pct: 20, delay: 300 },
      { pct: 30, delay: 800 },
      { pct: 34, delay: 900 },
      { pct: 39, delay: 920 },
      { pct: 40, delay: 1020 },
      { pct: 47, delay: 1220 },
      { pct: 49, delay: 1320 },
      { pct: 50, delay: 1600 },
      { pct: 54, delay: 1700 },
      { pct: 63, delay: 1800 },
      { pct: 64, delay: 2000 },
      { pct: 68, delay: 2200 },
      { pct: 70, delay: 2500 },
      { pct: 72, delay: 2600 },
      { pct: 74, delay: 2600 },
      { pct: 78, delay: 2700 },
      { pct: 79, delay: 2800 },
      { pct: 80, delay: 3400 },
      { pct: 82, delay: 3500 },
      { pct: 84, delay: 3600 },
      { pct: 86, delay: 3700 },
      { pct: 88, delay: 3800 },
      { pct: 89, delay: 3900 },
      { pct: 90, delay: 4100 },
      { pct: 91, delay: 4200 },
      { pct: 93, delay: 4300 },
      { pct: 95, delay: 4400 },
      { pct: 96, delay: 4400 },
      { pct: 97, delay: 4400 },
      { pct: 98, delay: 4400 },
      { pct: 99, delay: 4500 },
      { pct: 100, delay: 4750 }
    ];

    const totalLoadingDuration = 10000;

    const timeouts = networkSteps.map(step => 
      setTimeout(() => setProgress(step.pct), step.delay)
    );

    const fetchGlobalData = async () => {
      const startTime = Date.now();

      try {
        setIsLoading(true);
        const response = await fetch('https://api.github.com/users/eltriputrarb-bit');
        
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          console.warn(`GitHub API Info (${response.status}): Menggunakan data profil bawaan.`);
        }
      } catch (error) {
        console.error("Gagal terhubung ke server:", error);
      } finally {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, totalLoadingDuration - elapsedTime);

        setTimeout(() => {
          setIsLoading(false);
        }, remainingTime);
      }
    };

    fetchGlobalData();

    return () => timeouts.forEach(t => clearTimeout(t));
  }, []);

  return (
    <>
      {isLoading && <Loading progress={progress} />}

      {/* Tampilkan Header HANYA jika jalurnya BUKAN /loginpesan */}
      {location.pathname !== '/loginpesan' && <Header />}

      <Routes>
        <Route path="/" element={<Home userData={userData} />} />
        <Route path="/about" element={<About />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/alamat" element={<Alamat />} />
        <Route path="/loginpesan" element={<LoginPesan />} />
      </Routes>
    </>
  );
}