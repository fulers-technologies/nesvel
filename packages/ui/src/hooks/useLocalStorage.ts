'use client';

import { useEffect, useState } from 'react';

/**
 * Custom hook for managing state that persists in localStorage.
 *
 * This hook provides a way to store state in the browser's localStorage,
 * ensuring data persists across page reloads and browser sessions. It
 * automatically synchronizes with localStorage and handles SSR scenarios.
 *
 * @param key - The localStorage key to store the value under
 * @param initialValue - The initial value if no stored value exists
 * @returns A tuple containing the stored value and a setter function
 *
 * @example
 * ```tsx
 * function ThemeToggle() {
 *   const [theme, setTheme] = useLocalStorage("theme", "light")
 *
 *   return (
 *     <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
 *       Current theme: {theme}
 *     </button>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Storing complex objects
 * function UserPreferences() {
 *   const [preferences, setPreferences] = useLocalStorage("user-prefs", {
 *     notifications: true,
 *     language: "en",
 *     fontSize: 16
 *   })
 *
 *   const toggleNotifications = () => {
 *     setPreferences({
 *       ...preferences,
 *       notifications: !preferences.notifications
 *     })
 *   }
 *
 *   return <button onClick={toggleNotifications}>Toggle Notifications</button>
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With function updater
 * function Counter() {
 *   const [count, setCount] = useLocalStorage("count", 0)
 *
 *   return (
 *     <button onClick={() => setCount(prev => prev + 1)}>
 *       Count: {count}
 *     </button>
 *   )
 * }
 * ```
 *
 * @remarks
 * - Returns initialValue during SSR to prevent hydration mismatches
 * - Automatically serializes/deserializes values using JSON
 * - Handles localStorage errors gracefully (e.g., quota exceeded, private browsing)
 * - Supports function updaters like useState
 * - Synchronizes across tabs/windows using storage events
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  /**
   * State to store the current value.
   * We use a lazy initializer to avoid unnecessary localStorage reads
   * on every render. The function only runs on initial mount.
   */
  const [storedValue, setStoredValue] = useState<T>(() => {
    /**
     * During SSR, localStorage is not available.
     * Return the initial value to prevent hydration mismatches.
     */
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      /**
       * Attempt to retrieve the value from localStorage.
       * If it doesn't exist, localStorage.getItem returns null.
       */
      const item = window.localStorage.getItem(key);

      /**
       * Parse and return the stored value if it exists,
       * otherwise return the initial value.
       */
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error: Error | any) {
      /**
       * Handle errors that might occur during localStorage access:
       * - SecurityError: localStorage is disabled (private browsing)
       * - QuotaExceededError: storage limit reached
       * - SyntaxError: invalid JSON in storage
       *
       * In all error cases, fall back to the initial value.
       */
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  /**
   * Custom setter function that updates both state and localStorage.
   * Supports both direct values and function updaters (like useState).
   *
   * @param value - The new value or a function that receives the previous value
   */
  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      /**
       * Allow value to be a function (like useState).
       * This enables patterns like: setValue(prev => prev + 1)
       */
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      /**
       * Update React state with the new value.
       * This will trigger a re-render with the new value.
       */
      setStoredValue(valueToStore);

      /**
       * Save the value to localStorage if we're in a browser environment.
       * We serialize the value to JSON for storage.
       */
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));

        /**
         * Dispatch a custom storage event for cross-tab synchronization.
         * The native storage event only fires in other tabs, not the current one,
         * so we dispatch a custom event that our own listener can catch.
         */
        window.dispatchEvent(
          new StorageEvent('storage', {
            key,
            newValue: JSON.stringify(valueToStore),
            storageArea: window.localStorage,
          })
        );
      }
    } catch (error: Error | any) {
      /**
       * Handle errors that might occur during localStorage writes:
       * - QuotaExceededError: storage quota exceeded
       * - SecurityError: localStorage access denied
       *
       * We log the error but don't throw to prevent breaking the app.
       */
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  useEffect(() => {
    /**
     * Early return if we're not in a browser environment.
     */
    if (typeof window === 'undefined') {
      return;
    }

    /**
     * Handler for the storage event, which fires when localStorage
     * is modified in another tab or window. This enables cross-tab
     * synchronization of the stored value.
     *
     * @param event - The storage event containing the changed key and value
     */
    const handleStorageChange = (event: StorageEvent) => {
      /**
       * Only update if the changed key matches our key.
       * The storage event fires for all localStorage changes,
       * so we need to filter for our specific key.
       */
      if (event.key !== key) {
        return;
      }

      /**
       * If the key was removed from localStorage (newValue is null),
       * reset to the initial value.
       */
      if (event.newValue === null) {
        setStoredValue(initialValue);
        return;
      }

      try {
        /**
         * Parse the new value from JSON and update state.
         * This keeps all tabs/windows in sync.
         */
        const newValue = JSON.parse(event.newValue) as T;
        setStoredValue(newValue);
      } catch (error: Error | any) {
        /**
         * If parsing fails, log the error and keep the current value.
         */
        console.error(`Error parsing storage event for key "${key}":`, error);
      }
    };

    /**
     * Listen for storage events to enable cross-tab synchronization.
     * This allows changes in one tab to be reflected in all other tabs.
     */
    window.addEventListener('storage', handleStorageChange);

    /**
     * Cleanup: remove the event listener when the component unmounts
     * or when the key/initialValue changes.
     */
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue]); // Re-run if key or initialValue changes

  return [storedValue, setValue];
}
