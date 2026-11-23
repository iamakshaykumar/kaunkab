export const PROGRESS_KEY = 'kaunkab:read';

export interface Progress {
  getRead(): string[];
  markRead(slug: string): void;
  isRead(slug: string): boolean;
}

/** Reading progress in localStorage. Never throws; works as a no-op without storage. */
export function createProgress(storage: () => Storage | null): Progress {
  const store = (): Storage | null => {
    try {
      return storage();
    } catch {
      return null;
    }
  };

  const getRead = (): string[] => {
    try {
      const raw = store()?.getItem(PROGRESS_KEY);
      if (!raw) return [];
      const v = JSON.parse(raw);
      return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
    } catch {
      return [];
    }
  };

  return {
    getRead,
    isRead: (slug) => getRead().includes(slug),
    markRead(slug) {
      const read = getRead();
      if (read.includes(slug)) return;
      try {
        store()?.setItem(PROGRESS_KEY, JSON.stringify([...read, slug]));
      } catch {
        /* storage full or blocked — ignore */
      }
    },
  };
}

export const browserProgress = () =>
  createProgress(() => (typeof localStorage === 'undefined' ? null : localStorage));
