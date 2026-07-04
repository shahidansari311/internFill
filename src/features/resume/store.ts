import { create } from 'zustand';
import { db } from '@/shared/db';
import type { Resume } from './types';

interface ResumeState {
  resumes: Resume[];
  loading: boolean;
  error: string | null;

  // Actions
  loadResumes: () => Promise<void>;
  uploadResume: (name: string, file: File, profileId: number) => Promise<number>;
  deleteResume: (id: number) => Promise<void>;
  setDefaultResume: (id: number, profileId: number) => Promise<void>;
}

export const useResumeStore = create<ResumeState>((set, get) => ({
  resumes: [],
  loading: false,
  error: null,

  loadResumes: async () => {
    set({ loading: true, error: null });
    try {
      const list = await db.resumes.toArray();
      set({ resumes: list as Resume[], loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  uploadResume: async (name, file, profileId) => {
    set({ loading: true, error: null });
    try {
      // Check if it's the first resume for this profile
      const profileResumes = await db.resumes
        .where('profileId')
        .equals(profileId)
        .toArray();
      const isDefault = profileResumes.length === 0;

      const record = {
        name,
        fileName: file.name,
        mimeType: file.type || 'application/pdf',
        size: file.size,
        data: file, // File is a subclass of Blob, so this works directly
        profileId,
        isDefault,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const id = await db.resumes.add(record);
      await get().loadResumes();
      return id as number;
    } catch (err) {
      set({ error: String(err), loading: false });
      throw err;
    }
  },

  deleteResume: async (id) => {
    set({ loading: true, error: null });
    try {
      const resume = await db.resumes.get(id);
      await db.resumes.delete(id);

      // If deleted resume was default, set another one as default
      if (resume?.isDefault) {
        const remaining = await db.resumes
          .where('profileId')
          .equals(resume.profileId)
          .toArray();
        if (remaining.length > 0 && remaining[0]?.id) {
          await db.resumes.update(remaining[0].id, { isDefault: true });
        }
      }

      await get().loadResumes();
    } catch (err) {
      set({ error: String(err), loading: false });
      throw err;
    }
  },

  setDefaultResume: async (id, profileId) => {
    set({ loading: true, error: null });
    try {
      // Find all resumes for this profile
      const list = await db.resumes
        .where('profileId')
        .equals(profileId)
        .toArray();

      // Set all to false, target to true
      for (const res of list) {
        if (res.id) {
          await db.resumes.update(res.id, {
            isDefault: res.id === id,
            updatedAt: new Date(),
          });
        }
      }

      await get().loadResumes();
    } catch (err) {
      set({ error: String(err), loading: false });
      throw err;
    }
  },
}));
