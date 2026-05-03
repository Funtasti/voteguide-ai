"use client";

import { useState, useEffect, createContext, useContext } from "react";
import {
  ensureAnonymousAuth,
  saveProfileToFirestore,
  getProfileFromFirestore
} from "@/lib/firebase/services";
import { User } from "firebase/auth";

export type VoterProfile = {
  region: string;
  isFirstTimeVoter: boolean;
  ageGroup: string;
  concerns: string[];
};

type UserContextType = {
  profile: VoterProfile | null;
  saveProfile: (profile: VoterProfile) => Promise<void>;
  clearProfile: () => void;
  isHydrated: boolean;
  user: User | null;
  isSyncing: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState<VoterProfile | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const initAuthAndData = async () => {
      try {
        // 1. Ensure Auth
        const currentUser = await ensureAnonymousAuth();
        setUser(currentUser);

        // 2. Check Cloud Profile first
        const cloudProfile = await getProfileFromFirestore(currentUser.uid);

        if (cloudProfile) {
          setProfile(cloudProfile);
          localStorage.setItem("voteGuideProfile", JSON.stringify(cloudProfile));
        } else {
          // 3. Fallback to Local Storage
          const stored = localStorage.getItem("voteGuideProfile");
          if (stored) {
            const localProfile = JSON.parse(stored);
            setProfile(localProfile);
            // Sync local to cloud if auth just happened
            await saveProfileToFirestore(currentUser.uid, localProfile);
          }
        }
      } catch (e) {
        console.error("Initialization error:", e);
      } finally {
        setIsHydrated(true);
      }
    };

    initAuthAndData();
  }, []);

  const saveProfile = async (newProfile: VoterProfile) => {
    setIsSyncing(true);
    try {
      setProfile(newProfile);
      localStorage.setItem("voteGuideProfile", JSON.stringify(newProfile));

      if (user) {
        await saveProfileToFirestore(user.uid, newProfile);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const clearProfile = () => {
    setProfile(null);
    localStorage.removeItem("voteGuideProfile");
  };

  return (
    <UserContext.Provider value={{
      profile,
      saveProfile,
      clearProfile,
      isHydrated,
      user,
      isSyncing
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
