import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY;

export default async function handler(req, res) {
  // 1. Header Keamanan & CORS
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Tangani Preflight OPTIONS Request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. Validasi HTTP Method (Hanya izinkan DELETE)
  if (req.method !== 'DELETE') {
    return res.status(405).json({ success: false, message: 'Method tidak diizinkan' });
  }

  // 3. Proteksi Autentikasi Menggunakan Bearer Token / Query Param
  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
  const tokenFromQuery = req.query.key || req.query.pass;

  const clientToken = tokenFromHeader || tokenFromQuery;

  if (!ADMIN_SECRET_KEY || clientToken !== ADMIN_SECRET_KEY) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak! Token autentikasi tidak valid.'
    });
  }

  // 4. Validasi MONGODB_URI
  if (!MONGODB_URI) {
    return res.status(500).json({
      success: false,
      message: 'MONGODB_URI belum dikonfigurasi.'
    });
  }

  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGODB_URI, { bufferCommands: false });
    }

    const db = mongoose.connection.db;
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ success: false, message: 'ID pesan tidak ditemukan' });
    }

    // Ambil semua daftar collection di database
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    // Cari collection yang sesuai ('pesan' atau 'pesans')
    const targetCollection = collectionNames.find(
      (name) => name === 'pesan' || name === 'pesans' || name.includes('pesan')
    ) || 'pesans';

    const collection = db.collection(targetCollection);

    let filter = [];

    // Jika format id adalah ObjectId valid (24 hex)
    if (mongoose.Types.ObjectId.isValid(id)) {
      filter.push({ _id: new mongoose.Types.ObjectId(id) });
    }

    // Fallback jika _id atau id disimpan sebagai string
    filter.push({ _id: id });
    filter.push({ id: id });

    // Eksekusi penghapusan
    const deleteResult = await collection.findOneAndDelete({ $or: filter });

    if (!deleteResult) {
      return res.status(404).json({
        success: false,
        message: `Pesan dengan ID ${id} tidak ditemukan`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Pesan berhasil dihapus'
    });

  } catch (error) {
    console.error('API Delete Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error saat menghapus pesan.'
    });
  }
}