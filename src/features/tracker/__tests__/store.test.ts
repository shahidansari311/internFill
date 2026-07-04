import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTrackerStore } from '../store';

// Mock db
let mockApplications: any[] = [];
let nextId = 1;

vi.mock('@/shared/db', () => {
  return {
    db: {
      applications: {
        toArray: vi.fn(async () => [...mockApplications]),
        add: vi.fn(async (record) => {
          const id = nextId++;
          const newRecord = { ...record, id };
          mockApplications.push(newRecord);
          return id;
        }),
        update: vi.fn(async (id, record) => {
          mockApplications = mockApplications.map((app) =>
            app.id === id ? { ...app, ...record } : app
          );
        }),
        delete: vi.fn(async (id) => {
          mockApplications = mockApplications.filter((app) => app.id !== id);
        }),
      },
    },
  };
});

describe('useTrackerStore', () => {
  beforeEach(() => {
    mockApplications = [];
    nextId = 1;
    vi.clearAllMocks();

    // Reset Zustand store state
    useTrackerStore.setState({
      applications: [],
      loading: false,
      error: null,
    });
  });

  it('adds and loads applications', async () => {
    const store = useTrackerStore.getState();

    const id1 = await store.addApplication({
      company: 'Google',
      role: 'SDE Intern',
      website: 'https://careers.google.com',
      status: 'applied',
      notes: 'Applied with SDE Profile',
      profileId: 1,
    });

    expect(id1).toBe(1);
    expect(mockApplications).toHaveLength(1);
    expect(mockApplications[0].company).toBe('Google');

    await store.loadApplications();
    const state = useTrackerStore.getState();
    expect(state.applications).toHaveLength(1);
    expect(state.applications[0]!.company).toBe('Google');
  });

  it('updates application status and fields', async () => {
    const store = useTrackerStore.getState();
    const id = await store.addApplication({
      company: 'Meta',
      role: 'Frontend Intern',
      website: '',
      status: 'applied',
      notes: '',
      profileId: 2,
    });

    await store.updateApplication(id, {
      status: 'interview',
      notes: 'Scheduled for next Tuesday',
    });

    await store.loadApplications();
    const state = useTrackerStore.getState();
    expect(state.applications[0]!.status).toBe('interview');
    expect(state.applications[0]!.notes).toBe('Scheduled for next Tuesday');
  });

  it('deletes applications', async () => {
    const store = useTrackerStore.getState();
    const id = await store.addApplication({
      company: 'Netflix',
      role: 'DevOps Intern',
      website: '',
      status: 'applied',
      notes: '',
      profileId: 1,
    });

    expect(mockApplications).toHaveLength(1);
    await store.deleteApplication(id);
    expect(mockApplications).toHaveLength(0);
  });
});
