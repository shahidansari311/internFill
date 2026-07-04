/**
 * Profile feature types.
 * Defines all data structures for user profile management.
 */

// ── Profile Types (job role categories) ──
export type ProfileType =
  | 'sde'
  | 'frontend'
  | 'backend'
  | 'devops'
  | 'data-science'
  | string;

const baseLabels: Record<string, string> = {
  sde: 'SDE (Full Stack)',
  frontend: 'Frontend Developer',
  backend: 'Backend Developer',
  devops: 'DevOps Engineer',
  'data-science': 'Data Scientist',
};

export const PROFILE_TYPE_LABELS = new Proxy(baseLabels, {
  get(target, prop) {
    if (typeof prop === 'string') {
      return target[prop] || prop;
    }
    return undefined;
  },
}) as unknown as Record<string, string>;

// ── Personal Information ──
export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
}

// ── Education ──
export interface Education {
  id: string;
  university: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  cgpa: string;
  achievements: string;
}

// ── Experience ──
export interface Experience {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  technologies: string[];
}

// ── Project ──
export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  liveUrl: string;
  repoUrl: string;
  startDate: string;
  endDate: string;
}

// ── Skill ──
export type SkillProficiency = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface Skill {
  id: string;
  name: string;
  proficiency: SkillProficiency;
  category: string;
}

// ── Social Links ──
export interface SocialLinks {
  linkedin: string;
  github: string;
  portfolio: string;
  twitter: string;
  leetcode: string;
  other: string;
}

// ── Certification ──
export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  credentialUrl: string;
  credentialId: string;
}

// ── Complete Profile ──
export interface Profile {
  id?: number;
  name: string;
  type: ProfileType;
  isActive: boolean;
  personalInfo: PersonalInfo;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: Skill[];
  socialLinks: SocialLinks;
  certifications: Certification[];
  createdAt: Date;
  updatedAt: Date;
}

// ── Default Values ──
export const DEFAULT_PERSONAL_INFO: PersonalInfo = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  location: '',
  summary: '',
};

export const DEFAULT_SOCIAL_LINKS: SocialLinks = {
  linkedin: '',
  github: '',
  portfolio: '',
  twitter: '',
  leetcode: '',
  other: '',
};

export function createDefaultProfile(
  type: ProfileType = 'sde',
  name?: string
): Omit<Profile, 'id'> {
  return {
    name: name || PROFILE_TYPE_LABELS[type] || '',
    type,
    isActive: false,
    personalInfo: { ...DEFAULT_PERSONAL_INFO },
    education: [],
    experience: [],
    projects: [],
    skills: [],
    socialLinks: { ...DEFAULT_SOCIAL_LINKS },
    certifications: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function createEducation(): Education {
  return {
    id: crypto.randomUUID(),
    university: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    cgpa: '',
    achievements: '',
  };
}

export function createExperience(): Experience {
  return {
    id: crypto.randomUUID(),
    company: '',
    role: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    technologies: [],
  };
}

export function createProject(): Project {
  return {
    id: crypto.randomUUID(),
    name: '',
    description: '',
    technologies: [],
    liveUrl: '',
    repoUrl: '',
    startDate: '',
    endDate: '',
  };
}

export function createSkill(): Skill {
  return {
    id: crypto.randomUUID(),
    name: '',
    proficiency: 'beginner',
    category: '',
  };
}

export function createCertification(): Certification {
  return {
    id: crypto.randomUUID(),
    name: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    credentialUrl: '',
    credentialId: '',
  };
}
