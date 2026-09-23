import mongoose from 'mongoose';

export default async function handler(req, res) {
  // Selalu pastikan merespon dengan header JSON
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'DELETE') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method tidak diizinkan' 
    });
  }

  // Cek Environment Variable MongoDB
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    return res.status(500).json({
      success: false,
      message: 'MONGODB_URI belum dipasang di Environment Variables Vercel.'
    });
  }

  // Verifikasi Secret Header
  const clientSecret = req.headers['x-admin-secret'];
  const serverSecret = process.env.ADMIN_SECRET_KEY || 'SangatRahasia123';

  if (clientSecret !== serverSecret) {
    return res.status(401).json({ 
      success: false, 
      message: 'Akses ditolak! Secret key tidak valid.' 
    });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ 
      success: false, 
      message: 'ID pesan tidak ditemukan pada query URL' 
    });
  }

  try {
    // Koneksi Database Safe-Check
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGODB_URI, { bufferCommands: false });
    }

    // Buat Model Pesan
    const PesanSchema = new mongoose.Schema({}, { strict: false, collection: 'pesans' });
    const Pesan = mongoose.models.Pesan || mongoose.model('Pesan', PesanSchema);

    let deletedPesan = null;

    // Hapus via ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      deletedPesan = await Pesan.findByIdAndDelete(id);
    }

    // Fallback jika _id berupa string biasa
    if (!deletedPesan) {
      deletedPesan = await Pesan.findOneAndDelete({ _id: id });
    }

    if (!deletedPesan) {
      return res.status(404).json({ 
        success: false, 
        message: 'Pesan tidak ditemukan di database' 
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Pesan berhasil dihapus' 
    });

  } catch (error) {
    console.error('Error deletepesan:', error);
    return res.status(500).json({ 
      success: false, 
      message: `Database Error: ${error.message}` 
    });
  }
}