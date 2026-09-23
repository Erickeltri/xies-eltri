import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method tidak diizinkan' });
  }

  const { nama, pesan } = req.body;

  // Cek apakah variabel env terbaca
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    console.error('ERROR: GMAIL_USER atau GMAIL_PASS belum dipasang di Vercel!');
    return res.status(500).json({ 
      success: false, 
      message: 'Konfigurasi email server belum lengkap.' 
    });
  }

  try {
    // Transporter Nodemailer dengan Port 465 (Secure)
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS, // Pastikan isinya mpaqgalwlgytfnxu
      },
    });

    // Kirim Email
    const info = await transporter.sendMail({
      from: `"Web Eltri" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: `📩 Pesan Baru dari ${nama}`,
      html: `
        <h3>Pesan Baru Masuk</h3>
        <p><strong>Nama:</strong> ${nama}</p>
        <p><strong>Pesan:</strong> ${pesan}</p>
      `,
    });

    console.log('Email berhasil dikirim:', info.messageId);
    return res.status(200).json({ success: true, message: 'Pesan & Email berhasil terkirim!' });

  } catch (error) {
    // Tampilkan detail error di Vercel Logs
    console.error('Nodemailer Error Detail:', error);
    return res.status(500).json({ 
      success: false, 
      message: `Gagal mengirim email: ${error.message}` 
    });
  }
}