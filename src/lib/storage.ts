// Local storage utilities for frontend-only data persistence

export const storage = {
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage error:', error);
    }
  },

  remove(key: string): void {
    localStorage.removeItem(key);
  },

  clear(): void {
    localStorage.clear();
  }
};

export const STORAGE_KEYS = {
  USER: 'unified_ops_user',
  CLIENTS: 'unified_ops_clients',
  PROJECTS: 'unified_ops_projects',
  OPPORTUNITIES: 'unified_ops_opportunities',
  NOTES: 'unified_ops_notes',
  WEBHOOKS: 'unified_ops_webhooks',
  SOPS: 'unified_ops_sops',
  SITE_PLANS: 'unified_ops_site_plans',
  CONTENT: 'unified_ops_content',
};
