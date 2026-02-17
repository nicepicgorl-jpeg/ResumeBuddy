'use client';

import { useAppStore } from '@/lib/store';

export default function LandingPage() {
    const { setActiveView } = useAppStore();

    return (
        <div className="landing">
            {/* Navbar */}
            <nav className="landing-nav">
                <div className="brand">Resume<span>Buddy</span></div>
                <button
                    className="hero-cta"
                    style={{ padding: '10px 24px', fontSize: '0.88rem' }}
                    onClick={() => setActiveView('profile')}
                >
                    Get Started →
                </button>
            </nav>

            {/* Hero */}
            <section className="landing-hero">
                {/* Blobs */}
                <div className="blob blob-1" />
                <div className="blob blob-2" />
                <div className="blob blob-3" />

                <div className="hero-text">
                    <h1>
                        Beat the Bots.<br />
                        Land the <span className="highlight">Interview.</span>
                    </h1>
                    <p>
                        ResumeBuddy rewrites your resume to pass Applicant Tracking Systems with an 80%+ match score.
                        Privacy-first — your data never leaves your browser.
                    </p>
                    <button className="hero-cta" onClick={() => setActiveView('profile')}>
                        🚀 Start Optimizing
                    </button>
                </div>

                <div className="hero-visual">
                    <div className="hero-card-stack">
                        {/* Card 1 — Score */}
                        <div className="hero-mock-card card-1">
                            <div className="card-label">ATS Score</div>
                            <div className="card-score">92</div>
                            <div className="card-bar">
                                <div className="card-bar-fill" style={{ width: '92%' }} />
                            </div>
                        </div>

                        {/* Card 2 — Keywords */}
                        <div className="hero-mock-card card-2">
                            <div className="card-label">Keyword Match</div>
                            <div className="card-lines">
                                <div className="card-line" style={{ width: '90%' }} />
                                <div className="card-line" style={{ width: '75%' }} />
                                <div className="card-line" style={{ width: '60%' }} />
                                <div className="card-line" style={{ width: '85%' }} />
                            </div>
                        </div>

                        {/* Card 3 — Bullets */}
                        <div className="hero-mock-card card-3">
                            <div className="card-label">Optimized Bullets</div>
                            <div className="card-lines">
                                <div className="card-line" style={{ width: '95%' }} />
                                <div className="card-line" style={{ width: '80%' }} />
                                <div className="card-line" style={{ width: '70%' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Bar */}
            <div className="trust-bar">
                <div className="trust-item"><span className="icon">🔒</span> 100% Local — No Data Uploaded</div>
                <div className="trust-item"><span className="icon">🔑</span> Bring Your Own API Key</div>
                <div className="trust-item"><span className="icon">⚡</span> Powered by Gemini AI</div>
                <div className="trust-item"><span className="icon">🆓</span> Free &amp; Open Source</div>
            </div>

            {/* Features */}
            <section className="landing-features">
                <div className="feature-card">
                    <div className="feature-icon" style={{ background: 'rgba(161, 238, 189, 0.25)' }}>📝</div>
                    <h3>Master Profile</h3>
                    <p>Store your complete career history locally. Add experiences, skills, education — all saved in your browser.</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon" style={{ background: 'rgba(123, 211, 234, 0.25)' }}>⚡</div>
                    <h3>AI Resume Optimizer</h3>
                    <p>Paste any job description. Our AI rewrites your bullets with power verbs, quantified metrics, and exact keyword matches.</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon" style={{ background: 'rgba(246, 247, 196, 0.5)' }}>📊</div>
                    <h3>ATS Scoring Rubric</h3>
                    <p>Get a detailed 0-100 score with breakdown: 40% Keyword Match, 20% Formatting, 40% Job Alignment. Aim for 80+.</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon" style={{ background: 'rgba(246, 214, 214, 0.4)' }}>🔒</div>
                    <h3>Privacy First</h3>
                    <p>Your resume data stays in IndexedDB. API calls go directly from your browser to Google — we never touch your data.</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon" style={{ background: 'rgba(161, 238, 189, 0.25)' }}>🔑</div>
                    <h3>BYOK (Bring Your Own Key)</h3>
                    <p>Use your free Gemini API key. No accounts, no subscriptions, no hidden costs.</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon" style={{ background: 'rgba(123, 211, 234, 0.25)' }}>📋</div>
                    <h3>History &amp; Compare</h3>
                    <p>Every optimization is saved locally. Compare scores across different job applications and track your progress.</p>
                </div>
            </section>
        </div>
    );
}
