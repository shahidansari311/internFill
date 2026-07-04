/**
 * Zustand profile store with Dexie persistence.
 * Manages CRUD operations for user profiles.
 */
import { create } from 'zustand';
import { db, type ProfileRecord } from '@/shared/db';
import { encryptJSON, decryptJSON } from '@/shared/utils/encryption';
import { sanitizeObject } from '@/shared/utils/sanitize';
import type {
  Profile,
  PersonalInfo,
  Education,
  Experience,
  Project,
  Skill,
  SocialLinks,
  Certification,
  ProfileType,
} from './types';
import { createDefaultProfile, DEFAULT_PERSONAL_INFO, DEFAULT_SOCIAL_LINKS } from './types';

interface ProfileState {
  profiles: Profile[];
  activeProfileId: number | null;
  loading: boolean;
  error: string | null;

  // Actions
  loadProfiles: () => Promise<void>;
  createProfile: (type: ProfileType, name?: string) => Promise<number>;
  updateProfile: (id: number, data: Partial<Profile>) => Promise<void>;
  deleteProfile: (id: number) => Promise<void>;
  setActiveProfile: (id: number) => Promise<void>;
  getActiveProfile: () => Profile | null;
  getProfileCompletion: (id: number) => number;

  // Section Updates
  updatePersonalInfo: (id: number, data: PersonalInfo) => Promise<void>;
  updateEducation: (id: number, data: Education[]) => Promise<void>;
  updateExperience: (id: number, data: Experience[]) => Promise<void>;
  updateProjects: (id: number, data: Project[]) => Promise<void>;
  updateSkills: (id: number, data: Skill[]) => Promise<void>;
  updateSocialLinks: (id: number, data: SocialLinks) => Promise<void>;
  updateCertifications: (id: number, data: Certification[]) => Promise<void>;
}

// ── Profile completion calculator ──
function calculateCompletion(profile: Profile): number {
  let total = 0;
  let filled = 0;

  // Personal Info (30%)
  const pi = profile.personalInfo;
  const personalFields = [pi.firstName, pi.lastName, pi.email, pi.phone];
  total += personalFields.length;
  filled += personalFields.filter((f) => f && typeof f === 'string' && f.trim().length > 0).length;

  // Education (15%)
  total += 1;
  if (profile.education && profile.education.length > 0) filled += 1;

  // Experience (15%)
  total += 1;
  if (profile.experience && profile.experience.length > 0) filled += 1;

  // Projects (10%)
  total += 1;
  if (profile.projects && profile.projects.length > 0) filled += 1;

  // Skills (10%)
  total += 1;
  if (profile.skills && profile.skills.length > 0) filled += 1;

  // Social Links (15%)
  const sl = profile.socialLinks;
  const socialFields = [sl.linkedin, sl.github];
  total += socialFields.length;
  filled += socialFields.filter((f) => f && typeof f === 'string' && f.trim().length > 0).length;

  // Summary (5%)
  total += 1;
  if (pi.summary && typeof pi.summary === 'string' && pi.summary.trim().length > 0) filled += 1;

  return Math.round((filled / total) * 100);
}

// ── Encrypt profile for storage ──
async function encryptProfile(profile: Profile): Promise<ProfileRecord> {
  const sanitized = sanitizeObject(profile.personalInfo as unknown as Record<string, unknown>) as unknown as PersonalInfo;

  return {
    id: profile.id,
    name: profile.name,
    type: profile.type,
    isActive: profile.isActive,
    personalInfo: await encryptJSON(sanitized),
    education: await encryptJSON(profile.education),
    experience: await encryptJSON(profile.experience),
    projects: await encryptJSON(profile.projects),
    skills: await encryptJSON(profile.skills),
    socialLinks: await encryptJSON(profile.socialLinks),
    certifications: await encryptJSON(profile.certifications),
    completionPercentage: calculateCompletion(profile),
    createdAt: profile.createdAt,
    updatedAt: new Date(),
  };
}

// ── Decrypt profile from storage ──
export async function decryptProfile(record: ProfileRecord): Promise<Profile> {
  try {
    return {
      id: record.id,
      name: record.name,
      type: record.type as ProfileType,
      isActive: record.isActive,
      personalInfo: await decryptJSON<PersonalInfo>(record.personalInfo),
      education: await decryptJSON<Education[]>(record.education),
      experience: await decryptJSON<Experience[]>(record.experience),
      projects: await decryptJSON<Project[]>(record.projects),
      skills: await decryptJSON<Skill[]>(record.skills),
      socialLinks: await decryptJSON<SocialLinks>(record.socialLinks),
      certifications: await decryptJSON<Certification[]>(record.certifications),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  } catch {
    // If decryption fails (key changed), return defaults
    return {
      id: record.id,
      name: record.name,
      type: record.type as ProfileType,
      isActive: record.isActive,
      personalInfo: { ...DEFAULT_PERSONAL_INFO },
      education: [],
      experience: [],
      projects: [],
      skills: [],
      socialLinks: { ...DEFAULT_SOCIAL_LINKS },
      certifications: [],
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profiles: [],
  activeProfileId: null,
  loading: false,
  error: null,

  loadProfiles: async () => {
    set({ loading: true, error: null });
    try {
      const records = await db.profiles.toArray();
      const profiles = await Promise.all(records.map(decryptProfile));
      const active = profiles.find((p) => p.isActive);
      set({
        profiles,
        activeProfileId: active?.id ?? profiles[0]?.id ?? null,
        loading: false,
      });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  createProfile: async (type, name) => {
    const defaults = createDefaultProfile(type, name);
    const isFirst = get().profiles.length === 0;
    const profile: Profile = { ...defaults, isActive: isFirst };

    const record = await encryptProfile(profile);
    const id = await db.profiles.add(record);

    const newProfile = { ...profile, id: id as number };
    set((state) => ({
      profiles: [...state.profiles, newProfile],
      activeProfileId: isFirst ? (id as number) : state.activeProfileId,
    }));

    return id as number;
  },

  updateProfile: async (id, data) => {
    const profile = get().profiles.find((p) => p.id === id);
    if (!profile) return;

    const updated = { ...profile, ...data, updatedAt: new Date() };
    const record = await encryptProfile(updated);
    await db.profiles.update(id, record);

    set((state) => ({
      profiles: state.profiles.map((p) => (p.id === id ? updated : p)),
    }));
  },

  deleteProfile: async (id) => {
    await db.profiles.delete(id);
    set((state) => {
      const remaining = state.profiles.filter((p) => p.id !== id);
      return {
        profiles: remaining,
        activeProfileId:
          state.activeProfileId === id
            ? remaining[0]?.id ?? null
            : state.activeProfileId,
      };
    });
  },

  setActiveProfile: async (id) => {
    const { profiles } = get();
    // Deactivate all, activate selected
    for (const p of profiles) {
      if (p.id && p.id !== id && p.isActive) {
        await db.profiles.update(p.id, { isActive: false });
      }
    }
    await db.profiles.update(id, { isActive: true });

    set((state) => ({
      profiles: state.profiles.map((p) => ({
        ...p,
        isActive: p.id === id,
      })),
      activeProfileId: id,
    }));
  },

  getActiveProfile: () => {
    const { profiles, activeProfileId } = get();
    return profiles.find((p) => p.id === activeProfileId) ?? null;
  },

  getProfileCompletion: (id) => {
    const profile = get().profiles.find((p) => p.id === id);
    return profile ? calculateCompletion(profile) : 0;
  },

  // ── Section update methods ──
  updatePersonalInfo: async (id, data) => {
    await get().updateProfile(id, { personalInfo: data });
  },

  updateEducation: async (id, data) => {
    await get().updateProfile(id, { education: data });
  },

  updateExperience: async (id, data) => {
    await get().updateProfile(id, { experience: data });
  },

  updateProjects: async (id, data) => {
    await get().updateProfile(id, { projects: data });
  },

  updateSkills: async (id, data) => {
    await get().updateProfile(id, { skills: data });
  },

  updateSocialLinks: async (id, data) => {
    await get().updateProfile(id, { socialLinks: data });
  },

  updateCertifications: async (id, data) => {
    await get().updateProfile(id, { certifications: data });
  },
}));
