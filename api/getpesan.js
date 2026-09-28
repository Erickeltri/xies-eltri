import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY;

export default async function handler(req, res) {
  // 1. Atur Header Keamanan & CORS
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Tangani Request Preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. Validasi Method (Hanya izinkan GET)
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  // 3. PROTEKSI KEAMANAN: Verifikasi Bearer Token Admin
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

  if (!ADMIN_SECRET_KEY || token !== ADMIN_SECRET_KEY) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak! Token autentikasi tidak valid.'
    });
  }

  // 4. Validasi Environment Variable MongoDB
  if (!MONGODB_URI) {
    return res.status(500).json({
      success: false,
      message: 'MONGODB_URI belum terpasang.'
    });
  }

  try {
    // KONEKSI EFISIEN (Reuse Connection via Mongoose): 
    // Menghindari masalah "Too Many Connections" pada fungsi serverless Vercel
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGODB_URI, { bufferCommands: false });
    }

    const db = mongoose.connection.db;

    // Ambil daftar collection dan secara otomatis cari nama collection pesan ('pesan' atau 'pesans')
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    const targetCollection = collectionNames.find(
      (name) => name === 'pesan' || name === 'pesans' || name.includes('pesan')
    ) || 'pesans';

    const collection = db.collection(targetCollection);

    // Ambil semua pesan, urutkan dari yang terbaru (createdAt: -1)
    const pesanList = await collection.find({}).sort({ createdAt: -1 }).toArray();

    return res.status(200).json({
      success: true,
      data: pesanList,
    });

  } catch (error) {
    console.error('Fetch Pesan Error:', error);
    return res.status(500).json({
      success: false,
      message: `Gagal mengambil data pesan: ${error.message}`
    });
  }
}