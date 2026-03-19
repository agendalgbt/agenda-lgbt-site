import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBX793d9b70uGXH3E9m_zUt-zK6B6w61gM",
  authDomain: "agendalgbt-app.firebaseapp.com",
  projectId: "agendalgbt-app",
  storageBucket: "agendalgbt-app.firebasestorage.app",
  messagingSenderId: "852784331476",
  appId: "1:852784331476:web:fea0517a9630e3f031d941",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
