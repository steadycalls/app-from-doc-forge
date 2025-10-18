import { storage, STORAGE_KEYS } from './storage';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export const auth = {
  login: (email: string, password: string): User | null => {
    // Simple mock authentication
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const user: User = {
      id: crypto.randomUUID(),
      email,
      firstName: email.split('@')[0],
      lastName: 'User',
      createdAt: new Date().toISOString(),
    };

    storage.set(STORAGE_KEYS.USER, user);
    return user;
  },

  signup: (email: string, password: string, firstName: string, lastName: string): User => {
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    if (!email.includes('@')) {
      throw new Error('Please enter a valid email');
    }

    const user: User = {
      id: crypto.randomUUID(),
      email,
      firstName,
      lastName,
      createdAt: new Date().toISOString(),
    };

    storage.set(STORAGE_KEYS.USER, user);
    return user;
  },

  logout: (): void => {
    storage.remove(STORAGE_KEYS.USER);
  },

  getCurrentUser: (): User | null => {
    return storage.get<User>(STORAGE_KEYS.USER);
  },

  isAuthenticated: (): boolean => {
    return !!storage.get<User>(STORAGE_KEYS.USER);
  },
};
