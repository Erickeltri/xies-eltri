import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'DELETE') {
    return res.status(405).json({ success: false, message: 'Method tidak diizinkan' });
  }

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

    // Mengabaikan pluralisasi otomatis agar cocok dengan collection 'pesan' atau 'pesans'
    const db = mongoose.connection.db;
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ success: false, message: 'ID pesan tidak ditemukan' });
    }

    // Ambil semua daftar collection yang ada di database untuk pencarian fleksibel
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    // Prioritaskan nama collection yang kemungkinan besar digunakan
    const targetCollection = collectionNames.find(
      (name) => name === 'pesan' || name === 'pesans' || name.includes('pesan')
    ) || 'pesans';

    const collection = db.collection(targetCollection);

    let filter = [];

    // Jika id adalah format ObjectId yang valid (24 hex characters)
    if (mongoose.Types.ObjectId.isValid(id)) {
      filter.push({ _id: new mongoose.Types.ObjectId(id) });
    }

    // Masukkan fallback filter jika _id atau id disimpan sebagai string
    filter.push({ _id: id });
    filter.push({ id: id });

    // Jalankan perintah hapus
    const deleteResult = await collection.findOneAndDelete({ $or: filter });

    if (!deleteResult) {
      return res.status(404).json({
        success: false,
        message: `Pesan dengan ID ${id} tidak ditemukan di collection ${targetCollection}`
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
      message: `Server Error: ${error.message}`
    });
  }
}