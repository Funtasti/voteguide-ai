import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  query, 
  where 
} from "firebase/firestore";
import { signInAnonymously, onAuthStateChanged, User } from "firebase/auth";
import { db, auth } from "./firebase";
import { VoterProfile } from "@/context/UserContext";
import { ElectionData } from "@/data/indianElections";

/**
 * AUTHENTICATION SERVICES
 * -----------------------
 * We use Anonymous Authentication to provide a seamless "zero-barrier" entry.
 * This ensures every user has a unique ID (UID) to save their progress
 * without requiring a social login or password immediately.
 */

/**
 * Ensures the user is authenticated anonymously.
 * Wraps onAuthStateChanged in a Promise to provide a clean async interface.
 * 
 * @returns Promise<User> - The authenticated Firebase User object.
 */
export const ensureAnonymousAuth = async (): Promise<User> => {
  // Shortcut: if already authed, return immediately
  if (auth.currentUser) return auth.currentUser;
  
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Clean up the listener immediately after the first event
      unsubscribe();
      
      if (user) {
        resolve(user);
      } else {
        try {
          // If no user exists, trigger anonymous sign-in
          const credential = await signInAnonymously(auth);
          resolve(credential.user);
        } catch (error) {
          reject(error);
        }
      }
    });
  });
};

/**
 * DATA PERSISTENCE SERVICES
 * -------------------------
 * These functions handle the synchronization between the app's state and 
 * the Google Cloud Firestore database.
 */

/**
 * Saves the voter profile to Firestore.
 * Uses { merge: true } to prevent overwriting existing fields accidentally.
 * 
 * @param uid - The unique user ID from Firebase Auth.
 * @param profile - The VoterProfile object to persist.
 */
export const saveProfileToFirestore = async (uid: string, profile: VoterProfile) => {
  const userDoc = doc(db, "users", uid);
  await setDoc(userDoc, {
    ...profile,
    updatedAt: new Date().toISOString(), // Track when the profile was last modified
  }, { merge: true });
};

/**
 * Retrieves the voter profile from Firestore.
 * 
 * @param uid - The unique user ID.
 * @returns Promise<VoterProfile | null> - Returns the profile if found, otherwise null.
 */
export const getProfileFromFirestore = async (uid: string): Promise<VoterProfile | null> => {
  const userDoc = doc(db, "users", uid);
  const docSnap = await getDoc(userDoc);
  if (docSnap.exists()) {
    return docSnap.data() as VoterProfile;
  }
  return null;
};

/**
 * CONFIGURATION SERVICES
 * ----------------------
 * Fetches regional election configuration from Firestore.
 * This pattern allows us to update election dates, myths, and rules in real-time
 * via the Firebase Console without redeploying the frontend code.
 * 
 * @param region - The state/region name (e.g., "Maharashtra").
 * @returns Promise<ElectionData | null>
 */
export const getElectionConfig = async (region: string): Promise<ElectionData | null> => {
  try {
    // Query the 'elections' collection for a document matching the user's region
    const configQuery = query(collection(db, "elections"), where("region", "==", region));
    const querySnapshot = await getDocs(configQuery);
    
    if (!querySnapshot.empty) {
      // Use the first match found
      return querySnapshot.docs[0].data() as ElectionData;
    }
  } catch (error) {
    console.error("Critical: Error fetching election config from Firestore:", error);
  }
  return null;
};

