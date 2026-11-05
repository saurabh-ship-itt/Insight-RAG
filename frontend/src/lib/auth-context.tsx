import React, { createContext, useContext, useState } from "react";
import { defaultUser, type LocalUser } from "./auth";

export type { LocalUser as User };

interface AuthContextType {
  user: LocalUser;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  getIdToken: () => Promise<string>;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: defaultUser,
  loading: false,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  logout: async () => {},
  getIdToken: async () => "local-token-saurabh-malhotra",
  isAuthModalOpen: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user] = useState<LocalUser>(defaultUser);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: false,
        signInWithGoogle: async () => {},
        signInWithEmail: async () => {},
        signUpWithEmail: async () => {},
        logout: async () => {},
        getIdToken: async () => "local-token-saurabh-malhotra",
        isAuthModalOpen: false,
        openAuthModal: () => {},
        closeAuthModal: () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
