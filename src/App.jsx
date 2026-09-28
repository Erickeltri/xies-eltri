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

    let currentPct = 0;

    // Timer animasi persentase loading
    const timer = setInterval(() => {
      currentPct += Math.floor(Math.random() * 5) + 1; // Naik 1-5% secara acak

      if (currentPct >= 99) {
        currentPct = 99; // Tahan di 99% sampai data selesai di-fetch
      }

      setProgress(currentPct);
    }, 80);

    const fetchGlobalData = async () => {
      const totalLoadingDuration =4500;
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
          clearInterval(timer);
          setProgress(100);
          setIsLoading(false);
        }, remainingTime);
      }
    };

    fetchGlobalData();

    return () => clearInterval(timer);
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