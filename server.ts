import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

const app = express();
const PORT = process.env.PORT || 3006;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

app.post('/api/send', async (req, res) => {
  try {
    const { to, subject, html } = req.body;

    console.log('📨 Received email request:', { to, subject: subject?.substring(0, 50) });

    // 读取 Gmail SMTP 配置
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const mailFrom = process.env.MAIL_FROM || `Quick Send <${smtpUser}>`;

    console.log('🔑 SMTP Config:', {
      user: smtpUser ? '✓ Configured' : '✗ Missing',
      pass: smtpPass ? '✓ Configured' : '✗ Missing',
      from: mailFrom,
    });

    if (!smtpUser || !smtpPass) {
      res.status(500).json({
        error: 'Missing SMTP credentials. Please set SMTP_USER and SMTP_PASS in .env file.',
      });
      return;
    }

    // 支持单个邮箱（字符串）或多个邮箱（数组）
    let recipients: string[] = [];
    if (Array.isArray(to)) {
      recipients = to.filter((email: string) => typeof email === 'string' && isEmail(email));
    } else if (typeof to === 'string' && isEmail(to)) {
      recipients = [to];
    }

    if (recipients.length === 0) {
      res.status(400).json({ error: 'Please provide at least one valid recipient email.' });
      return;
    }
    if (!html || typeof html !== 'string') {
      res.status(400).json({ error: 'Missing HTML content.' });
      return;
    }

    console.log('📤 Attempting to send email to:', recipients.join(', '));

    // 创建 Nodemailer transporter（使用 Gmail）
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // 发送邮件（多个收件人用逗号分隔）
    const info = await transporter.sendMail({
      from: mailFrom,
      to: recipients.join(', '),
      subject: subject || 'Quick Send Email',
      html,
    });

    console.log('✅ Email sent successfully to', recipients.length, 'recipient(s):', info.messageId);

    res.status(200).json({
      ok: true,
      messageId: info.messageId,
      response: info.response,
      recipientCount: recipients.length,
    });
  } catch (e: any) {
    console.error('❌ Failed to send email:', e);
    res.status(500).json({
      error: 'Failed to send email',
      details: e?.message || String(e),
    });
  }
});

app.listen(PORT, () => {
  console.log(`
🚀 Quick Send API running at http://localhost:${PORT}
📧 Email endpoint: http://localhost:${PORT}/api/send

💡 Make sure to configure your .env file with Gmail credentials:
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
`);
});

