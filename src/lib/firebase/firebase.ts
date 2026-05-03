import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "./config";

// Initialize Firebase only if we have real credentials or if we want to rely on the mock gracefully.
// For now, if NEXT_PUBLIC_FIREBASE_API_KEY is not set or is mock, we can still initialize it, 
// but we will mostly rely on mock data in the app until real credentials are provided.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
