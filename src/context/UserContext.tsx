"use client";

import { useState, useEffect, createContext, useContext } from "react";
import {
  ensureAnonymousAuth,
  saveProfileToFirestore,
  getProfileFromFirestore
} from "@/lib/firebase/services";
import { User } from "firebase/auth";

/**
 * CORE DATA TYPES
 * ---------------
 * VoterProfile defines the user's civic context. 
 * This data drives the personalized roadmap and AI responses.
 */
export type VoterProfile = {
  region: string;           // E.g., 'Maharashtra'
  isFirstTimeVoter: boolean; // Controls whether they get 'Onboarding' or 'Returning' guides
  ageGroup: string;         // '18-25', '25-40', etc.
  concerns: string[];       // Specific topics user wants to know about
};

/**
 * CONTEXT INTERFACE
 * -----------------
 * Defines the state and methods available globally via the useUserContext hook.
 */
type UserContextType = {
  profile: VoterProfile | null;
  saveProfile: (profile: VoterProfile) => Promise<void>;
  clearProfile: () => void;
  isHydrated: boolean; // Tracks if local/cloud data has been fully loaded
  user: User | null;   // The Firebase Auth user object
  isSyncing: boolean;  // Tracks background cloud synchronization state
};

// Create the context with undefined default (must be wrapped in Provider)
const UserContext = createContext<UserContextType | undefined>(undefined);

/**
 * UserProvider Component
 * ----------------------
 * Manages the "Single Source of Truth" for user data.
 * Implements a dual-storage strategy: LocalStorage (Instant) + Firestore (Persistent).
 */
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState<VoterProfile | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  /**
   * INITIALIZATION LIFECYCLE
   * ------------------------
   * Runs on mount to authenticate the user and recover their profile.
   */
  useEffect(() => {
    const initAuthAndData = async () => {
      try {
        // 1. Ensure Auth: We use anonymous sign-in to keep it frictionless
        const currentUser = await ensureAnonymousAuth();
        setUser(currentUser);

        // 2. Data Recovery: Prioritize Cloud data (Firestore) for consistency
        const cloudProfile = await getProfileFromFirestore(currentUser.uid);

        if (cloudProfile) {
          // Cloud data found -> Sync it to LocalStorage
          setProfile(cloudProfile);
          localStorage.setItem("voteGuideProfile", JSON.stringify(cloudProfile));
        } else {
          // 3. Fallback: No cloud data? Check Local Storage for offline data
          const stored = localStorage.getItem("voteGuideProfile");
          if (stored) {
            const localProfile = JSON.parse(stored);
            setProfile(localProfile);
            // Optimization: Upload local data to Cloud for future safety
            await saveProfileToFirestore(currentUser.uid, localProfile);
          }
        }
      } catch (e) {
        console.error("User Context Initialization Error:", e);
      } finally {
        // Mark as hydrated regardless of success so UI can render
        setIsHydrated(true);
      }
    };

    initAuthAndData();
  }, []);

  /**
   * Persist user profile to both LocalStorage (Fast) and Firestore (Safe).
   */
  const saveProfile = async (newProfile: VoterProfile) => {
    setIsSyncing(true);
    try {
      // Optimistic update for UI speed
      setProfile(newProfile);
      localStorage.setItem("voteGuideProfile", JSON.stringify(newProfile));

      // Background cloud persistence
      if (user) {
        await saveProfileToFirestore(user.uid, newProfile);
      }
    } catch (error) {
      console.error("Error synchronizing profile to cloud:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * Reset local state. Used for 'Retake Questionnaire' flows.
   */
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

/**
 * Custom hook to access UserContext safely throughout the app.
 */
export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider. Did you forget to wrap your root layout?");
  }
  return context;
};

