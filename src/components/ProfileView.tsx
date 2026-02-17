'use client';

import { useState, useEffect, useCallback } from 'react';
import { db, type MasterProfile, type Experience, type Education, type Project } from '@/lib/db';
import { useAppStore } from '@/lib/store';
import { v4 as uuidv4 } from 'uuid';

const EMPTY_PROFILE: MasterProfile = {
    id: 'current_user',
    personalInfo: { name: '', email: '', phone: '', linkedin: '', location: '', portfolio: '', website: '', github: '' },
    summary: '',
    experience: [],
    projects: [],
    skills: [],
    education: [],
    updatedAt: new Date(),
};

export default function ProfileView() {
    const { apiKey, setActiveView } = useAppStore();
    const [profile, setProfile] = useState<MasterProfile>(EMPTY_PROFILE);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [skillInput, setSkillInput] = useState('');
    const [projTechInput, setProjTechInput] = useState<Record<string, string>>({});

    useEffect(() => {
        db.masterProfile.get('current_user').then((p) => {
            if (p) setProfile({ ...EMPTY_PROFILE, ...p, projects: p.projects ?? [] });
        });
    }, []);

    const saveProfile = useCallback(async () => {
        setSaving(true);
        const updated = { ...profile, updatedAt: new Date() };
        await db.masterProfile.put(updated);
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }, [profile]);

    // --- Personal Info ---
    const updatePersonal = (field: keyof MasterProfile['personalInfo'], value: string) => {
        setProfile((p) => ({
            ...p,
            personalInfo: { ...p.personalInfo, [field]: value },
        }));
    };

    // --- Experience ---
    const addExperience = () => {
        setProfile((p) => ({
            ...p,
            experience: [
                ...p.experience,
                { id: uuidv4(), company: '', role: '', startDate: '', endDate: '', bullets: [''] },
            ],
        }));
    };

    const updateExperience = (idx: number, field: keyof Experience, value: string | string[]) => {
        setProfile((p) => {
            const exp = [...p.experience];
            exp[idx] = { ...exp[idx], [field]: value };
            return { ...p, experience: exp };
        });
    };

    const removeExperience = (idx: number) => {
        setProfile((p) => ({
            ...p,
            experience: p.experience.filter((_, i) => i !== idx),
        }));
    };

    const updateBullet = (expIdx: number, bulletIdx: number, value: string) => {
        setProfile((p) => {
            const exp = [...p.experience];
            const bullets = [...exp[expIdx].bullets];
            bullets[bulletIdx] = value;
            exp[expIdx] = { ...exp[expIdx], bullets };
            return { ...p, experience: exp };
        });
    };

    const addBullet = (expIdx: number) => {
        setProfile((p) => {
            const exp = [...p.experience];
            exp[expIdx] = { ...exp[expIdx], bullets: [...exp[expIdx].bullets, ''] };
            return { ...p, experience: exp };
        });
    };

    const removeBullet = (expIdx: number, bulletIdx: number) => {
        setProfile((p) => {
            const exp = [...p.experience];
            exp[expIdx] = { ...exp[expIdx], bullets: exp[expIdx].bullets.filter((_, i) => i !== bulletIdx) };
            return { ...p, experience: exp };
        });
    };

    // --- Projects ---
    const addProject = () => {
        const id = uuidv4();
        setProfile((p) => ({
            ...p,
            projects: [...p.projects, { id, name: '', description: '', url: '', technologies: [], highlights: [''] }],
        }));
    };

    const updateProject = (idx: number, field: keyof Project, value: string | string[]) => {
        setProfile((p) => {
            const proj = [...p.projects];
            proj[idx] = { ...proj[idx], [field]: value };
            return { ...p, projects: proj };
        });
    };

    const removeProject = (idx: number) => {
        setProfile((p) => ({ ...p, projects: p.projects.filter((_, i) => i !== idx) }));
    };

    const addProjectTech = (projIdx: number) => {
        const projId = profile.projects[projIdx].id;
        const input = (projTechInput[projId] || '').trim();
        if (!input) return;
        setProfile((p) => {
            const proj = [...p.projects];
            if (!proj[projIdx].technologies.includes(input)) {
                proj[projIdx] = { ...proj[projIdx], technologies: [...proj[projIdx].technologies, input] };
            }
            return { ...p, projects: proj };
        });
        setProjTechInput((prev) => ({ ...prev, [projId]: '' }));
    };

    const removeProjectTech = (projIdx: number, tech: string) => {
        setProfile((p) => {
            const proj = [...p.projects];
            proj[projIdx] = { ...proj[projIdx], technologies: proj[projIdx].technologies.filter((t) => t !== tech) };
            return { ...p, projects: proj };
        });
    };

    const updateHighlight = (projIdx: number, hIdx: number, value: string) => {
        setProfile((p) => {
            const proj = [...p.projects];
            const highlights = [...proj[projIdx].highlights];
            highlights[hIdx] = value;
            proj[projIdx] = { ...proj[projIdx], highlights };
            return { ...p, projects: proj };
        });
    };

    const addHighlight = (projIdx: number) => {
        setProfile((p) => {
            const proj = [...p.projects];
            proj[projIdx] = { ...proj[projIdx], highlights: [...proj[projIdx].highlights, ''] };
            return { ...p, projects: proj };
        });
    };

    const removeHighlight = (projIdx: number, hIdx: number) => {
        setProfile((p) => {
            const proj = [...p.projects];
            proj[projIdx] = { ...proj[projIdx], highlights: proj[projIdx].highlights.filter((_, i) => i !== hIdx) };
            return { ...p, projects: proj };
        });
    };

    // --- Education ---
    const addEducation = () => {
        setProfile((p) => ({
            ...p,
            education: [...p.education, { id: uuidv4(), school: '', degree: '', year: '' }],
        }));
    };

    const updateEducation = (idx: number, field: keyof Education, value: string) => {
        setProfile((p) => {
            const edu = [...p.education];
            edu[idx] = { ...edu[idx], [field]: value };
            return { ...p, education: edu };
        });
    };

    const removeEducation = (idx: number) => {
        setProfile((p) => ({
            ...p,
            education: p.education.filter((_, i) => i !== idx),
        }));
    };

    // --- Skills ---
    const addSkill = () => {
        const trimmed = skillInput.trim();
        if (trimmed && !profile.skills.includes(trimmed)) {
            setProfile((p) => ({ ...p, skills: [...p.skills, trimmed] }));
            setSkillInput('');
        }
    };

    const removeSkill = (skill: string) => {
        setProfile((p) => ({ ...p, skills: p.skills.filter((s) => s !== skill) }));
    };

    return (
        <div className="fade-in" style={{ paddingBottom: 80 }}>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>Master Profile</h1>
                    <p>Your complete career data — stored locally, never uploaded.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                        className={`api-status ${apiKey ? 'connected' : 'disconnected'}`}
                        onClick={() => setActiveView('settings')}
                        title={apiKey ? 'API Key is set' : 'Click to add your API Key'}
                    >
                        <span className="dot" />
                        {apiKey ? 'API Key Set' : 'No API Key'}
                    </span>
                </div>
            </div>

            {/* Personal Info */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header"><h2>👤 Personal Information</h2></div>
                <div className="form-grid">
                    <div>
                        <label>Full Name</label>
                        <input type="text" value={profile.personalInfo.name} onChange={(e) => updatePersonal('name', e.target.value)} placeholder="Jane Doe" />
                    </div>
                    <div>
                        <label>Email</label>
                        <input type="email" value={profile.personalInfo.email} onChange={(e) => updatePersonal('email', e.target.value)} placeholder="jane@example.com" />
                    </div>
                    <div>
                        <label>Phone</label>
                        <input type="tel" value={profile.personalInfo.phone} onChange={(e) => updatePersonal('phone', e.target.value)} placeholder="+1 (555) 000-0000" />
                    </div>
                    <div>
                        <label>LinkedIn</label>
                        <input type="url" value={profile.personalInfo.linkedin} onChange={(e) => updatePersonal('linkedin', e.target.value)} placeholder="linkedin.com/in/janedoe" />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label>Location</label>
                        <input type="text" value={profile.personalInfo.location} onChange={(e) => updatePersonal('location', e.target.value)} placeholder="San Francisco, CA" />
                    </div>
                </div>
                <div style={{ marginTop: 16 }}>
                    <label style={{ marginBottom: 10, color: 'var(--text-muted)', fontSize: '0.78rem' }}>Optional Links</label>
                    <div className="form-grid">
                        <div>
                            <label>Portfolio</label>
                            <input type="url" value={profile.personalInfo.portfolio || ''} onChange={(e) => updatePersonal('portfolio', e.target.value)} placeholder="myportfolio.com" />
                        </div>
                        <div>
                            <label>Website</label>
                            <input type="url" value={profile.personalInfo.website || ''} onChange={(e) => updatePersonal('website', e.target.value)} placeholder="janedoe.com" />
                        </div>
                        <div>
                            <label>GitHub</label>
                            <input type="url" value={profile.personalInfo.github || ''} onChange={(e) => updatePersonal('github', e.target.value)} placeholder="github.com/janedoe" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header"><h2>📝 Professional Summary</h2></div>
                <textarea
                    value={profile.summary}
                    onChange={(e) => setProfile((p) => ({ ...p, summary: e.target.value }))}
                    placeholder="15+ years of experience in... (Tip: Lead with keywords & years of experience)"
                    rows={4}
                />
            </div>

            {/* Experience */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header">
                    <h2>💼 Experience</h2>
                </div>
                {profile.experience.length === 0 && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No experience added yet. Click &quot;+ Add Role&quot; to get started.</p>
                )}
                {profile.experience.map((exp, idx) => (
                    <div key={exp.id} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: idx < profile.experience.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)' }}>Role #{idx + 1}</span>
                            <button className="btn-icon" onClick={() => removeExperience(idx)} title="Remove" style={{ color: 'var(--danger)' }}>✕</button>
                        </div>
                        <div className="form-grid" style={{ marginBottom: 12 }}>
                            <div>
                                <label>Company</label>
                                <input type="text" value={exp.company} onChange={(e) => updateExperience(idx, 'company', e.target.value)} placeholder="Acme Corp" />
                            </div>
                            <div>
                                <label>Role / Title</label>
                                <input type="text" value={exp.role} onChange={(e) => updateExperience(idx, 'role', e.target.value)} placeholder="Senior Engineering Manager" />
                            </div>
                            <div>
                                <label>Start Date</label>
                                <input type="text" value={exp.startDate} onChange={(e) => updateExperience(idx, 'startDate', e.target.value)} placeholder="Jan 2020" />
                            </div>
                            <div>
                                <label>End Date</label>
                                <input type="text" value={exp.endDate} onChange={(e) => updateExperience(idx, 'endDate', e.target.value)} placeholder="Present" />
                            </div>
                        </div>
                        <label>Bullet Points</label>
                        {exp.bullets.map((bullet, bIdx) => (
                            <div key={bIdx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                <input
                                    type="text"
                                    value={bullet}
                                    onChange={(e) => updateBullet(idx, bIdx, e.target.value)}
                                    placeholder="Led a team of 12 engineers to deliver..."
                                    style={{ flex: 1 }}
                                />
                                {exp.bullets.length > 1 && (
                                    <button className="btn-icon" onClick={() => removeBullet(idx, bIdx)} style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>✕</button>
                                )}
                            </div>
                        ))}
                        <button className="btn btn-secondary btn-sm" onClick={() => addBullet(idx)} style={{ marginTop: 4 }}>+ Add Bullet</button>
                    </div>
                ))}
                {/* Sticky Add Role at bottom of experience card */}
                <div style={{ position: 'sticky', bottom: 0, background: 'var(--bg-card)', paddingTop: 12, paddingBottom: 4, borderTop: profile.experience.length > 0 ? '1px solid var(--border)' : 'none' }}>
                    <button className="btn btn-secondary btn-sm" onClick={addExperience} style={{ width: '100%' }}>+ Add Role</button>
                </div>
            </div>

            {/* Projects */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header">
                    <h2>🚀 Projects</h2>
                </div>
                {profile.projects.length === 0 && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Highlight key projects with links and details. These will be used during optimization when relevant.</p>
                )}
                {profile.projects.map((proj, idx) => (
                    <div key={proj.id} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: idx < profile.projects.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)' }}>Project #{idx + 1}</span>
                            <button className="btn-icon" onClick={() => removeProject(idx)} title="Remove" style={{ color: 'var(--danger)' }}>✕</button>
                        </div>
                        <div className="form-grid" style={{ marginBottom: 12 }}>
                            <div>
                                <label>Project Name</label>
                                <input type="text" value={proj.name} onChange={(e) => updateProject(idx, 'name', e.target.value)} placeholder="E-commerce Platform" />
                            </div>
                            <div>
                                <label>URL (optional)</label>
                                <input type="url" value={proj.url || ''} onChange={(e) => updateProject(idx, 'url', e.target.value)} placeholder="https://github.com/..." />
                            </div>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <label>Description</label>
                            <textarea
                                value={proj.description}
                                onChange={(e) => updateProject(idx, 'description', e.target.value)}
                                placeholder="Brief description of what the project does and your role..."
                                rows={2}
                            />
                        </div>
                        {/* Technologies */}
                        <div style={{ marginBottom: 12 }}>
                            <label>Technologies</label>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                <input
                                    type="text"
                                    value={projTechInput[proj.id] || ''}
                                    onChange={(e) => setProjTechInput((prev) => ({ ...prev, [proj.id]: e.target.value }))}
                                    onKeyDown={(e) => e.key === 'Enter' && addProjectTech(idx)}
                                    placeholder="React, Node.js..."
                                    style={{ flex: 1 }}
                                />
                                <button className="btn btn-secondary btn-sm" onClick={() => addProjectTech(idx)}>Add</button>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {proj.technologies.map((tech) => (
                                    <span key={tech} className="tag">
                                        {tech}
                                        <span className="remove" onClick={() => removeProjectTech(idx, tech)}>✕</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                        {/* Highlights */}
                        <label>Key Highlights</label>
                        {proj.highlights.map((h, hIdx) => (
                            <div key={hIdx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                <input
                                    type="text"
                                    value={h}
                                    onChange={(e) => updateHighlight(idx, hIdx, e.target.value)}
                                    placeholder="Reduced load time by 40% using..."
                                    style={{ flex: 1 }}
                                />
                                {proj.highlights.length > 1 && (
                                    <button className="btn-icon" onClick={() => removeHighlight(idx, hIdx)} style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>✕</button>
                                )}
                            </div>
                        ))}
                        <button className="btn btn-secondary btn-sm" onClick={() => addHighlight(idx)} style={{ marginTop: 4 }}>+ Add Highlight</button>
                    </div>
                ))}
                <div style={{ position: 'sticky', bottom: 0, background: 'var(--bg-card)', paddingTop: 12, paddingBottom: 4, borderTop: profile.projects.length > 0 ? '1px solid var(--border)' : 'none' }}>
                    <button className="btn btn-secondary btn-sm" onClick={addProject} style={{ width: '100%' }}>+ Add Project</button>
                </div>
            </div>

            {/* Skills */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header"><h2>🛠 Skills</h2></div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                        placeholder="Type a skill and press Enter"
                        style={{ flex: 1 }}
                    />
                    <button className="btn btn-secondary btn-sm" onClick={addSkill}>Add</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {profile.skills.map((skill) => (
                        <span key={skill} className="tag">
                            {skill}
                            <span className="remove" onClick={() => removeSkill(skill)}>✕</span>
                        </span>
                    ))}
                </div>
            </div>

            {/* Education */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header">
                    <h2>🎓 Education</h2>
                    <button className="btn btn-secondary btn-sm" onClick={addEducation}>+ Add</button>
                </div>
                {profile.education.map((edu, idx) => (
                    <div key={edu.id} className="form-grid" style={{ marginBottom: 12, alignItems: 'end' }}>
                        <div>
                            <label>School</label>
                            <input type="text" value={edu.school} onChange={(e) => updateEducation(idx, 'school', e.target.value)} placeholder="MIT" />
                        </div>
                        <div>
                            <label>Degree</label>
                            <input type="text" value={edu.degree} onChange={(e) => updateEducation(idx, 'degree', e.target.value)} placeholder="BS Computer Science" />
                        </div>
                        <div>
                            <label>Year</label>
                            <input type="text" value={edu.year} onChange={(e) => updateEducation(idx, 'year', e.target.value)} placeholder="2015" />
                        </div>
                        <div>
                            <button className="btn-icon" onClick={() => removeEducation(idx)} style={{ color: 'var(--danger)' }}>✕</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Floating Bottom Save Bar */}
            <div className="floating-save-bar">
                <span
                    className={`api-status ${apiKey ? 'connected' : 'disconnected'}`}
                    onClick={() => setActiveView('settings')}
                >
                    <span className="dot" />
                    {apiKey ? 'API Key Set' : 'No API Key'}
                </span>
                <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>
                    {saved ? '✓ Saved!' : saving ? 'Saving...' : '💾 Save Profile'}
                </button>
            </div>
        </div>
    );
}
