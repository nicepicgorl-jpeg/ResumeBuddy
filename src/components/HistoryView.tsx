'use client';

import { useState, useEffect } from 'react';
import { db, type OptimizedResume, type JobDescription } from '@/lib/db';
import { PASSING_SCORE } from '@/lib/rubric';

interface HistoryEntry extends OptimizedResume {
    jdTitle?: string;
    jdCompany?: string;
}

export default function HistoryView() {
    const [entries, setEntries] = useState<HistoryEntry[]>([]);
    const [selected, setSelected] = useState<HistoryEntry | null>(null);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        const resumes = await db.resumes.orderBy('createdAt').reverse().toArray();
        const jds = await db.jobDescriptions.toArray();
        const jdMap = new Map<number, JobDescription>();
        jds.forEach((jd) => { if (jd.id !== undefined) jdMap.set(jd.id, jd); });

        const enriched: HistoryEntry[] = resumes.map((r) => {
            const jd = jdMap.get(r.jobDescriptionId);
            return { ...r, jdTitle: jd?.title, jdCompany: jd?.company };
        });
        setEntries(enriched);
    };

    const deleteEntry = async (id: number) => {
        await db.resumes.delete(id);
        if (selected?.id === id) setSelected(null);
        loadHistory();
    };

    const getScoreClass = (score: number) => {
        if (score >= PASSING_SCORE) return 'pass';
        if (score >= 60) return 'warn';
        return 'fail';
    };

    if (entries.length === 0) {
        return (
            <div className="fade-in">
                <div className="page-header">
                    <h1>History</h1>
                    <p>Your past optimizations will appear here.</p>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>📭</div>
                    <h2 style={{ marginBottom: 8 }}>No History Yet</h2>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Optimize a resume to see results here.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>History</h1>
                <p>{entries.length} optimization{entries.length !== 1 ? 's' : ''} saved locally.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1.5fr' : '1fr', gap: 20 }}>
                {/* List */}
                <div>
                    {entries.map((entry) => (
                        <div
                            key={entry.id}
                            className="card"
                            onClick={() => setSelected(entry)}
                            style={{
                                marginBottom: 10,
                                cursor: 'pointer',
                                borderColor: selected?.id === entry.id ? 'var(--accent)' : undefined,
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 2 }}>
                                        {entry.jdTitle || 'Untitled'}
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                        {entry.jdCompany || 'Unknown'} • {new Date(entry.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span className={`score-badge ${getScoreClass(entry.score)}`} style={{ width: 40, height: 40, fontSize: '0.85rem' }}>
                                        {entry.score}
                                    </span>
                                    <button
                                        className="btn-icon"
                                        onClick={(e) => { e.stopPropagation(); if (entry.id !== undefined) deleteEntry(entry.id); }}
                                        style={{ color: 'var(--danger)', fontSize: '0.75rem' }}
                                    >
                                        🗑
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Detail */}
                {selected && (
                    <div className="card fade-in">
                        <div className="card-header">
                            <div>
                                <h2>{selected.jdTitle}</h2>
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{selected.jdCompany}</p>
                            </div>
                            <span className={`score-badge ${getScoreClass(selected.score)}`}>
                                {selected.score}
                            </span>
                        </div>

                        <div className="divider" />

                        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 8 }}>Summary</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
                            {selected.optimizedSummary}
                        </p>

                        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 8 }}>Experience</h3>
                        {selected.optimizedExperience.map((exp, idx) => (
                            <div key={idx} style={{ marginBottom: 14 }}>
                                <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{exp.role} at {exp.company}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>{exp.startDate} – {exp.endDate}</div>
                                {exp.bullets.map((b, bIdx) => (
                                    <div key={bIdx} style={{ display: 'flex', gap: 6, marginBottom: 4, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                        <span style={{ color: 'var(--accent)' }}>•</span>
                                        <span>{b}</span>
                                    </div>
                                ))}
                            </div>
                        ))}

                        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 8 }}>Skills</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {selected.optimizedSkills.map((s) => (
                                <span key={s} className="tag">{s}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
