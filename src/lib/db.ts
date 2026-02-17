import Dexie, { type EntityTable } from 'dexie';

// --- Type Definitions ---

export interface PersonalInfo {
    name: string;
    email: string;
    phone: string;
    linkedin: string;
    location: string;
    portfolio?: string;
    website?: string;
    github?: string;
}

export interface Experience {
    id: string;
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    bullets: string[];
}

export interface Project {
    id: string;
    name: string;
    description: string;
    url?: string;
    technologies: string[];
    highlights: string[];
}

export interface Education {
    id: string;
    school: string;
    degree: string;
    year: string;
}

export interface MasterProfile {
    id: string; // 'current_user'
    personalInfo: PersonalInfo;
    summary: string;
    experience: Experience[];
    projects: Project[];
    skills: string[];
    education: Education[];
    updatedAt: Date;
}

export interface JobDescription {
    id?: number;
    title: string;
    company: string;
    rawText: string;
    createdAt: Date;
}

export interface RubricBreakdown {
    keyword_match: {
        score: number;
        findings: string[];
    };
    formatting: {
        score: number;
        findings: string[];
    };
    job_alignment: {
        score: number;
        findings: string[];
    };
}

export interface OptimizedResume {
    id?: number;
    jobDescriptionId: number;
    optimizedSummary: string;
    optimizedExperience: {
        company: string;
        role: string;
        startDate: string;
        endDate: string;
        bullets: string[];
    }[];
    optimizedSkills: string[];
    score: number;
    breakdown: RubricBreakdown;
    suggestions: string[];
    createdAt: Date;
}

export interface CoverLetter {
    id?: number;
    jobDescriptionId: number;
    content: string;
    createdAt: Date;
}

// --- Database ---

const db = new Dexie('ResumeBuddyDB') as Dexie & {
    masterProfile: EntityTable<MasterProfile, 'id'>;
    jobDescriptions: EntityTable<JobDescription, 'id'>;
    resumes: EntityTable<OptimizedResume, 'id'>;
    coverLetters: EntityTable<CoverLetter, 'id'>;
};

db.version(2).stores({
    masterProfile: 'id, updatedAt',
    jobDescriptions: '++id, title, company, createdAt',
    resumes: '++id, jobDescriptionId, score, createdAt',
    coverLetters: '++id, jobDescriptionId, createdAt',
});

export { db };
