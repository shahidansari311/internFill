import { describe, it, expect, beforeEach } from 'vitest';
import { getFieldValue, fillForm } from '../filler';
import type { Profile } from '@/features/profile/types';

const mockProfile: Profile = {
  id: 1,
  name: 'SDE Profile',
  type: 'sde',
  isActive: true,
  personalInfo: {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    phone: '1234567890',
    location: 'San Francisco, CA',
    summary: 'A skilled developer.',
  },
  education: [
    {
      id: '1',
      university: 'Stanford University',
      degree: 'BS',
      fieldOfStudy: 'Computer Science',
      startDate: '2022-09',
      endDate: '2026-06',
      cgpa: '3.9',
      achievements: '',
    },
  ],
  experience: [],
  projects: [],
  skills: [],
  socialLinks: {
    linkedin: 'https://linkedin.com/in/janedoe',
    github: 'https://github.com/janedoe',
    portfolio: 'https://janedoe.me',
    twitter: '',
    leetcode: '',
    other: '',
  },
  certifications: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Autofill Filler', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('getFieldValue', () => {
    it('retrieves personalInfo fields', async () => {
      expect(await getFieldValue(mockProfile, 'firstName')).toBe('Jane');
      expect(await getFieldValue(mockProfile, 'email')).toBe('jane.doe@example.com');
    });

    it('retrieves socialLinks fields', async () => {
      expect(await getFieldValue(mockProfile, 'linkedin')).toBe('https://linkedin.com/in/janedoe');
    });

    it('retrieves education fields', async () => {
      expect(await getFieldValue(mockProfile, 'university')).toBe('Stanford University');
      expect(await getFieldValue(mockProfile, 'graduationYear')).toBe('2026');
    });
  });

  describe('fillForm', () => {
    it('fills form inputs on page and triggers events', async () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <label for="fn">First Name</label>
        <input id="fn" />
        
        <label for="em">Email</label>
        <input id="em" />
      `;
      document.body.appendChild(container);

      const fnInput = document.getElementById('fn') as HTMLInputElement;
      const emInput = document.getElementById('em') as HTMLInputElement;

      let fnEventFired = false;
      fnInput.addEventListener('input', () => {
        fnEventFired = true;
      });

      const result = await fillForm(mockProfile);

      expect(result.filled).toBe(2);
      expect(fnInput.value).toBe('Jane');
      expect(emInput.value).toBe('jane.doe@example.com');
      expect(fnEventFired).toBe(true);
    });
  });
});
