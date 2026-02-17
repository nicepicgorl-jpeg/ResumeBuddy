'use client';

import { useState, useEffect } from 'react';
import { db, type MasterProfile, type OptimizedResume } from '@/lib/db';
import { useAppStore } from '@/lib/store';
import { callGemini, type GeminiResponse } from '@/lib/gemini';
import { buildUserPrompt, PASSING_SCORE, RUBRIC_WEIGHTS } from '@/lib/rubric';

export default function OptimizerView() {
    const { apiKey, setActiveView } = useAppStore();
    const [profile, setProfile] = useState<MasterProfile | null>(null);
    const [jdTitle, setJdTitle] = useState('');
    const [jdCompany, setJdCompany] = useState('');
    const [jdText, setJdText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<GeminiResponse | null>(null);

    useEffect(() => {
        db.masterProfile.get('current_user').then((p) => setProfile(p ?? null));
    }, []);

    const canRun = apiKey && profile && profile.experience.length > 0 && jdText.trim().length > 50;

    const handleOptimize = async () => {
        if (!profile || !apiKey) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const prompt = buildUserPrompt(
                jdText,
                profile.summary,
                profile.experience,
                profile.skills,
                profile.projects
            );

            const response = await callGemini(apiKey, prompt);
            setResult(response);

            // Save JD
            const jdId = await db.jobDescriptions.add({
                title: jdTitle || 'Untitled',
                company: jdCompany || 'Unknown',
                rawText: jdText,
                createdAt: new Date(),
            });

            // Save optimized resume
            await db.resumes.add({
                jobDescriptionId: jdId as number,
                optimizedSummary: response.optimized_summary,
                optimizedExperience: response.optimized_experience,
                optimizedSkills: response.optimized_skills,
                score: response.score.total,
                breakdown: response.score.breakdown,
                suggestions: response.suggestions,
                createdAt: new Date(),
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const getScoreClass = (score: number) => {
        if (score >= PASSING_SCORE) return 'pass';
        if (score >= 60) return 'warn';
        return 'fail';
    };

    const getBarColor = (score: number, max: number) => {
        const pct = (score / max) * 100;
        if (pct >= 80) return 'var(--success)';
        if (pct >= 60) return 'var(--warning)';
        return 'var(--danger)';
    };

    // --- No API Key ---
    if (!apiKey) {
        return (
            <div className="fade-in">
                <div className="page-header">
                    <h1>Optimize Resume</h1>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🔑</div>
                    <h2 style={{ marginBottom: 8 }}>API Key Required</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
                        You need a Gemini API key to use the optimizer. It&apos;s free to get one.
                    </p>
                    <button className="btn btn-primary" onClick={() => setActiveView('settings')}>
                        Go to Settings →
                    </button>
                </div>
            </div>
        );
    }

    // --- No Profile ---
    if (profile && profile.experience.length === 0) {
        return (
            <div className="fade-in">
                <div className="page-header">
                    <h1>Optimize Resume</h1>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>📝</div>
                    <h2 style={{ marginBottom: 8 }}>Profile Needed</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
                        Add at least one experience entry to your Master Profile before optimizing.
                    </p>
                    <button className="btn btn-primary" onClick={() => setActiveView('profile')}>
                        Edit Profile →
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>⚡ Optimize Resume</h1>
                <p>Paste the job description below. We&apos;ll match it against your profile and rewrite for ATS.</p>
            </div>

            {/* Input Section */}
            {!result && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <div className="card-header"><h2>Job Description</h2></div>
                    <div className="form-grid" style={{ marginBottom: 12 }}>
                        <div>
                            <label>Job Title</label>
                            <input type="text" value={jdTitle} onChange={(e) => setJdTitle(e.target.value)} placeholder="Senior Software Engineer" />
                        </div>
                        <div>
                            <label>Company</label>
                            <input type="text" value={jdCompany} onChange={(e) => setJdCompany(e.target.value)} placeholder="Google" />
                        </div>
                    </div>
                    <label>Full Job Description *</label>
                    <textarea
                        value={jdText}
                        onChange={(e) => setJdText(e.target.value)}
                        placeholder="Paste the complete job description here..."
                        rows={10}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {jdText.length > 0 ? `${jdText.split(/\s+/).filter(Boolean).length} words` : 'Min 50 characters required'}
                        </span>
                        <button className="btn btn-primary" onClick={handleOptimize} disabled={!canRun || loading}>
                            {loading ? (
                                <>
                                    <span className="spinner" />
                                    Optimizing...
                                </>
                            ) : (
                                '🚀 Optimize Now'
                            )}
                        </button>
                    </div>

                    {error && (
                        <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(248, 113, 113, 0.1)', border: '1px solid var(--danger)', borderRadius: 9, color: 'var(--danger)', fontSize: '0.85rem' }}>
                            {error}
                        </div>
                    )}
                </div>
            )}

            {/* Results Section */}
            {result && (
                <div className="fade-in">
                    {/* Score Card */}
                    <div className="card" style={{ marginBottom: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20 }}>
                            <div className={`score-badge ${getScoreClass(result.score.total)}`}>
                                {result.score.total}
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.2rem', marginBottom: 4 }}>
                                    {result.score.total >= PASSING_SCORE ? '🎉 ATS Ready!' : '⚠️ Needs Improvement'}
                                </h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    {result.score.total >= PASSING_SCORE
                                        ? 'Your resume scores above the 80% threshold.'
                                        : 'Review the suggestions below to improve your score.'}
                                </p>
                            </div>
                        </div>

                        {/* Breakdown Bars */}
                        {(Object.entries(result.score.breakdown) as [keyof typeof RUBRIC_WEIGHTS, { score: number; findings: string[] }][]).map(([key, val]) => (
                            <div key={key} style={{ marginBottom: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{RUBRIC_WEIGHTS[key].label}</span>
                                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                        {val.score} / {RUBRIC_WEIGHTS[key].weight}
                                    </span>
                                </div>
                                <div className="score-bar">
                                    <div
                                        className="score-bar-fill"
                                        style={{
                                            width: `${(val.score / RUBRIC_WEIGHTS[key].weight) * 100}%`,
                                            background: getBarColor(val.score, RUBRIC_WEIGHTS[key].weight),
                                        }}
                                    />
                                </div>
                                {val.findings.length > 0 && (
                                    <div style={{ marginTop: 6 }}>
                                        {val.findings.map((f, i) => (
                                            <div key={i} style={{ fontSize: '0.78rem', color: 'var(--text-muted)', paddingLeft: 8, borderLeft: '2px solid var(--border)', marginBottom: 4 }}>
                                                {f}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Suggestions */}
                    {result.suggestions && result.suggestions.length > 0 && (
                        <div className="card" style={{ marginBottom: 20 }}>
                            <div className="card-header"><h2>💡 Suggestions</h2></div>
                            {result.suggestions.map((s, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                                    <span style={{ color: 'var(--warning)', fontSize: '0.85rem', flexShrink: 0 }}>▸</span>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{s}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Optimized Summary */}
                    <div className="card" style={{ marginBottom: 20 }}>
                        <div className="card-header"><h2>📝 Optimized Summary</h2></div>
                        <p style={{ fontSize: '0.88rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                            {result.optimized_summary}
                        </p>
                    </div>

                    {/* Optimized Experience */}
                    <div className="card" style={{ marginBottom: 20 }}>
                        <div className="card-header"><h2>💼 Optimized Experience</h2></div>
                        {result.optimized_experience.map((exp, idx) => (
                            <div key={idx} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: idx < result.optimized_experience.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                <div style={{ fontWeight: 600, marginBottom: 2 }}>{exp.role}</div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                                    {exp.company} • {exp.startDate} – {exp.endDate}
                                </div>
                                {exp.bullets.map((b, bIdx) => (
                                    <div key={bIdx} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        <span style={{ color: 'var(--accent)', flexShrink: 0 }}>•</span>
                                        <span>{b}</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Optimized Skills */}
                    <div className="card" style={{ marginBottom: 20 }}>
                        <div className="card-header"><h2>🛠 Optimized Skills</h2></div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {result.optimized_skills.map((skill) => (
                                <span key={skill} className="tag">{skill}</span>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <button className="btn btn-primary" onClick={() => {
                            setResult(null);
                            setJdText('');
                            setJdTitle('');
                            setJdCompany('');
                        }}>
                            🔄 New Optimization
                        </button>
                        <button className="btn btn-secondary" onClick={() => {
                            const text = `PROFESSIONAL SUMMARY\n${result.optimized_summary}\n\nEXPERIENCE\n${result.optimized_experience.map(e => `${e.role} at ${e.company} (${e.startDate} – ${e.endDate})\n${e.bullets.map(b => `• ${b}`).join('\n')}`).join('\n\n')}\n\nSKILLS\n${result.optimized_skills.join(', ')}`;
                            navigator.clipboard.writeText(text);
                        }}>
                            📋 Copy as Text
                        </button>
                        <button className="btn btn-secondary" onClick={() => {
                            // Build ATS-friendly resume HTML and open print dialog
                            const name = profile?.personalInfo.name || 'Your Name';
                            const email = profile?.personalInfo.email || '';
                            const phone = profile?.personalInfo.phone || '';
                            const location = profile?.personalInfo.location || '';
                            const contact = [email, phone, location].filter(Boolean).join(' | ');
                            const html = `<!DOCTYPE html><html><head><title>Resume - ${name}</title><style>body{font-family:'Times New Roman',serif;font-size:11pt;line-height:1.5;max-width:800px;margin:0 auto;padding:48px;color:#111}h1{font-size:18pt;margin-bottom:2px}h2{font-size:13pt;border-bottom:1px solid #333;padding-bottom:2px;margin:18px 0 8px;text-transform:uppercase}h3{font-size:11pt;margin:0}ul{padding-left:18px;margin:4px 0}li{margin-bottom:3px}.contact{font-size:10pt;color:#444;margin-bottom:14px}@media print{body{padding:0}}</style></head><body><h1>${name}</h1><div class="contact">${contact}</div><h2>Professional Summary</h2><p>${result.optimized_summary}</p><h2>Professional Experience</h2>${result.optimized_experience.map(e => `<h3>${e.role} — ${e.company}</h3><div style="font-size:10pt;color:#666;margin-bottom:4px">${e.startDate} – ${e.endDate}</div><ul>${e.bullets.map(b => `<li>${b}</li>`).join('')}</ul>`).join('')}<h2>Skills</h2><p>${result.optimized_skills.join(', ')}</p></body></html>`;
                            const w = window.open('', '_blank');
                            if (w) { w.document.write(html); w.document.close(); w.print(); }
                        }}>
                            📄 Download ATS Template
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
