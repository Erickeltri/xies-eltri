import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method Not Allowed' });

  if (!uri) {
    return res.status(500).json({ success: false, message: 'MONGODB_URI belum terpasang.' });
  }

  let client;

  try {
    client = new MongoClient(uri);
    await client.connect();

    const db = client.db('eltri_db');
    // Ambil semua pesan, urutkan dari yang terbaru (createdAt: -1)
    const pesanList = await db.collection('pesan').find({}).sort({ createdAt: -1 }).toArray();

    return res.status(200).json({
      success: true,
      data: pesanList,
    });
  } catch (error) {
    console.error('Fetch Pesan Error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data pesan.' });
  } finally {
    if (client) await client.close();
  }
}