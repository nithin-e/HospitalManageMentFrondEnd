import React, { createContext, useContext, ReactNode } from 'react';

interface AuthContextProps {
  currentUser: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const value = {
    currentUser: 'John Doe', // Dummy user for UI purposes
    loading: false,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
