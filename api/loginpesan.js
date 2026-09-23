import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
  // Header CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method Not Allowed' });

  if (!uri) {
    return res.status(500).json({ success: false, message: 'MONGODB_URI belum terpasang di Vercel.' });
  }

  let client;

  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username dan password wajib diisi!' });
    }

    client = new MongoClient(uri);
    await client.connect();

    const db = client.db('eltri_db');

    // Cari user di collection 'users'
    const user = await db.collection('users').findOne({
      username: username.trim(),
      password: password.trim(),
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Username atau password salah!' });
    }

    return res.status(200).json({ success: true, message: 'Login berhasil!' });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ success: false, message: 'Gagal melakukan login.', error: error.message });
  } finally {
    if (client) await client.close();
  }
}