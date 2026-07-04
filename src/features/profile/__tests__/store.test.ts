import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useProfileStore } from '../store';

// Mock encryption utilities to return raw/parsed JSON
vi.mock('@/shared/utils/encryption', () => ({
  encryptJSON: vi.fn(async (data) => JSON.stringify(data)),
  decryptJSON: vi.fn(async (str) => JSON.parse(str)),
}));

// Mock db
let mockProfiles: any[] = [];
let nextId = 1;

vi.mock('@/shared/db', () => {
  return {
    db: {
      profiles: {
        toArray: vi.fn(async () => [...mockProfiles]),
        add: vi.fn(async (record) => {
          const id = nextId++;
          const newRecord = { ...record, id };
          mockProfiles.push(newRecord);
          return id;
        }),
        update: vi.fn(async (id, record) => {
          mockProfiles = mockProfiles.map((p) =>
            p.id === id ? { ...p, ...record } : p
          );
        }),
        delete: vi.fn(async (id) => {
          mockProfiles = mockProfiles.filter((p) => p.id !== id);
        }),
      },
    },
  };
});

describe('useProfileStore', () => {
  beforeEach(() => {
    mockProfiles = [];
    nextId = 1;
    vi.clearAllMocks();

    // Reset Zustand store state
    useProfileStore.setState({
      profiles: [],
      activeProfileId: null,
      loading: false,
      error: null,
    });
  });

  it('creates and loads profiles', async () => {
    const store = useProfileStore.getState();

    // Create SDE profile
    const id1 = await store.createProfile('sde', 'My SDE Profile');
    expect(id1).toBe(1);
    expect(mockProfiles).toHaveLength(1);
    expect(mockProfiles[0].name).toBe('My SDE Profile');
    expect(mockProfiles[0].isActive).toBe(true); // First profile should be active

    // Create frontend profile
    const id2 = await store.createProfile('frontend', 'My Frontend Profile');
    expect(id2).toBe(2);
    expect(mockProfiles).toHaveLength(2);
    expect(mockProfiles[1].isActive).toBe(false); // Second profile should not be active

    // Load profiles
    await store.loadProfiles();
    const updatedState = useProfileStore.getState();
    expect(updatedState.profiles).toHaveLength(2);
    expect(updatedState.activeProfileId).toBe(1);
  });

  it('updates personal info and other sections', async () => {
    const store = useProfileStore.getState();
    const id = await store.createProfile('sde');

    await store.updatePersonalInfo(id, {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
      location: 'Ghaziabad, India',
      summary: 'Experienced SDE',
    });

    const updatedState = useProfileStore.getState();
    const profile = updatedState.profiles.find((p) => p.id === id);
    expect(profile?.personalInfo.firstName).toBe('John');
    expect(profile?.personalInfo.lastName).toBe('Doe');
    expect(profile?.personalInfo.email).toBe('john.doe@example.com');
  });

  it('switches active profile', async () => {
    const store = useProfileStore.getState();
    const id1 = await store.createProfile('sde');
    const id2 = await store.createProfile('frontend');

    expect(useProfileStore.getState().activeProfileId).toBe(id1);

    await store.setActiveProfile(id2);
    expect(useProfileStore.getState().activeProfileId).toBe(id2);
    expect(useProfileStore.getState().profiles.find((p) => p.id === id1)?.isActive).toBe(false);
    expect(useProfileStore.getState().profiles.find((p) => p.id === id2)?.isActive).toBe(true);
  });

  it('deletes profile', async () => {
    const store = useProfileStore.getState();
    const id1 = await store.createProfile('sde');
    const id2 = await store.createProfile('frontend');

    await store.deleteProfile(id1);
    expect(useProfileStore.getState().profiles).toHaveLength(1);
    expect(useProfileStore.getState().activeProfileId).toBe(id2);
  });
});
