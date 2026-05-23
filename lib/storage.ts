const STORAGE_PREFIX = "promocaopro:";

export const storage = {
  getItem(key: string): string | null {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(STORAGE_PREFIX + key);
    } catch {
      return null;
    }
  },

  setItem(key: string, value: string): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_PREFIX + key, value);
    } catch {
      // quota exceeded or private mode
    }
  },

  removeItem(key: string): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
    } catch {
      // ignore
    }
  },
};
