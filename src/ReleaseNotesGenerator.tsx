import React, { useState, useRef } from 'react';

interface ReleaseNote {
  platform: 'all' | 'mobile' | 'desktop';
  emoji: string;
  label: string;
  content: string;
}

interface Props {
  onBack: () => void;
}

export function ReleaseNotesGenerator({ onBack }: Props) {
  const [rawNotes, setRawNotes] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<ReleaseNote[]>([]);
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const previewRef = useRef<HTMLIFrameElement>(null);

  const handleGenerate = async () => {
    if (!rawNotes.trim()) {
      setError('Please paste your release notes first');
      return;
    }

    setLoading(true);
    setError('');
    setNotes([]);
    setGeneratedHtml('');

    try {
      const response = await fetch('/api/generate-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          rawNotes, 
          bannerUrl: bannerUrl.trim() || undefined 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate release notes');
      }

      setNotes(data.notes);
      setGeneratedHtml(data.html);
    } catch (e: any) {
      setError(e.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(generatedHtml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Failed to copy to clipboard');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([generatedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `release_notes_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setRawNotes('');
    setBannerUrl('');
    setNotes([]);
    setGeneratedHtml('');
    setError('');
  };

  return (
    <div className="app generator-page">
      <div className="container generator-container">
        {/* Header */}
        <header className="header">
          <button className="back-btn" onClick={onBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
          <div className="logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#grad2)" />
              <path d="M10 12h12M10 16h8M10 20h10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <defs>
                <linearGradient id="grad2" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#10B981"/>
                  <stop offset="1" stopColor="#059669"/>
                </linearGradient>
              </defs>
            </svg>
            <span>Release Notes Generator</span>
          </div>
          <p className="tagline">Paste changelog. AI extracts highlights. Get HTML.</p>
        </header>

        <div className="generator-layout">
          {/* Input Panel */}
          <main className="card input-panel">
            <div className="form-group">
              <label htmlFor="rawNotes">
                <span className="label-icon">📝</span>
                Raw Release Notes
              </label>
              <textarea
                id="rawNotes"
                className="textarea"
                value={rawNotes}
                onChange={(e) => setRawNotes(e.target.value)}
                placeholder="Paste your raw version changelog here...

Example:
v2.5.0 (2024-01-15)

Desktop:
- Added manual fetch mail button
- Fixed compose window recipient display
- New 'Mark all done' action for todos

Mobile:
- Improved initial mail loading speed
- Fixed notification badge count

All platforms:
- Reply now expands sender and subject by default
- Various bug fixes and performance improvements"
                rows={12}
              />
            </div>

            <div className="form-group">
              <label htmlFor="bannerUrl">
                <span className="label-icon">🖼️</span>
                Banner Image URL <span className="optional">(optional)</span>
              </label>
              <input
                id="bannerUrl"
                type="url"
                className="input"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://example.com/banner.png"
              />
            </div>

            {error && (
              <div className="status error">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="button-row">
              <button className="secondary-btn" onClick={handleClear} disabled={loading}>
                Clear
              </button>
              <button
                className="generate-btn"
                onClick={handleGenerate}
                disabled={loading || !rawNotes.trim()}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Generate with AI
                  </>
                )}
              </button>
            </div>
          </main>

          {/* Output Panel */}
          <div className="output-panel">
            {/* Extracted Notes Preview */}
            {notes.length > 0 && (
              <div className="card notes-preview">
                <h3 className="section-title">
                  <span className="label-icon">✨</span>
                  Extracted Highlights
                </h3>
                <div className="notes-list">
                  {notes.map((note, idx) => (
                    <div key={idx} className="note-item">
                      <span className="note-emoji">{note.emoji}</span>
                      <div className="note-content">
                        <strong className="note-label">{note.label}</strong>
                        <p className="note-text">{note.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* HTML Preview */}
            {generatedHtml && (
              <div className="card preview-card">
                <div className="preview-header">
                  <h3 className="section-title">
                    <span className="label-icon">👀</span>
                    Email Preview
                  </h3>
                  <div className="preview-actions">
                    <button className="icon-btn" onClick={handleCopyHtml} title="Copy HTML">
                      {copied ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
                          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      )}
                    </button>
                    <button className="icon-btn" onClick={handleDownload} title="Download HTML">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="preview-frame-container">
                  <iframe
                    ref={previewRef}
                    srcDoc={generatedHtml}
                    className="preview-frame"
                    title="Email Preview"
                  />
                </div>
              </div>
            )}

            {/* Empty State */}
            {!notes.length && !generatedHtml && !loading && (
              <div className="card empty-state">
                <div className="empty-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="empty-text">Paste your changelog and click "Generate" to see the magic ✨</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



