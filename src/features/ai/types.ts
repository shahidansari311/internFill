import type { Profile, PersonalInfo, Education, Experience, Project, Skill, SocialLinks, Certification } from '@/features/profile/types';

export interface AIGenerationRequest {
  profile: Profile;
  jobDescription: string;
  question?: string;
  maxLength?: number;
}

export interface AIGenerationResponse {
  text: string;
  tokensUsed?: number;
  modelUsed?: string;
}

export interface ResumeExtractionResponse {
  personalInfo: PersonalInfo;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: Skill[];
  socialLinks: SocialLinks;
  certifications: Certification[];
}

export interface IAIService {
  tailorResumeSummary(request: AIGenerationRequest): Promise<AIGenerationResponse>;
  generateCoverLetter(request: AIGenerationRequest): Promise<AIGenerationResponse>;
  answerCustomQuestion(request: AIGenerationRequest): Promise<AIGenerationResponse>;
  extractDetailsFromResume(file: Blob, mimeType: string): Promise<ResumeExtractionResponse>;
}
