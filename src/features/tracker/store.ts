import { create } from 'zustand';
import { db } from '@/shared/db';
import type { Application } from './types';

interface TrackerState {
  applications: Application[];
  loading: boolean;
  error: string | null;

  // Actions
  loadApplications: () => Promise<void>;
  addApplication: (app: Omit<Application, 'id' | 'appliedAt' | 'updatedAt'>) => Promise<number>;
  updateApplication: (id: number, data: Partial<Application>) => Promise<void>;
  deleteApplication: (id: number) => Promise<void>;
}

export const useTrackerStore = create<TrackerState>((set, get) => ({
  applications: [],
  loading: false,
  error: null,

  loadApplications: async () => {
    set({ loading: true, error: null });
    try {
      const list = await db.applications.toArray();
      set({ applications: list as Application[], loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  addApplication: async (app) => {
    set({ loading: true, error: null });
    try {
      const record = {
        ...app,
        appliedAt: new Date(),
        updatedAt: new Date(),
      };
      const id = await db.applications.add(record);
      await get().loadApplications();
      return id as number;
    } catch (err) {
      set({ error: String(err), loading: false });
      throw err;
    }
  },

  updateApplication: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const record = {
        ...data,
        updatedAt: new Date(),
      };
      await db.applications.update(id, record);
      await get().loadApplications();
    } catch (err) {
      set({ error: String(err), loading: false });
      throw err;
    }
  },

  deleteApplication: async (id) => {
    set({ loading: true, error: null });
    try {
      await db.applications.delete(id);
      await get().loadApplications();
    } catch (err) {
      set({ error: String(err), loading: false });
      throw err;
    }
  },
}));
