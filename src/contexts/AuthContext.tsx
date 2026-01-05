import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export type PlanType = 'free' | 'premium' | 'enterprise';

interface User {
  id: string;
  email: string;
  displayName: string | null;
  plan: PlanType;
  avatarUrl: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  viewAsUser: boolean;
  effectiveIsAdmin: boolean;
  isLoading: boolean;
  toggleViewMode: () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, displayName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updatePlan: (plan: PlanType) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const VIEW_MODE_KEY = 'burnermail_view_as_user';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [viewAsUser, setViewAsUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const effectiveIsAdmin = isAdmin && !viewAsUser;

  useEffect(() => {
    const storedViewMode = localStorage.getItem(VIEW_MODE_KEY);
    if (storedViewMode === 'true') {
      setViewAsUser(true);
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    // Check initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await fetchUserProfile(session.user);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (profile) {
        setUser({
          id: supabaseUser.id,
          email: profile.email,
          displayName: profile.display_name,
          plan: (profile.plan as PlanType) || 'free',
          avatarUrl: profile.avatar_url,
        });
      }

      // Check admin role using RPC function
      const { data: hasAdminRole } = await supabase.rpc('has_role', {
        _user_id: supabaseUser.id,
        _role: 'admin'
      });
      
      setIsAdmin(hasAdminRole === true);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const toggleViewMode = () => {
    const newValue = !viewAsUser;
    setViewAsUser(newValue);
    localStorage.setItem(VIEW_MODE_KEY, String(newValue));
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        await fetchUserProfile(data.user);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const signup = async (email: string, password: string, displayName?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || email.split('@')[0],
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        await fetchUserProfile(data.user);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = async () => {
    setViewAsUser(false);
    localStorage.removeItem(VIEW_MODE_KEY);
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  };

  const updatePlan = async (plan: PlanType) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ plan, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (!error) {
      setUser({ ...user, plan });
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin,
    viewAsUser,
    effectiveIsAdmin,
    isLoading,
    toggleViewMode,
    login,
    signup,
    logout,
    updatePlan,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
