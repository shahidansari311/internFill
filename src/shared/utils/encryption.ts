/**
 * AES-GCM encryption utilities using the Web Crypto API.
 * Used to encrypt sensitive user data before storing in IndexedDB.
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const STORAGE_KEY = 'internfill_encryption_key';

/**
 * Generate a new AES-GCM encryption key and store it in chrome.storage.local
 */
async function generateKey(): Promise<CryptoKey> {
  const key = await crypto.subtle.generateKey(
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );

  // Export and store the key
  const exported = await crypto.subtle.exportKey('jwk', key);
  try {
    await chrome.storage.local.set({ [STORAGE_KEY]: JSON.stringify(exported) });
  } catch {
    // Fallback: store in localStorage for development
    localStorage.setItem(STORAGE_KEY, JSON.stringify(exported));
  }

  return key;
}

/**
 * Retrieve the encryption key from chrome.storage.local, or generate a new one
 */
async function getKey(): Promise<CryptoKey> {
  let stored: string | null = null;

  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    stored = (result[STORAGE_KEY] as string | undefined) ?? null;
  } catch {
    // Fallback: use localStorage for development
    stored = localStorage.getItem(STORAGE_KEY);
  }

  if (stored) {
    const jwk = JSON.parse(stored) as JsonWebKey;
    return crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: ALGORITHM, length: KEY_LENGTH },
      true,
      ['encrypt', 'decrypt']
    );
  }

  return generateKey();
}

/**
 * Encrypt a string value using AES-GCM.
 * Returns a base64 string containing IV + ciphertext.
 */
export async function encrypt(plaintext: string): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoder = new TextEncoder();

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoder.encode(plaintext)
  );

  // Combine IV + ciphertext into a single array
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt a base64 string (IV + ciphertext) back to plaintext.
 */
export async function decrypt(encryptedBase64: string): Promise<string> {
  const key = await getKey();
  const combined = Uint8Array.from(atob(encryptedBase64), (c) =>
    c.charCodeAt(0)
  );

  const iv = combined.slice(0, IV_LENGTH);
  const ciphertext = combined.slice(IV_LENGTH);

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}

/**
 * Encrypt a JSON-serializable object
 */
export async function encryptJSON<T>(data: T): Promise<string> {
  return encrypt(JSON.stringify(data));
}

/**
 * Decrypt a base64 string and parse it as JSON
 */
export async function decryptJSON<T>(encryptedBase64: string): Promise<T> {
  const json = await decrypt(encryptedBase64);
  return JSON.parse(json) as T;
}
