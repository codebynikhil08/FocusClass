import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  onAuthUserChanged 
} from '../services/authService';
import type { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<UserProfile>;
  register: (name: string, email: string, role: UserRole, password?: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  quickLoginAsTeacher: () => Promise<UserProfile>;
  quickLoginAsStudent: () => Promise<UserProfile>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsub = onAuthUserChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login = async (email: string, password?: string) => {
    const profile = await loginUser(email, password);
    setUser(profile);
    return profile;
  };

  const register = async (name: string, email: string, role: UserRole, password?: string) => {
    const profile = await registerUser(name, email, role, password);
    setUser(profile);
    return profile;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  const quickLoginAsTeacher = async () => {
    return await login('teacher@focusclass.edu');
  };

  const quickLoginAsStudent = async () => {
    return await login('rahul@student.edu');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        quickLoginAsTeacher,
        quickLoginAsStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
