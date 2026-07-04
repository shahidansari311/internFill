import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for Chrome storage API with fallback to localStorage.
 * Syncs state across popup and options pages.
 */
export function useStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);

  // Load initial value
  useEffect(() => {
    const load = async () => {
      try {
        const result = await chrome.storage.local.get(key);
        if (result[key] !== undefined) {
          setValue(JSON.parse(result[key] as string) as T);
        }
      } catch {
        // Fallback to localStorage
        try {
          const stored = localStorage.getItem(`internfill-${key}`);
          if (stored) {
            setValue(JSON.parse(stored) as T);
          }
        } catch {
          // Use default value
        }
      }
      setLoading(false);
    };
    load();
  }, [key]);

  // Listen for external changes
  useEffect(() => {
    const listener = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === 'local' && changes[key]) {
        try {
          setValue(JSON.parse(changes[key].newValue as string) as T);
        } catch {
          // Invalid JSON
        }
      }
    };

    try {
      chrome.storage.onChanged.addListener(listener);
      return () => chrome.storage.onChanged.removeListener(listener);
    } catch {
      // Chrome API not available (dev mode)
      return undefined;
    }
  }, [key]);

  const updateValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof newValue === 'function'
            ? (newValue as (prev: T) => T)(prev)
            : newValue;

        const serialized = JSON.stringify(resolved);

        // Save to chrome storage
        try {
          chrome.storage.local.set({ [key]: serialized });
        } catch {
          // Fallback to localStorage
          try {
            localStorage.setItem(`internfill-${key}`, serialized);
          } catch {
            // Storage not available
          }
        }

        return resolved;
      });
    },
    [key]
  );

  return [value, updateValue, loading];
}
