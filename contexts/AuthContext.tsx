'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { User } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

const STORAGE_KEY = 'aurora_user_cache';
const SYNC_TIMEOUT = 10000; // 10 segundos de timeout

// Função para salvar usuário no localStorage
const saveUserToStorage = (user: User | null) => {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    console.error('Erro ao salvar usuário no storage:', error);
  }
};

// Função para recuperar usuário do localStorage
const getUserFromStorage = (): User | null => {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error('Erro ao recuperar usuário do storage:', error);
  }
  return null;
};

// Função para fetch com timeout
const fetchWithTimeout = async (url: string, options: RequestInit, timeout: number): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const syncUserWithDatabase = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      const response = await fetchWithTimeout('/api/auth/sync-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoUrl: firebaseUser.photoURL,
        }),
      }, SYNC_TIMEOUT);

      if (!response.ok) {
        throw new Error('Erro ao sincronizar usuário');
      }

      const { user: dbUser } = await response.json();
      setUser(dbUser);
      saveUserToStorage(dbUser);
      return dbUser;
    } catch (error) {
      console.error('Erro ao sincronizar usuário:', error);
      // Se falhar o sync, tenta usar o cache local
      const cachedUser = getUserFromStorage();
      if (cachedUser) {
        console.log('Usando usuário do cache local');
        setUser(cachedUser);
        return cachedUser;
      }
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Timeout de segurança para evitar loading infinito
    const safetyTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.warn('Auth timeout - usando cache local se disponível');
        const cachedUser = getUserFromStorage();
        if (cachedUser) {
          setUser(cachedUser);
        }
        setLoading(false);
      }
    }, SYNC_TIMEOUT + 2000); // 12 segundos total

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;

      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        try {
          await syncUserWithDatabase(firebaseUser);
        } catch (error) {
          console.error('Erro no sync:', error);
          // Mesmo em erro, tenta usar cache
          const cachedUser = getUserFromStorage();
          if (cachedUser) {
            setUser(cachedUser);
          }
        }
      } else {
        setUser(null);
        saveUserToStorage(null);
      }

      if (isMounted) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      await syncUserWithDatabase(result.user);
    } catch (error) {
      console.error('Erro ao fazer login com Google:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
      saveUserToStorage(null); // Limpa o cache local
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  };

  const value = {
    user,
    firebaseUser,
    loading,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
