import React, { useState, useRef } from 'react';
import { ReleaseNotesGenerator } from './ReleaseNotesGenerator';

type Page = 'send' | 'generator';

function App() {
  const [page, setPage] = useState<Page>('send');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [recipientInput, setRecipientInput] = useState('');
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const addRecipient = (email: string) => {
    const trimmed = email.trim().toLowerCase();
    if (trimmed && isValidEmail(trimmed) && !recipients.includes(trimmed)) {
      setRecipients([...recipients, trimmed]);
      setRecipientInput('');
      setStatus(null);
    } else if (trimmed && !isValidEmail(trimmed)) {
      setStatus({ type: 'error', message: 'Please enter a valid email address' });
    }
  };

  const removeRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r !== email));
  };

  const handleRecipientKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      addRecipient(recipientInput);
    } else if (e.key === 'Backspace' && !recipientInput && recipients.length > 0) {
      removeRecipient(recipients[recipients.length - 1]);
    }
  };

  const handleRecipientPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const emails = pastedText.split(/[\s,;]+/).filter(email => email.trim());
    const validEmails = emails.filter(email => isValidEmail(email.trim().toLowerCase()));
    const newRecipients = [...new Set([...recipients, ...validEmails.map(e => e.trim().toLowerCase())])];
    setRecipients(newRecipients);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      setStatus({ type: 'error', message: 'Please upload an HTML file' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setHtml(content);
      setFileName(file.name);
      setStatus(null);
      // Use filename as default subject
      const baseName = file.name.replace(/\.(html|htm)$/i, '');
      if (!subject) {
        setSubject(baseName);
      }
    };
    reader.onerror = () => {
      setStatus({ type: 'error', message: 'Failed to read file' });
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      setStatus({ type: 'error', message: 'Please upload an HTML file' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setHtml(content);
      setFileName(file.name);
      setStatus(null);
      const baseName = file.name.replace(/\.(html|htm)$/i, '');
      if (!subject) {
        setSubject(baseName);
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSend = async () => {
    if (recipients.length === 0) {
      setStatus({ type: 'error', message: 'Please add at least one recipient' });
      return;
    }
    if (!html) {
      setStatus({ type: 'error', message: 'Please upload an HTML file first' });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const r = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipients,
          subject: subject || 'Quick Send Email',
          html,
        }),
      });
      const data = await r.json().catch(() => null);
      if (!r.ok) {
        setStatus({ type: 'error', message: data?.error || 'Failed to send email' });
        return;
      }
      const count = recipients.length;
      setStatus({ type: 'success', message: `Email sent to ${count} recipient${count > 1 ? 's' : ''} successfully!` });
      // Reset form
      setRecipients([]);
      setRecipientInput('');
      setSubject('');
      setHtml('');
      setFileName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (e: any) {
      setStatus({ type: 'error', message: e?.message || 'Failed to send email' });
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setHtml('');
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Show generator page
  if (page === 'generator') {
    return <ReleaseNotesGenerator onBack={() => setPage('send')} />;
  }

  return (
    <div className="app">
      <div className="container">
        {/* Header */}
        <header className="header">
          <div className="logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#grad)" />
              <path d="M8 11L16 17L24 11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="7" y="9" width="18" height="14" rx="2" stroke="white" strokeWidth="2"/>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#6366F1"/>
                  <stop offset="1" stopColor="#8B5CF6"/>
                </linearGradient>
              </defs>
            </svg>
            <span>Quick Send</span>
          </div>
          <p className="tagline">Upload HTML. Send Email. That's it.</p>
        </header>

        {/* Main Card */}
        <main className="card">
          {/* File Upload Area */}
          <div
            className={`upload-zone ${html ? 'has-file' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => !html && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".html,.htm"
              onChange={handleFileUpload}
              hidden
            />
            {html ? (
              <div className="file-info">
                <div className="file-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="file-details">
                  <span className="file-name">{fileName}</span>
                  <span className="file-status">Ready to send</span>
                </div>
                <button className="clear-btn" onClick={(e) => { e.stopPropagation(); clearFile(); }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            ) : (
              <div className="upload-prompt">
                <div className="upload-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="upload-text">Drop your HTML file here</p>
                <p className="upload-subtext">or click to browse</p>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
              className="input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="to">Recipients</label>
            <div className="recipients-container">
              {recipients.map((email) => (
                <span key={email} className="recipient-tag">
                  {email}
                  <button
                    type="button"
                    className="recipient-remove"
                    onClick={() => removeRecipient(email)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </span>
              ))}
              <input
                id="to"
                type="email"
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
                onKeyDown={handleRecipientKeyDown}
                onPaste={handleRecipientPaste}
                onBlur={() => recipientInput && addRecipient(recipientInput)}
                placeholder={recipients.length === 0 ? "Enter email addresses..." : ""}
                className="recipient-input"
              />
            </div>
            <p className="input-hint">Press Enter, Space, or comma to add multiple recipients</p>
          </div>

          {/* Status Message */}
          {status && (
            <div className={`status ${status.type}`}>
              {status.type === 'success' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
              <span>{status.message}</span>
            </div>
          )}

          {/* Send Button */}
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={loading || !html || recipients.length === 0}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Sending...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Send Email
              </>
            )}
          </button>

          {/* Generator Link */}
          <button
            className="generator-link"
            onClick={() => setPage('generator')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            AI Release Notes Generator
          </button>
        </main>
      </div>
    </div>
  );
}

export default App;

