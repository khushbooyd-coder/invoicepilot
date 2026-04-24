import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDv_C9fDAHWFbKoRVxFoQOuVv45twg0GOQ",
  authDomain: "invoicepilot-ec0bf.firebaseapp.com",
  projectId: "invoicepilot-ec0bf",
};

// ✅ Prevent multiple app init (Next.js fix)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ✅ Auth
export const auth = getAuth(app);

// ✅ Persist login (VERY IMPORTANT for Vercel)
if (typeof window !== "undefined") {
  setPersistence(auth, browserLocalPersistence);
}

// ✅ Google provider
export const provider = new GoogleAuthProvider();