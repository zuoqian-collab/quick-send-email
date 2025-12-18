import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const { to, subject, html } = req.body;

    console.log('📨 Received email request:', { to, subject: subject?.substring(0, 50) });

    // 读取环境变量
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const mailFrom = process.env.MAIL_FROM || `Quick Send <${smtpUser}>`;

    console.log('🔑 SMTP Config:', {
      user: smtpUser ? '✓ Configured' : '✗ Missing',
      pass: smtpPass ? '✓ Configured' : '✗ Missing',
      from: mailFrom,
    });

    if (!smtpUser || !smtpPass) {
      return res.status(500).json({
        error: 'Missing SMTP credentials. Please configure SMTP_USER and SMTP_PASS in Vercel environment variables.',
      });
    }

    if (!to || typeof to !== 'string' || !isEmail(to)) {
      return res.status(400).json({ error: 'Invalid recipient email.' });
    }
    if (!html || typeof html !== 'string') {
      return res.status(400).json({ error: 'Missing HTML content.' });
    }

    console.log('📤 Attempting to send email to:', to);

    // 创建 Nodemailer transporter（使用 Gmail）
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // 发送邮件
    const info = await transporter.sendMail({
      from: mailFrom,
      to,
      subject: subject || 'Quick Send Email',
      html,
    });

    console.log('✅ Email sent successfully:', info.messageId);

    return res.status(200).json({
      ok: true,
      messageId: info.messageId,
      response: info.response,
    });
  } catch (e: any) {
    console.error('❌ Failed to send email:', e);
    return res.status(500).json({
      error: 'Failed to send email',
      details: e?.message || String(e),
    });
  }
}

