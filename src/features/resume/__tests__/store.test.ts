import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useResumeStore } from '../store';

// Mock db
let mockResumes: any[] = [];
let nextId = 1;

vi.mock('@/shared/db', () => {
  return {
    db: {
      resumes: {
        toArray: vi.fn(async () => [...mockResumes]),
        add: vi.fn(async (record) => {
          const id = nextId++;
          const newRecord = { ...record, id };
          mockResumes.push(newRecord);
          return id;
        }),
        update: vi.fn(async (id, record) => {
          mockResumes = mockResumes.map((res) =>
            res.id === id ? { ...res, ...record } : res
          );
        }),
        delete: vi.fn(async (id) => {
          mockResumes = mockResumes.filter((res) => res.id !== id);
        }),
        get: vi.fn(async (id) => {
          return mockResumes.find((res) => res.id === id) || null;
        }),
        where: vi.fn((field) => ({
          equals: vi.fn((val) => ({
            toArray: vi.fn(async () => mockResumes.filter((res) => res[field] === val)),
          })),
        })),
      },
    },
  };
});

describe('useResumeStore', () => {
  beforeEach(() => {
    mockResumes = [];
    nextId = 1;
    vi.clearAllMocks();

    // Reset Zustand store state
    useResumeStore.setState({
      resumes: [],
      loading: false,
      error: null,
    });
  });

  it('uploads first resume as default', async () => {
    const store = useResumeStore.getState();
    const file = new File(['dummy content'], 'resume.pdf', { type: 'application/pdf' });

    const id = await store.uploadResume('SDE Resume', file, 1);
    expect(id).toBe(1);
    expect(mockResumes).toHaveLength(1);
    expect(mockResumes[0].isDefault).toBe(true); // First resume should be active default
  });

  it('uploads subsequent resumes as non-default and allows switching default', async () => {
    const store = useResumeStore.getState();
    const file1 = new File(['dummy 1'], 'resume1.pdf', { type: 'application/pdf' });
    const file2 = new File(['dummy 2'], 'resume2.pdf', { type: 'application/pdf' });

    const id1 = await store.uploadResume('SDE Resume 1', file1, 1);
    // Push the record manually to mock DB for subsequent calls to where()
    mockResumes[0].id = id1;

    const id2 = await store.uploadResume('SDE Resume 2', file2, 1);
    expect(mockResumes[1].isDefault).toBe(false); // Second resume should not be default

    // Change default
    await store.setDefaultResume(id2, 1);
    expect(mockResumes[0].isDefault).toBe(false);
    expect(mockResumes[1].isDefault).toBe(true);
  });

  it('deletes resumes and updates defaults if necessary', async () => {
    const store = useResumeStore.getState();
    const file1 = new File(['dummy 1'], 'resume1.pdf', { type: 'application/pdf' });

    const id = await store.uploadResume('SDE Resume', file1, 1);
    expect(mockResumes).toHaveLength(1);

    await store.deleteResume(id);
    expect(mockResumes).toHaveLength(0);
  });
});
