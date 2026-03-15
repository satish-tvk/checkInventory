"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

interface AuthUser {
  token:    string;
  user_id:  number;
  username: string;
}

export interface UserProfile {
  id:                  number;
  business_name:       string;
  owner_name:          string;
  industry:            string;
  business_archetype:  string | null;
  risk_profile:        string | null;
  risk_score:          number | null;
  procurement_categories: string[];
}

interface AuthContextType {
  user:         AuthUser | null;
  profile:      UserProfile | null;
  login:        (user: AuthUser) => void;
  logout:       () => void;
  setProfile:   (p: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user:       null,
  profile:    null,
  login:      () => {},
  logout:     () => {},
  setProfile: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const fetchProfile = useCallback(async (user_id: number) => {
    try {
      const res = await fetch(`/api/auth/profile?user_id=${user_id}`);
      if (res.ok) {
        const data = await res.json() as UserProfile;
        setProfile(data);
        localStorage.setItem("onestopsmb_profile", JSON.stringify(data));
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("onestopsmb_auth");
      if (stored) {
        const authUser = JSON.parse(stored) as AuthUser;
        setUser(authUser);
        // Try cached profile first, then fetch fresh
        const cachedProfile = localStorage.getItem("onestopsmb_profile");
        if (cachedProfile) setProfile(JSON.parse(cachedProfile));
        fetchProfile(authUser.user_id);
      }
    } catch { /* ignore */ }
  }, [fetchProfile]);

  function login(authUser: AuthUser) {
    setUser(authUser);
    localStorage.setItem("onestopsmb_auth", JSON.stringify(authUser));
    fetchProfile(authUser.user_id);
  }

  function logout() {
    setUser(null);
    setProfile(null);
    localStorage.removeItem("onestopsmb_auth");
    localStorage.removeItem("onestopsmb_profile");
  }

  return (
    <AuthContext.Provider value={{ user, profile, login, logout, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
