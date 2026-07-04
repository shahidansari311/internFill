/**
 * Zod v4 validation schemas for profile data.
 * Uses top-level functions per Zod v4 API (z.email(), z.url()).
 */
import { z } from 'zod';

// ── Personal Info Schema ──
export const personalInfoSchema = z.object({
  firstName: z
    .string()
    .min(1, { error: 'First name is required' })
    .max(50, { error: 'First name must be under 50 characters' }),
  lastName: z
    .string()
    .min(1, { error: 'Last name is required' })
    .max(50, { error: 'Last name must be under 50 characters' }),
  email: z.email({ error: 'Please enter a valid email address' }),
  phone: z
    .string()
    .min(1, { error: 'Phone number is required' })
    .regex(/^[+\d\s\-()]+$/, { error: 'Please enter a valid phone number' }),
  location: z.string().max(100),
  summary: z.string().max(1000),
});

// ── Education Schema ──
export const educationSchema = z.object({
  id: z.string(),
  university: z
    .string()
    .min(1, { error: 'University name is required' })
    .max(200),
  degree: z.string().min(1, { error: 'Degree is required' }).max(200),
  fieldOfStudy: z.string().max(200),
  startDate: z.string().min(1, { error: 'Start date is required' }),
  endDate: z.string(),
  cgpa: z.string().max(10),
  achievements: z.string().max(1000),
});

// ── Experience Schema ──
export const experienceSchema = z.object({
  id: z.string(),
  company: z
    .string()
    .min(1, { error: 'Company name is required' })
    .max(200),
  role: z.string().min(1, { error: 'Role is required' }).max(200),
  location: z.string().max(200),
  startDate: z.string().min(1, { error: 'Start date is required' }),
  endDate: z.string(),
  current: z.boolean(),
  description: z.string().max(2000),
  technologies: z.array(z.string()),
});

// ── Project Schema ──
export const projectSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(1, { error: 'Project name is required' })
    .max(200),
  description: z.string().max(2000),
  technologies: z.array(z.string()),
  liveUrl: z.string(),
  repoUrl: z.string(),
  startDate: z.string(),
  endDate: z.string(),
});

// ── Skill Schema ──
export const skillSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { error: 'Skill name is required' }).max(100),
  proficiency: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  category: z.string().max(50),
});

// ── Social Links Schema ──
export const socialLinksSchema = z.object({
  linkedin: z.string(),
  github: z.string(),
  portfolio: z.string(),
  twitter: z.string(),
  leetcode: z.string(),
  other: z.string(),
});

// ── Certification Schema ──
export const certificationSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(1, { error: 'Certification name is required' })
    .max(200),
  issuer: z.string().min(1, { error: 'Issuer is required' }).max(200),
  issueDate: z.string(),
  expiryDate: z.string(),
  credentialUrl: z.string(),
  credentialId: z.string(),
});

// ── Profile Type Schema ──
export const profileTypeSchema = z.enum([
  'sde',
  'frontend',
  'backend',
  'devops',
  'data-science',
]);

// ── Full Profile Schema ──
export const profileSchema = z.object({
  name: z.string().min(1, { error: 'Profile name is required' }).max(100),
  type: profileTypeSchema,
  personalInfo: personalInfoSchema,
  education: z.array(educationSchema),
  experience: z.array(experienceSchema),
  projects: z.array(projectSchema),
  skills: z.array(skillSchema),
  socialLinks: socialLinksSchema,
  certifications: z.array(certificationSchema),
});

// ── Inferred Types (from Zod) ──
export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;
export type EducationFormData = z.infer<typeof educationSchema>;
export type ExperienceFormData = z.infer<typeof experienceSchema>;
export type ProjectFormData = z.infer<typeof projectSchema>;
export type SkillFormData = z.infer<typeof skillSchema>;
export type SocialLinksFormData = z.infer<typeof socialLinksSchema>;
export type CertificationFormData = z.infer<typeof certificationSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
