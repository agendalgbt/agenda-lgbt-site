"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface Organizer {
  uid: string;
  email: string;
  nom_organisation: string;
  contact_nom: string;
  telephone: string;
  instagram: string;
  ville: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  organizer: Organizer | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  organizer: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const snap = await getDoc(doc(db, "organizers", firebaseUser.uid));
        if (snap.exists()) {
          setOrganizer({ uid: firebaseUser.uid, ...snap.data() } as Organizer);
        }
      } else {
        setOrganizer(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, organizer, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
