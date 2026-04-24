import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDv_C9fDAHWFbKoRVxFoQOuVv45twg0GOQ",
  authDomain: "invoicepilot-ec0bf.firebaseapp.com",
  projectId: "invoicepilot-ec0bf",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();