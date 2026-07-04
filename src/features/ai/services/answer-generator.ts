import type { IAIService, AIGenerationRequest, AIGenerationResponse, ResumeExtractionResponse } from '../types';

/**
 * Mock AI service implementation.
 * Simulates calling LLM endpoints for tailoring resumes, cover letters, and questions.
 */
export class MockAIService implements IAIService {
  async tailorResumeSummary(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    await new Promise((r) => setTimeout(r, 800));
    const skillsList = request.profile.skills.map((s) => s.name).slice(0, 5).join(', ');
    const name = request.profile.name;

    const text = `Results-oriented ${name} Specialist with a strong foundation in software design. Proven ability to build scalable features, skilled in ${
      skillsList || 'modern development stacks'
    }. Eager to leverage this background to contribute to the engineering team.`;

    return {
      text,
      tokensUsed: 75,
      modelUsed: 'internfill-llama-3-mock',
    };
  }

  async generateCoverLetter(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    await new Promise((r) => setTimeout(r, 1200));
    const pi = request.profile.personalInfo;
    const university = request.profile.education?.[0]?.university || 'our institution';
    const skillsList = request.profile.skills.map((s) => s.name).slice(0, 5).join(', ');
    const latestRole = request.profile.experience?.[0]?.role || 'Developer';
    const latestCompany = request.profile.experience?.[0]?.company || 'Tech Solutions';

    const text = `Dear Hiring Manager,

I am writing to express my enthusiastic interest in joining your team. As a student/alumnus of ${university} with a focus on ${request.profile.name}, I am excited about the opportunity to bring my technical skills and projects to your organization.

During my time as a ${latestRole} at ${latestCompany}, I successfully developed solutions using ${
      skillsList || 'modern software patterns'
    }. I pride myself on writing clean, maintainable code and collaborating effectively in cross-functional teams.

I would welcome the opportunity to discuss how my qualifications align with your engineering needs. Thank you for your time and consideration.

Sincerely,
${pi.firstName || 'First'} ${pi.lastName || 'Last'}`;

    return {
      text,
      tokensUsed: 195,
      modelUsed: 'internfill-llama-3-mock',
    };
  }

  async answerCustomQuestion(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    await new Promise((r) => setTimeout(r, 1000));
    const question = request.question || 'Describe a difficult technical problem you solved.';
    const skills = request.profile.skills.map((s) => s.name).slice(0, 4).join(', ');

    let text = '';
    const qLower = question.toLowerCase();

    if (qLower.includes('why') || qLower.includes('fit') || qLower.includes('interest')) {
      text = `I am excited about this opportunity because it aligns with my focus on ${
        request.profile.name
      } development. I am a strong fit due to my experience with ${
        skills || 'software construction'
      } and my commitment to agile execution.`;
    } else if (qLower.includes('project') || qLower.includes('link') || qLower.includes('work')) {
      const projectsList = request.profile.projects.map((p) => 
        `- ${p.name}: ${p.description}` + 
        (p.repoUrl ? ` Code: ${p.repoUrl}` : '') + 
        (p.liveUrl ? ` Live: ${p.liveUrl}` : '')
      ).join('\n');
      text = projectsList || `Here are my projects:\n- TaskFlow: A collaborative task management application. Code: https://github.com/alexdev/taskflow\n- Portfolio: Personal website showing my projects. Live: https://alexdev.example.com`;
    } else if (qLower.includes('conflict') || qLower.includes('team') || qLower.includes('disagreement')) {
      text = `In a previous academic project, a teammate and I disagreed on database schemas. I resolved this by setting up a benchmarking session to compare query times, letting data guide our ultimate architectural choice.`;
    } else {
      // Default technical challenge answer
      text = `In my previous role, I optimized a slow data retrieval path. By introducing caching and refactoring database queries, I reduced peak response latencies by over 40%, proving the efficacy of my technical methods.`;
    }

    return {
      text,
      tokensUsed: 120,
      modelUsed: 'internfill-llama-3-mock',
    };
  }

  async extractDetailsFromResume(_file: Blob, mimeType: string): Promise<ResumeExtractionResponse> {
    console.log('[MockAIService] Extracting details from file of type:', mimeType);
    await new Promise((r) => setTimeout(r, 1500)); // Simulate network latency

    return {
      personalInfo: {
        firstName: 'Alex',
        lastName: 'Developer',
        email: 'alex.dev@example.com',
        phone: '+1 (555) 019-2834',
        location: 'San Francisco, CA',
        summary: 'Passionate software engineering student with experience in React, TypeScript, and modern web tech. Eager to solve challenging problems and build scalable web applications.',
      },
      education: [
        {
          id: crypto.randomUUID(),
          university: 'State University',
          degree: 'Bachelor of Science',
          fieldOfStudy: 'Computer Science',
          startDate: '2022-09',
          endDate: '2026-06',
          cgpa: '3.85',
          achievements: "Dean's List (All semesters), 1st Place in Local Hackathon",
        },
      ],
      experience: [
        {
          id: crypto.randomUUID(),
          company: 'ByteTech Solutions',
          role: 'Software Engineer Intern',
          location: 'Remote',
          startDate: '2024-06',
          endDate: '2024-09',
          current: false,
          description: 'Designed and implemented interactive React components, reducing page load times by 20%. Collaborated with designers to deliver sleek web interfaces. Maintained a test coverage of over 85% with Vitest.',
          technologies: ['React', 'TypeScript', 'CSS', 'Vitest'],
        },
      ],
      projects: [
        {
          id: crypto.randomUUID(),
          name: 'TaskFlow',
          description: 'A collaborative task management application with drag-and-drop workflow status columns, built with React and TailwindCSS.',
          technologies: ['React', 'HTML', 'CSS', 'JavaScript'],
          liveUrl: 'https://taskflow-demo.example.com',
          repoUrl: 'https://github.com/alexdev/taskflow',
          startDate: '2023-10',
          endDate: '2023-12',
        },
      ],
      skills: [
        {
          id: crypto.randomUUID(),
          name: 'JavaScript',
          proficiency: 'expert',
          category: 'Languages',
        },
        {
          id: crypto.randomUUID(),
          name: 'TypeScript',
          proficiency: 'advanced',
          category: 'Languages',
        },
        {
          id: crypto.randomUUID(),
          name: 'React',
          proficiency: 'expert',
          category: 'Frameworks',
        },
        {
          id: crypto.randomUUID(),
          name: 'CSS',
          proficiency: 'advanced',
          category: 'Frontend',
        },
      ],
      socialLinks: {
        linkedin: 'https://linkedin.com/in/alexdeveloper',
        github: 'https://github.com/alexdev',
        portfolio: 'https://alexdev.example.com',
        twitter: 'https://twitter.com/alexdev',
        leetcode: 'https://leetcode.com/alexdev',
        other: '',
      },
      certifications: [
        {
          id: crypto.randomUUID(),
          name: 'AWS Certified Cloud Practitioner',
          issuer: 'Amazon Web Services',
          issueDate: '2024-01',
          expiryDate: '2027-01',
          credentialUrl: 'https://aws.amazon.com',
          credentialId: 'AWS-CCP-12345',
        },
      ],
    };
  }
}
