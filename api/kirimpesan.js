import nodemailer from 'nodemailer';

// Di dalam handler API kirim pesan kamu:
if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Web Eltri" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    subject: `📩 Pesan Baru dari ${nama}`,
    html: `<p><strong>Pengirim:</strong> ${nama}</p><p><strong>Pesan:</strong> ${pesan}</p>`,
  });
}