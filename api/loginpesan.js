import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY;

export default async function handler(req, res) {
  // 1. Atur Header Keamanan & CORS
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. Validasi HTTP Method
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  // 3. Validasi Environment Variable
  if (!MONGODB_URI) {
    return res.status(500).json({ success: false, message: 'MONGODB_URI belum terpasang di Vercel.' });
  }

  const { username, password } = req.body || {};

  // Validasi Input Kosong
  if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ success: false, message: 'Username dan password wajib diisi!' });
  }

  const cleanUsername = username.trim();
  const cleanPassword = password.trim();

  try {
    // 4. Reuse Connection Mongoose (Efisien di Vercel Serverless)
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGODB_URI, { bufferCommands: false });
    }

    const db = mongoose.connection.db;

    // 5. Cari User di Collection 'users'
    const user = await db.collection('users').findOne({
      username: cleanUsername,
      password: cleanPassword,
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Username atau password salah!' });
    }

    // 6. Mengembalikan Token Autentikasi (ADMIN_SECRET_KEY) untuk dipasang di Frontend Header
    return res.status(200).json({
      success: true,
      message: 'Login berhasil!',
      token: ADMIN_SECRET_KEY || cleanPassword, // Mengirimkan token rahasia ke frontend LoginPesan.jsx
    });

  } catch (error) {
    console.error('Login Error:', error);
    // Sembunyikan detail stack trace error pada response production demi keamanan
    return res.status(500).json({ success: false, message: 'Gagal melakukan login.' });
  }
}