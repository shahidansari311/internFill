/**
 * Test setup file — mocks Chrome extension APIs for jsdom environment.
 */
import { vi } from 'vitest';

// Mock chrome APIs
const chromeMock = {
  runtime: {
    onInstalled: { addListener: vi.fn() },
    onMessage: { addListener: vi.fn() },
    sendMessage: vi.fn(),
    getManifest: vi.fn(() => ({ version: '1.0.0' })),
    openOptionsPage: vi.fn(),
    id: 'test-extension-id',
  },
  storage: {
    local: {
      get: vi.fn((_key: string) => Promise.resolve({})),
      set: vi.fn(() => Promise.resolve()),
      remove: vi.fn(() => Promise.resolve()),
    },
    onChanged: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  tabs: {
    query: vi.fn(() => Promise.resolve([{ id: 1, url: 'https://example.com' }])),
    sendMessage: vi.fn(() => Promise.resolve()),
  },
  contextMenus: {
    create: vi.fn(),
    onClicked: { addListener: vi.fn() },
  },
};

Object.defineProperty(globalThis, 'chrome', {
  value: chromeMock,
  writable: true,
});

// Mock crypto.randomUUID if not available
if (!globalThis.crypto?.randomUUID) {
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      ...globalThis.crypto,
      randomUUID: () =>
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        }),
      getRandomValues: (arr: Uint8Array) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256);
        }
        return arr;
      },
      subtle: {
        generateKey: vi.fn(),
        encrypt: vi.fn(),
        decrypt: vi.fn(),
        exportKey: vi.fn(),
        importKey: vi.fn(),
      },
    },
    writable: true,
  });
}
