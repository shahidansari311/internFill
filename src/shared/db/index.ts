import Dexie, { type EntityTable } from 'dexie';

// ── Profile Types ──
export interface ProfileRecord {
  id?: number;
  name: string;
  type: string;
  isActive: boolean;
  personalInfo: string; // Encrypted JSON
  education: string; // Encrypted JSON
  experience: string; // Encrypted JSON
  projects: string; // Encrypted JSON
  skills: string; // Encrypted JSON
  socialLinks: string; // Encrypted JSON
  certifications: string; // Encrypted JSON
  completionPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

// ── Resume Types ──
export interface ResumeRecord {
  id?: number;
  name: string;
  fileName: string;
  mimeType: string;
  size: number;
  data: Blob;
  profileId: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ── Application Types ──
export interface ApplicationRecord {
  id?: number;
  company: string;
  role: string;
  website: string;
  status: 'applied' | 'interview' | 'rejected' | 'offer';
  notes: string;
  profileId: number;
  appliedAt: Date;
  updatedAt: Date;
}

// ── Settings Types ──
export interface SettingsRecord {
  id?: number;
  key: string;
  value: string;
}

// ── Database Class ──
class InternFillDB extends Dexie {
  profiles!: EntityTable<ProfileRecord, 'id'>;
  resumes!: EntityTable<ResumeRecord, 'id'>;
  applications!: EntityTable<ApplicationRecord, 'id'>;
  settings!: EntityTable<SettingsRecord, 'id'>;

  constructor() {
    super('InternFillDB');

    this.version(1).stores({
      profiles:
        '++id, name, type, isActive, completionPercentage, createdAt, updatedAt',
      resumes: '++id, name, profileId, isDefault, createdAt',
      applications:
        '++id, company, role, status, profileId, appliedAt, updatedAt',
      settings: '++id, &key',
    });
  }
}

export const db = new InternFillDB();

// ── Database Helpers ──
export async function clearAllData(): Promise<void> {
  await db.profiles.clear();
  await db.resumes.clear();
  await db.applications.clear();
  await db.settings.clear();
}

export async function exportAllData(): Promise<{
  profiles: ProfileRecord[];
  applications: ApplicationRecord[];
}> {
  const profiles = await db.profiles.toArray();
  const applications = await db.applications.toArray();
  return { profiles, applications };
}
