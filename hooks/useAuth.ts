import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: false, // Désactiver le loading pour éviter les redirections
    error: null,
  });

  useEffect(() => {
    // Récupérer la session initiale
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          setAuthState(prev => ({
            ...prev,
            error: error.message,
            loading: false,
          }));
          return;
        }

        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
          error: null,
        });
      } catch (error: any) {
        setAuthState(prev => ({
          ...prev,
          error: error.message,
          loading: false,
        }));
      }
    };

    getInitialSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
          error: null,
        });
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthState(prev => ({
          ...prev,
          error: error.message,
          loading: false,
        }));
        throw error;
      }
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        error: error.message,
        loading: false,
      }));
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setAuthState(prev => ({
          ...prev,
          error: error.message,
          loading: false,
        }));
        throw error;
      }
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        error: error.message,
        loading: false,
      }));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        setAuthState(prev => ({
          ...prev,
          error: error.message,
          loading: false,
        }));
        throw error;
      }
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        error: error.message,
        loading: false,
      }));
      throw error;
    }
  };

  const sendMagicLink = async (email: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setAuthState(prev => ({
          ...prev,
          error: error.message,
          loading: false,
        }));
        throw error;
      }
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        error: error.message,
        loading: false,
      }));
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });

      if (error) {
        setAuthState(prev => ({
          ...prev,
          error: error.message,
          loading: false,
        }));
        throw error;
      }
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        error: error.message,
        loading: false,
      }));
      throw error;
    }
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    sendMagicLink,
    resetPassword,
    clearError,
  };
}; 