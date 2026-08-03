import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi } from '../lib/resources';
import { clearToken, getToken, registerUnauthorizedHandler, setToken } from '../lib/api';
import type { User } from '../types';

interface SessionUser {
  id: string;
  fullName: string;
  email: string;
}

interface AuthContextValue {
  user: SessionUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USER_KEY = 'rollout.user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      setUser(null);
      localStorage.removeItem(USER_KEY);
    });
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    // Verify the stored token is still valid and refresh user details.
    authApi
      .profile()
      .then((profile: User) => {
        const sessionUser = { id: profile._id, fullName: profile.fullName, email: profile.email };
        setUser(sessionUser);
        localStorage.setItem(USER_KEY, JSON.stringify(sessionUser));
      })
      .catch(() => {
        clearToken();
        localStorage.removeItem(USER_KEY);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const result = await authApi.login({ email, password });
    setToken(result.token);
    setUser(result.user);
    localStorage.setItem(USER_KEY, JSON.stringify(result.user));
  }

  async function register(fullName: string, email: string, password: string) {
    await authApi.register({ fullName, email, password });
    // Registration doesn't return a session — sign the user in right after.
    await login(email, password);
  }

  function logout() {
    clearToken();
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
