import { MongoClient } from 'mongodb';
import nodemailer from 'nodemailer';

const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  if (!uri) {
    return res.status(500).json({
      success: false,
      message: 'MONGODB_URI belum terpasang di Vercel Environment Variables.',
    });
  }

  let client;

  try {
    const { nama, pesan } = req.body || {};

    if (!nama || !pesan) {
      return res.status(400).json({ success: false, message: 'Nama dan pesan tidak boleh kosong.' });
    }

    // 1. Simpan ke MongoDB
    client = new MongoClient(uri);
    await client.connect();

    const db = client.db('eltri_db');
    await db.collection('pesan').insertOne({
      nama: nama.trim(),
      pesan: pesan.trim(),
      createdAt: new Date(),
    });

    // 2. Kirim Notifikasi Email via Nodemailer
    if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true, // Gunakan SSL
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS, // App Password: mpaqgalwlgytfnxu
          },
        });

        await transporter.sendMail({
  from: `"Web Eltri" <${process.env.GMAIL_USER}>`,
  to: process.env.GMAIL_USER,
  subject: `📩 Pesan Baru dari ${nama.trim()}`,
  html: `
    <div style="font-family: Arial, sans-serif; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px; max-width: 600px; background-color: #ffffff;">
      
      <!-- Header: Judul di Kiri & Logo di Kanan -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="color: #ff3333; margin: 0; font-size: 1.3rem;">Pesan Baru Diterima!</h2>
        <img src="https://xies-eltri.vercel.app/logo.png" alt="Logo" style="width: 50px; height: 50px; object-fit: contain; border-radius: 50%;" />
      </div>

      <!-- Detail Pengirim & Pesan -->
      <p style="margin: 8px 0; color: #333;"><strong>Pengirim:</strong> ${nama.trim()}</p>
      <p style="margin: 8px 0 4px 0; color: #333;"><strong>Pesan:</strong></p>
      
      <blockquote style="background: #f9f9f9; padding: 12px 16px; border-left: 4px solid #ff3333; margin: 0; border-radius: 4px; color: #222; line-height: 1.5;">
        ${pesan.trim()}
      </blockquote>

      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0 12px 0;" />
      
      <!-- Waktu Masuk -->
      <p style="font-size: 0.8rem; color: #888; margin: 0;">Waktu Masuk: ${new Date().toLocaleString('id-ID')}</p>
    </div>
  `,
});
      } catch (emailError) {
        // Log error email tapi tetap izinkan respon sukses karena data sudah masuk DB
        console.error('Nodemailer Error:', emailError);
      }
    }

    return res.status(200).json({ success: true, message: 'Pesan berhasil terkirim & email notifikasi dikirim!' });
  } catch (error) {
    console.error('Mongo Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal koneksi ke database.',
      error: error.message,
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
}