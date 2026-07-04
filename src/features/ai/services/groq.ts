import type { IAIService, AIGenerationRequest, AIGenerationResponse, ResumeExtractionResponse } from '../types';
import { extractTextFromPDF } from '@/shared/utils/pdf';
import { MockAIService } from './answer-generator';

function parseJSONResponse(text: string): any {
  let cleaned = text.trim();
  
  // Remove markdown code blocks if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/, '').trim();
  }
  
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('[InternFill] Failed to parse JSON response. Raw text:', text, err);
    // Fallback: If it's not valid JSON, try to extract the text manually using regex
    const match = cleaned.match(/"text"\s*:\s*"([\s\S]*?)"/);
    if (match && match[1]) {
      return { text: match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n') };
    }
    // As ultimate fallback, return the raw text as the answer!
    return { text: cleaned };
  }
}

export class GroqAIService implements IAIService {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'llama-3.3-70b-versatile') {
    this.apiKey = apiKey;
    this.model = model;
  }

  private async callGroq(messages: { role: string; content: string }[]): Promise<string> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        response_format: { type: 'json_object' },
        temperature: 0.1, // Low temperature for high extraction fidelity
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error('Empty response from Groq API');
    }
    return text;
  }

  async tailorResumeSummary(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    const skillsList = request.profile.skills.map((s) => s.name).join(', ');
    const experiences = request.profile.experience.map(
      (exp) => `${exp.role} at ${exp.company} (${exp.startDate} to ${exp.endDate || 'Present'})`
    ).join('; ');

    const messages = [
      {
        role: 'system',
        content: 'You are an expert career advisor. Tailor the candidate\'s resume summary to align with the target job description. Return your response as a JSON object with a single "text" key containing the summary. Do not include conversational filler.',
      },
      {
        role: 'user',
        content: `Candidate Name: ${request.profile.name}
Skills: ${skillsList || 'Software engineering skills'}
Experience: ${experiences || 'Software developer experience'}

Target Job Description:
${request.jobDescription}

Generate a short, high-impact resume summary (2-3 sentences max).`,
      },
    ];

    const responseText = await this.callGroq(messages);
    const parsed = JSON.parse(responseText);

    return {
      text: parsed.text || '',
      modelUsed: `groq-${this.model}`,
    };
  }

  async generateCoverLetter(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    const pi = request.profile.personalInfo;
    const university = request.profile.education?.[0]?.university || 'our institution';
    const skillsList = request.profile.skills.map((s) => s.name).join(', ');
    const latestRole = request.profile.experience?.[0]?.role || 'Developer';
    const latestCompany = request.profile.experience?.[0]?.company || 'Tech Solutions';

    const messages = [
      {
        role: 'system',
        content: 'You are an expert career writer. Generate a professional, compelling cover letter based on the candidate\'s profile and the target job description. Return your response as a JSON object with a single "text" key containing the full cover letter text. Do not include any other conversational content.',
      },
      {
        role: 'user',
        content: `Candidate Details:
Name: ${pi.firstName || 'First'} ${pi.lastName || 'Last'}
Latest Role: ${latestRole} at ${latestCompany}
Education: ${university}
Skills: ${skillsList}

Target Job Description:
${request.jobDescription}

Write a cover letter under 400 words.`,
      },
    ];

    const responseText = await this.callGroq(messages);
    const parsed = parseJSONResponse(responseText);

    let textVal = parsed.text || parsed.answer || parsed.response || '';
    if (!textVal && typeof parsed === 'object') {
      const values = Object.values(parsed);
      if (values.length > 0 && typeof values[0] === 'string') {
        textVal = values[0];
      }
    }
    if (!textVal && typeof parsed === 'string') {
      textVal = parsed;
    }

    return {
      text: textVal,
      modelUsed: `groq-${this.model}`,
    };
  }

  async answerCustomQuestion(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    const question = request.question || 'Describe a difficult technical problem you solved.';
    const skills = request.profile.skills.map((s) => s.name).slice(0, 5).join(', ');
    const experience = JSON.stringify(request.profile.experience);
    const projects = JSON.stringify(request.profile.projects);
    const education = JSON.stringify(request.profile.education);

    const messages = [
      {
        role: 'system',
        content: 'You are a job applicant writing responses to custom application questions. Use details from the candidate\'s profile to write a professional and concise answer. Return your response as a JSON object with a single "text" key containing your answer.',
      },
      {
        role: 'user',
        content: `Question:
${question}

Candidate Profile Details:
Skills: ${skills}
Experience: ${experience}
Projects: ${projects}
Education: ${education}

Write a professional answer. Keep it concise (1-2 paragraphs max). Make sure to include relevant links (like github repositories or live websites of projects, or portfolio link) if appropriate for the question.`,
      },
    ];

    const responseText = await this.callGroq(messages);
    const parsed = parseJSONResponse(responseText);

    let textVal = parsed.text || parsed.answer || parsed.response || '';
    if (!textVal && typeof parsed === 'object') {
      const values = Object.values(parsed);
      if (values.length > 0 && typeof values[0] === 'string') {
        textVal = values[0];
      }
    }
    if (!textVal && typeof parsed === 'string') {
      textVal = parsed;
    }

    return {
      text: textVal,
      modelUsed: `groq-${this.model}`,
    };
  }

  async extractDetailsFromResume(file: Blob, mimeType: string): Promise<ResumeExtractionResponse> {
    if (!mimeType.includes('pdf')) {
      throw new Error('AI resume extraction only supports PDF files. Please convert your file to PDF format.');
    }

    const textContent = await extractTextFromPDF(file);
    if (!textContent.trim()) {
      throw new Error('Could not extract any selectable text from this PDF file. Please ensure it is not a scanned image.');
    }

    const messages = [
      {
        role: 'system',
        content: `You are an expert resume parser. Analyze the uploaded resume text and extract all details into a structured JSON object. 

Ensure that dates are strictly formatted as YYYY-MM if possible.
Make sure to extract all sections: personalInfo, education, experience, projects, skills, socialLinks, and certifications.
For skills, classify their proficiency (one of 'beginner', 'intermediate', 'advanced', 'expert') and category.
If a field or section is not found in the resume, leave it empty or null (e.g. empty array for list fields, empty string/null for text fields). Do not invent or guess information.

Return ONLY a JSON object matching this schema structure:
{
  "personalInfo": {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "summary": "string"
  },
  "education": [
    {
      "university": "string",
      "degree": "string",
      "fieldOfStudy": "string",
      "startDate": "string (YYYY-MM)",
      "endDate": "string (YYYY-MM)",
      "cgpa": "string",
      "achievements": "string"
    }
  ],
  "experience": [
    {
      "company": "string",
      "role": "string",
      "location": "string",
      "startDate": "string (YYYY-MM)",
      "endDate": "string (YYYY-MM)",
      "current": boolean,
      "description": "string",
      "technologies": ["string"]
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string"],
      "liveUrl": "string",
      "repoUrl": "string",
      "startDate": "string (YYYY-MM)",
      "endDate": "string (YYYY-MM)"
    }
  ],
  "skills": [
    {
      "name": "string",
      "proficiency": "beginner | intermediate | advanced | expert",
      "category": "string"
    }
  ],
  "socialLinks": {
    "linkedin": "string",
    "github": "string",
    "portfolio": "string",
    "twitter": "string",
    "leetcode": "string",
    "other": "string"
  },
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "issueDate": "string (YYYY-MM)",
      "expiryDate": "string (YYYY-MM)",
      "credentialUrl": "string",
      "credentialId": "string"
    }
  ]
}`,
      },
      {
        role: 'user',
        content: `Resume text contents:
-------------------------
${textContent}
-------------------------`,
      },
    ];

    const responseText = await this.callGroq(messages);
    const parsed = parseJSONResponse(responseText);

    const sanitizeStr = (val: any) => (typeof val === 'string' ? val : '');
    const addId = (item: any) => ({ ...item, id: crypto.randomUUID() });

    const pi = parsed.personalInfo || {};
    const sl = parsed.socialLinks || {};

    return {
      personalInfo: {
        firstName: sanitizeStr(pi.firstName),
        lastName: sanitizeStr(pi.lastName),
        email: sanitizeStr(pi.email),
        phone: sanitizeStr(pi.phone),
        location: sanitizeStr(pi.location),
        summary: sanitizeStr(pi.summary),
      },
      education: (parsed.education || []).map((edu: any) => ({
        ...addId(edu),
        university: sanitizeStr(edu.university),
        degree: sanitizeStr(edu.degree),
        fieldOfStudy: sanitizeStr(edu.fieldOfStudy),
        startDate: sanitizeStr(edu.startDate),
        endDate: sanitizeStr(edu.endDate),
        cgpa: sanitizeStr(edu.cgpa),
        achievements: sanitizeStr(edu.achievements),
      })),
      experience: (parsed.experience || []).map((exp: any) => ({
        ...addId(exp),
        company: sanitizeStr(exp.company),
        role: sanitizeStr(exp.role),
        location: sanitizeStr(exp.location),
        startDate: sanitizeStr(exp.startDate),
        endDate: sanitizeStr(exp.endDate),
        current: !!exp.current,
        description: sanitizeStr(exp.description),
        technologies: Array.isArray(exp.technologies) ? exp.technologies.map(sanitizeStr) : [],
      })),
      projects: (parsed.projects || []).map((proj: any) => ({
        ...addId(proj),
        name: sanitizeStr(proj.name),
        description: sanitizeStr(proj.description),
        technologies: Array.isArray(proj.technologies) ? proj.technologies.map(sanitizeStr) : [],
        liveUrl: sanitizeStr(proj.liveUrl),
        repoUrl: sanitizeStr(proj.repoUrl),
        startDate: sanitizeStr(proj.startDate),
        endDate: sanitizeStr(proj.endDate),
      })),
      skills: (parsed.skills || []).map((skill: any) => ({
        ...addId(skill),
        name: sanitizeStr(skill.name),
        proficiency: ['beginner', 'intermediate', 'advanced', 'expert'].includes(skill.proficiency) ? skill.proficiency : 'intermediate',
        category: sanitizeStr(skill.category),
      })),
      socialLinks: {
        linkedin: sanitizeStr(sl.linkedin),
        github: sanitizeStr(sl.github),
        portfolio: sanitizeStr(sl.portfolio),
        twitter: sanitizeStr(sl.twitter),
        leetcode: sanitizeStr(sl.leetcode),
        other: sanitizeStr(sl.other),
      },
      certifications: (parsed.certifications || []).map((cert: any) => ({
        ...addId(cert),
        name: sanitizeStr(cert.name),
        issuer: sanitizeStr(cert.issuer),
        issueDate: sanitizeStr(cert.issueDate),
        expiryDate: sanitizeStr(cert.expiryDate),
        credentialUrl: sanitizeStr(cert.credentialUrl),
        credentialId: sanitizeStr(cert.credentialId),
      })),
    };
  }
}

/**
 * Factory function to retrieve either the MockAIService or GroqAIService depending on user settings.
 */
export async function getAIService(): Promise<IAIService> {
  try {
    const result = await chrome.storage.local.get('internfill-settings');
    const settingsStr = result['internfill-settings'] as string;
    let apiKey = '';
    let model = 'llama-3.3-70b-versatile';

    if (settingsStr) {
      const settings = JSON.parse(settingsStr);
      apiKey = settings.groqApiKey || '';
      model = settings.groqModel || 'llama-3.3-70b-versatile';
    }

    if (!apiKey && import.meta.env.VITE_GROQ_API) {
      apiKey = import.meta.env.VITE_GROQ_API;
    }

    if (apiKey && apiKey.trim()) {
      return new GroqAIService(apiKey.trim(), model);
    }
  } catch (e) {
    console.error('Error fetching settings for AI service:', e);
  }
  return new MockAIService();
}
