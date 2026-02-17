'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';

export default function SettingsView() {
    const { apiKey, setApiKey, clearApiKey } = useAppStore();
    const [input, setInput] = useState(apiKey);
    const [showKey, setShowKey] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setApiKey(input.trim());
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>Settings</h1>
                <p>Configure your Gemini API key. Your key stays in your browser — never sent to any server.</p>
            </div>

            <div className="card" style={{ maxWidth: 600 }}>
                <div className="card-header">
                    <h2>🔑 Gemini API Key</h2>
                </div>

                <div style={{ marginBottom: 16 }}>
                    <label htmlFor="api-key">API Key</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input
                            id="api-key"
                            type={showKey ? 'text' : 'password'}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="AIzaSy..."
                            style={{ flex: 1 }}
                        />
                        <button
                            className="btn-icon"
                            onClick={() => setShowKey(!showKey)}
                            title={showKey ? 'Hide' : 'Show'}
                            type="button"
                        >
                            {showKey ? '🙈' : '👁️'}
                        </button>
                    </div>
                </div>

                <div style={{
                    padding: '12px 16px',
                    background: 'var(--bg-secondary)',
                    borderRadius: 9,
                    marginBottom: 20,
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.6
                }}>
                    <strong style={{ color: 'var(--text-secondary)' }}>🔒 Privacy First</strong><br />
                    Your API key is stored locally in your browser using <code>localStorage</code>. It is sent directly
                    from your browser to Google&apos;s Gemini API — ResumeBuddy never sees or stores it on any server.
                    <br /><br />
                    Get a free key from{' '}
                    <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--accent)', textDecoration: 'underline' }}
                    >
                        Google AI Studio →
                    </a>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary" onClick={handleSave} disabled={!input.trim()}>
                        {saved ? '✓ Saved!' : 'Save Key'}
                    </button>
                    {apiKey && (
                        <button className="btn btn-danger btn-sm" onClick={() => { clearApiKey(); setInput(''); }}>
                            Remove Key
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
