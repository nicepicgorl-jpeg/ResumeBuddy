'use client';

import { useState, useEffect } from 'react';
import { db, type MasterProfile, type JobDescription } from '@/lib/db';
import { useAppStore } from '@/lib/store';
import { callGemini } from '@/lib/gemini';
import { buildCoverLetterPrompt, COVER_LETTER_PROMPT } from '@/lib/rubric';

interface CoverLetterResult {
    cover_letter: string;
    key_matches: string[];
}

export default function CoverLetterView() {
    const { apiKey, setActiveView } = useAppStore();
    const [profile, setProfile] = useState<MasterProfile | null>(null);
    const [pastJDs, setPastJDs] = useState<JobDescription[]>([]);
    const [selectedJDId, setSelectedJDId] = useState<number | null>(null);
    const [jdText, setJdText] = useState('');
    const [useNew, setUseNew] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<CoverLetterResult | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        db.masterProfile.get('current_user').then((p) => setProfile(p ?? null));
        db.jobDescriptions.orderBy('createdAt').reverse().toArray().then(setPastJDs);
    }, []);

    const activeJDText = useNew
        ? jdText
        : pastJDs.find((j) => j.id === selectedJDId)?.rawText || '';

    const canGenerate = apiKey && profile && profile.experience.length > 0 && activeJDText.trim().length > 50;

    const handleGenerate = async () => {
        if (!profile || !apiKey) return;
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const prompt = buildCoverLetterPrompt(
                activeJDText,
                profile.summary,
                profile.experience,
                profile.skills,
                profile.projects
            );

            // Override system prompt for cover letter
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        system_instruction: { parts: [{ text: COVER_LETTER_PROMPT }] },
                        contents: [{ role: 'user', parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0.6,
                            topP: 0.95,
                            maxOutputTokens: 16384,
                            responseMimeType: 'application/json',
                        },
                    }),
                }
            );

            if (!response.ok) {
                const errBody = await response.text();
                throw new Error(`API error (${response.status}): ${errBody}`);
            }

            const data = await response.json();
            const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!rawText) throw new Error('Empty response from Gemini API.');

            const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const parsed = JSON.parse(cleaned) as CoverLetterResult;
            setResult(parsed);

            // Save
            const jd = pastJDs.find((j) => j.id === selectedJDId);
            const jdId = useNew
                ? await db.jobDescriptions.add({ title: 'Cover Letter JD', company: '', rawText: activeJDText, createdAt: new Date() })
                : jd?.id || 0;

            await db.coverLetters.add({
                jobDescriptionId: jdId as number,
                content: parsed.cover_letter,
                createdAt: new Date(),
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    if (!apiKey) {
        return (
            <div className="fade-in">
                <div className="page-header"><h1>Cover Letter</h1></div>
                <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🔑</div>
                    <h2 style={{ marginBottom: 8 }}>API Key Required</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Add your Gemini API key first.</p>
                    <button className="btn btn-primary" onClick={() => setActiveView('settings')}>Go to Settings →</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>✉️ Cover Letter Generator</h1>
                <p>Generate a tailored cover letter from your profile and a job description.</p>
            </div>

            {!result && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <div className="card-header"><h2>Job Description Source</h2></div>

                    {/* Toggle: new vs past */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                        <button
                            className={`btn btn-sm ${useNew ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setUseNew(true)}
                        >
                            Paste New JD
                        </button>
                        {pastJDs.length > 0 && (
                            <button
                                className={`btn btn-sm ${!useNew ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setUseNew(false)}
                            >
                                Use Saved JD ({pastJDs.length})
                            </button>
                        )}
                    </div>

                    {useNew ? (
                        <>
                            <label>Paste Job Description *</label>
                            <textarea
                                value={jdText}
                                onChange={(e) => setJdText(e.target.value)}
                                placeholder="Paste the full job description here..."
                                rows={8}
                            />
                        </>
                    ) : (
                        <div>
                            <label>Select a saved JD</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {pastJDs.map((jd) => (
                                    <button
                                        key={jd.id}
                                        onClick={() => setSelectedJDId(jd.id!)}
                                        style={{
                                            padding: '10px 14px',
                                            borderRadius: 9,
                                            border: `1px solid ${selectedJDId === jd.id ? 'var(--accent)' : 'var(--border)'}`,
                                            background: selectedJDId === jd.id ? 'var(--accent-glow)' : 'var(--bg-primary)',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            fontFamily: 'inherit',
                                            fontSize: '0.85rem',
                                            color: 'var(--text-primary)',
                                        }}
                                    >
                                        <strong>{jd.title}</strong> — {jd.company || 'Unknown'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                        <button className="btn btn-primary" onClick={handleGenerate} disabled={!canGenerate || loading}>
                            {loading ? (<><span className="spinner" /> Generating...</>) : '✉️ Generate Cover Letter'}
                        </button>
                    </div>

                    {error && (
                        <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(248,113,113,0.1)', border: '1px solid var(--danger)', borderRadius: 9, color: 'var(--danger)', fontSize: '0.85rem' }}>
                            {error}
                        </div>
                    )}
                </div>
            )}

            {result && (
                <div className="fade-in">
                    {/* Key Matches */}
                    {result.key_matches && result.key_matches.length > 0 && (
                        <div className="card" style={{ marginBottom: 20 }}>
                            <div className="card-header"><h2>🎯 Key Requirements Addressed</h2></div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {result.key_matches.map((m, i) => (
                                    <span key={i} className="tag">{m}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Cover Letter */}
                    <div className="card" style={{ marginBottom: 20 }}>
                        <div className="card-header"><h2>✉️ Your Cover Letter</h2></div>
                        <div className="cover-letter-output">
                            {result.cover_letter}
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button className="btn btn-primary" onClick={() => { setResult(null); setJdText(''); }}>
                            🔄 Generate Another
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                navigator.clipboard.writeText(result.cover_letter);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                            }}
                        >
                            {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
