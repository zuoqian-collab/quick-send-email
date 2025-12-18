# Quick Send ⚡

A minimal email sender app. Upload HTML, enter recipient, send. That's it.

![Quick Send Screenshot](screenshot.png)

## Features

- 📁 **Drag & Drop** - Simply drag your HTML file to upload
- 📧 **Direct Send** - No preview, no editing, just send
- 🌙 **Dark Mode** - Automatic system theme detection
- 🎨 **Clean UI** - Modern, minimal interface

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `env.example` to `.env` and add your Gmail credentials:

```bash
cp env.example .env
```

Edit `.env`:

```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

> **Note:** You need to generate an [App Password](https://myaccount.google.com/apppasswords) for Gmail. Regular passwords won't work.

### 3. Run the app

```bash
npm run dev
```

The app will be available at:
- Frontend: http://localhost:3003
- API: http://localhost:3004

## How to Use

1. **Upload HTML** - Drag & drop or click to select your HTML email file
2. **Enter Subject** - The filename is used as default, but you can change it
3. **Enter Recipient** - Add the email address to send to
4. **Click Send** - That's it! Your email is on its way

## Tech Stack

- **Frontend:** React + Vite + TypeScript
- **Backend:** Express + Nodemailer
- **Email:** Gmail SMTP

## Gmail Setup

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification if not already enabled
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Generate a new App Password for "Mail"
5. Use this password in your `.env` file

## License

MIT

