import React, { createContext, useContext, useEffect, useState } from "react";
import { defaultUser, type LocalUser } from "./firebase";
import { API_BASE } from "../services/api";

export type { LocalUser as User };

interface AuthContextType {
  user: LocalUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
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

const STORAGE_KEY = "insightrag_user_session";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<LocalUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          getIdToken: async () => "local-token-" + parsed.uid,
        };
      }
    } catch {}
    return defaultUser;
  });

  const [loading, setLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync login with backend database audit log
  const recordBackendLogin = async (usr: LocalUser) => {
    try {
      const token = await usr.getIdToken();
      await fetch(`${API_BASE}/auth/record-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          uid: usr.uid,
          email: usr.email,
          name: usr.displayName,
          photo_url: usr.photoURL,
        }),
      });
    } catch (e) {
      console.warn("Could not log login to backend audit store:", e);
    }
  };

  useEffect(() => {
    if (user) {
      recordBackendLogin(user);
    }
  }, []);

  const saveUser = (newUser: LocalUser | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          uid: newUser.uid,
          email: newUser.email,
          displayName: newUser.displayName,
          photoURL: newUser.photoURL,
          emailVerified: newUser.emailVerified,
          providerData: newUser.providerData,
        })
      );
      recordBackendLogin(newUser);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const signInWithGoogle = async () => {
    saveUser(defaultUser);
  };

  const signInWithEmail = async (email: string) => {
    const updatedUser: LocalUser = {
      uid: "user-" + (email.split("@")[0] || "saurabh"),
      email: email,
      displayName: email.split("@")[0] || "Saurabh Malhotra",
      photoURL: null,
      emailVerified: true,
      getIdToken: async () => "local-token-" + email,
      providerData: [{ providerId: "password" }],
    };
    saveUser(updatedUser);
  };

  const signUpWithEmail = async (email: string, _pass: string, name?: string) => {
    const updatedUser: LocalUser = {
      uid: "user-" + (email.split("@")[0] || "saurabh"),
      email: email,
      displayName: name?.trim() || email.split("@")[0] || "Saurabh Malhotra",
      photoURL: null,
      emailVerified: true,
      getIdToken: async () => "local-token-" + email,
      providerData: [{ providerId: "password" }],
    };
    saveUser(updatedUser);
  };

  const logout = async () => {
    saveUser(null);
  };

  const getIdToken = async () => {
    return user ? await user.getIdToken() : null;
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
        getIdToken,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
