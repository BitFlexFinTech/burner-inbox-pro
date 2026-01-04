import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/mockDatabase';
import type { User, PlanType } from '@/types/database';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  viewAsUser: boolean;
  effectiveIsAdmin: boolean;
  toggleViewMode: () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, displayName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updatePlan: (plan: PlanType) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'burnermail_auth_user_id';
const VIEW_MODE_KEY = 'burnermail_view_as_user';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [viewAsUser, setViewAsUser] = useState(false);

  // Effective admin status (false if viewing as user)
  const effectiveIsAdmin = isAdmin && !viewAsUser;

  useEffect(() => {
    const storedUserId = localStorage.getItem(AUTH_STORAGE_KEY);
    const storedViewMode = localStorage.getItem(VIEW_MODE_KEY);
    
    if (storedUserId) {
      const storedUser = db.getUser(storedUserId);
      if (storedUser) {
        setUser(storedUser);
        setIsAdmin(db.isAdmin(storedUserId));
      }
    }
    
    if (storedViewMode === 'true') {
      setViewAsUser(true);
    }
  }, []);

  const toggleViewMode = () => {
    const newValue = !viewAsUser;
    setViewAsUser(newValue);
    localStorage.setItem(VIEW_MODE_KEY, String(newValue));
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const existingUser = db.getUserByEmail(email);
    
    // Check if user requires password validation
    if (db.requiresPassword(email)) {
      if (!db.validatePassword(email, password)) {
        return { success: false, error: 'Invalid email or password' };
      }
    }
    
    if (existingUser) {
      setUser(existingUser);
      setIsAdmin(db.isAdmin(existingUser.id));
      setViewAsUser(false);
      localStorage.setItem(AUTH_STORAGE_KEY, existingUser.id);
      localStorage.removeItem(VIEW_MODE_KEY);
      
      db.addAuditLog({
        userId: existingUser.id,
        action: 'user_login',
        entityType: 'user',
        entityId: existingUser.id,
        metadata: { email },
      });
      
      return { success: true };
    }

    // Create new user on login attempt (demo mode simplification)
    const newUser = db.createUser({
      email,
      displayName: email.split('@')[0],
      plan: 'free',
    });
    
    setUser(newUser);
    setIsAdmin(false);
    setViewAsUser(false);
    localStorage.setItem(AUTH_STORAGE_KEY, newUser.id);
    localStorage.removeItem(VIEW_MODE_KEY);
    
    db.addAuditLog({
      userId: newUser.id,
      action: 'user_login',
      entityType: 'user',
      entityId: newUser.id,
      metadata: { email },
    });

    return { success: true };
  };

  const signup = async (email: string, _password: string, displayName?: string): Promise<{ success: boolean; error?: string }> => {
    const existingUser = db.getUserByEmail(email);
    if (existingUser) {
      return { success: false, error: 'User already exists with this email' };
    }

    const newUser = db.createUser({
      email,
      displayName: displayName || email.split('@')[0],
      plan: 'free',
    });

    setUser(newUser);
    setIsAdmin(false);
    localStorage.setItem(AUTH_STORAGE_KEY, newUser.id);

    db.addAuditLog({
      userId: newUser.id,
      action: 'user_signup',
      entityType: 'user',
      entityId: newUser.id,
      metadata: { email },
    });

    return { success: true };
  };

  const logout = () => {
    if (user) {
      db.addAuditLog({
        userId: user.id,
        action: 'user_logout',
        entityType: 'user',
        entityId: user.id,
        metadata: {},
      });
    }
    setUser(null);
    setIsAdmin(false);
    setViewAsUser(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(VIEW_MODE_KEY);
  };

  const updatePlan = (plan: PlanType) => {
    if (user) {
      const updated = db.updateUser(user.id, { plan });
      if (updated) {
        setUser(updated);
        db.addAuditLog({
          userId: user.id,
          action: 'plan_updated',
          entityType: 'user',
          entityId: user.id,
          metadata: { newPlan: plan },
        });
      }
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin,
    viewAsUser,
    effectiveIsAdmin,
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
