/**
 * Rubric & System Prompt constants derived from basicinfo.md
 */

export const RUBRIC_WEIGHTS = {
    keyword_match: { weight: 40, label: 'Keyword Match' },
    formatting: { weight: 20, label: 'Formatting' },
    job_alignment: { weight: 40, label: 'Job Alignment' },
} as const;

export const PASSING_SCORE = 80;

export const ACTION_VERBS = {
    leadership: [
        'Directed', 'Orchestrated', 'Mobilized', 'Spearheaded', 'Championed',
        'Formulated', 'Devised', 'Architected',
    ],
    technical: [
        'Engineered', 'Streamlined', 'Optimized',
        'Interpreted', 'Synthesized', 'Quantified',
        'Forecasted', 'Diagnosed', 'Uncovered',
    ],
    sales: [
        'Negotiated', 'Persuaded', 'Articulated',
        'Amplified', 'Boosted', 'Accelerated', 'Capitalized',
    ],
    general: [
        'Achieved', 'Attained', 'Decreased', 'Maximized', 'Enhanced',
    ],
};

export const FORMATTING_RULES = [
    'Use chronological or hybrid format',
    'Standard headings: Professional Experience, Education, Skills, Certifications',
    'Simple fonts: Arial, Calibri, Times New Roman (10-12pt)',
    'Standard bullet points, left-aligned text',
    'NO tables, images, graphics, headers/footers, or columns',
    'Max 2 pages, focus on last 10-15 years',
];

export const SENIOR_EXPERIENCE_RULES = [
    'Lead with keyword-rich headline and summary',
    'Highlight years of experience upfront (e.g., "15+ years in...")',
    'Showcase leadership achievements with metrics',
    'Use action verbs + quantifiable results in bullets',
    'Prioritize job-matching roles first',
    'List skills with specifics (tools, certifications), avoid generic lists',
];

/**
 * The System Prompt sent to Gemini alongside each optimization request.
 */
export const SYSTEM_PROMPT = `You are an expert ATS Resume Optimizer. Your single goal is to rewrite the user's resume content to maximize its ATS compatibility score against a specific Job Description, targeting 80%+ match.

## RULES (Non-Negotiable)

### Action Verbs
Always start bullet points with strong action verbs. Prefer these categories:
- **Leadership**: ${ACTION_VERBS.leadership.join(', ')}
- **Technical**: ${ACTION_VERBS.technical.join(', ')}
- **Sales**: ${ACTION_VERBS.sales.join(', ')}
- **General**: ${ACTION_VERBS.general.join(', ')}
- NEVER use weak verbs like "responsible for", "helped", "assisted", "worked on".

### Senior Experience
- Highlight years of experience upfront in the summary (e.g., "15+ years in executive sales leadership").
- Every bullet must have a quantifiable metric (%, $, count, timeframe).
- Prioritize roles and bullets that directly match the Job Description.

### Formatting
- Output must be plain text compatible. NO tables, NO columns, NO graphics.
- Use standard bullet points only.

### Keyword Strategy
- Extract exact keywords, phrases, job titles, and skills from the Job Description.
- Incorporate them naturally throughout summary, experience, and skills.
- Aim for 70-80% keyword match rate. Do NOT stuff keywords unnaturally.
- Include both acronyms and full forms (e.g., "Enterprise Resource Planning (ERP)").

## SCORING RUBRIC
You must also grade the optimized resume using this rubric:
- **Keyword Match (40%)**: Count job-specific terms and their frequency in context.
- **Formatting (20%)**: Is the output plain-text clean? No tables/columns/graphics?
- **Job Alignment (40%)**: Do experience level, skills/tools, and quantified achievements mirror the JD?

## OUTPUT FORMAT
You MUST respond with valid JSON only. No markdown, no code fences, no explanation text.
Use this exact structure:
{
  "optimized_summary": "string - the rewritten professional summary",
  "optimized_experience": [
    {
      "company": "string",
      "role": "string",
      "startDate": "string",
      "endDate": "string",
      "bullets": ["string - each bullet starts with an action verb and includes metrics"]
    }
  ],
  "optimized_skills": ["string - prioritized, job-relevant skills"],
  "score": {
    "total": number,
    "breakdown": {
      "keyword_match": { "score": number, "findings": ["string"] },
      "formatting": { "score": number, "findings": ["string"] },
      "job_alignment": { "score": number, "findings": ["string"] }
    }
  },
  "suggestions": ["string - top 3-5 specific improvements if score < 80"]
}`;

/**
 * Cover letter system prompt
 */
export const COVER_LETTER_PROMPT = `You are an expert cover letter writer. Your goal is to write a compelling, tailored cover letter that complements the ATS-optimized resume.

## RULES
- Address the specific job requirements from the Job Description
- Reference the candidate's relevant experience, projects, and skills from their profile
- Use a professional but personable tone
- Keep it concise: 3-4 paragraphs, under 400 words
- Highlight quantified achievements that match the JD
- Include a strong opening that hooks the reader
- End with a clear call to action

## OUTPUT FORMAT
You MUST respond with valid JSON only. No markdown, no code fences, no explanation text.
{
  "cover_letter": "string - the complete cover letter text with paragraph breaks as \\n\\n",
  "key_matches": ["string - top 3-5 JD requirements addressed in the letter"]
}`;

/**
 * Constructs the full user prompt for a single optimization request.
 */
export function buildUserPrompt(
    jobDescription: string,
    profileSummary: string,
    experience: Array<{ company: string; role: string; startDate: string; endDate: string; bullets: string[] }>,
    skills: string[],
    projects?: Array<{ name: string; description: string; url?: string; technologies: string[]; highlights: string[] }>
): string {
    const expText = experience
        .map(
            (e) =>
                `### ${e.role} at ${e.company} (${e.startDate} – ${e.endDate})\n${e.bullets.map((b) => `- ${b}`).join('\n')}`
        )
        .join('\n\n');

    let projectsText = '';
    if (projects && projects.length > 0) {
        projectsText = `\n\n### Key Projects\n${projects.map((p) =>
            `**${p.name}**${p.url ? ` (${p.url})` : ''}\n${p.description}\nTech: ${p.technologies.join(', ')}\n${p.highlights.map((h) => `- ${h}`).join('\n')}`
        ).join('\n\n')}`;
    }

    return `## JOB DESCRIPTION
${jobDescription}

## MY CURRENT RESUME

### Professional Summary
${profileSummary}

### Experience
${expText}${projectsText}

### Skills
${skills.join(', ')}

---
Optimize my resume for the above Job Description. Follow all rules and return valid JSON only.`;
}

/**
 * Constructs the user prompt for cover letter generation.
 */
export function buildCoverLetterPrompt(
    jobDescription: string,
    profileSummary: string,
    experience: Array<{ company: string; role: string; startDate: string; endDate: string; bullets: string[] }>,
    skills: string[],
    projects?: Array<{ name: string; description: string; url?: string; technologies: string[]; highlights: string[] }>
): string {
    const expText = experience
        .map((e) => `${e.role} at ${e.company} (${e.startDate} – ${e.endDate}): ${e.bullets.slice(0, 3).join('; ')}`)
        .join('\n');

    let projectsText = '';
    if (projects && projects.length > 0) {
        projectsText = `\n\nKey Projects:\n${projects.map((p) => `- ${p.name}: ${p.description}`).join('\n')}`;
    }

    return `## JOB DESCRIPTION
${jobDescription}

## CANDIDATE PROFILE

Summary: ${profileSummary}

Experience:
${expText}${projectsText}

Skills: ${skills.join(', ')}

---
Write a tailored cover letter for this Job Description. Return valid JSON only.`;
}
