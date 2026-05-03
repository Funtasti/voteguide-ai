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
 * Ensures the user is authenticated anonymously.
 */
export const ensureAnonymousAuth = async (): Promise<User> => {
  if (auth.currentUser) return auth.currentUser;
  
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (user) {
        resolve(user);
      } else {
        try {
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
 * Saves the voter profile to Firestore.
 */
export const saveProfileToFirestore = async (uid: string, profile: VoterProfile) => {
  const userDoc = doc(db, "users", uid);
  await setDoc(userDoc, {
    ...profile,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
};

/**
 * Retrieves the voter profile from Firestore.
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
 * Fetches election configuration for a specific region.
 * This allows the app to be updated without code changes.
 */
export const getElectionConfig = async (region: string): Promise<ElectionData | null> => {
  try {
    const configQuery = query(collection(db, "elections"), where("region", "==", region));
    const querySnapshot = await getDocs(configQuery);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as ElectionData;
    }
  } catch (error) {
    console.error("Error fetching election config from Firestore:", error);
  }
  return null;
};
