"use client";

import { useEffect, useState } from "react";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function AutoLoginInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const t = searchParams.get("t");
    if (!t) { router.replace("/pro/connexion"); return; }

    fetch(`/api/pro/magic-link?t=${encodeURIComponent(t)}`)
      .then((r) => r.json())
      .then(async (data) => {
        if (data.customToken) {
          await signInWithCustomToken(auth, data.customToken);
          router.replace("/pro/dashboard");
        } else {
          setError(data.error || "Lien invalide");
          setTimeout(() => router.replace("/pro/connexion"), 2000);
        }
      })
      .catch(() => {
        setError("Une erreur est survenue");
        setTimeout(() => router.replace("/pro/connexion"), 2000);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <>
            <p className="text-red-400 text-sm mb-2">{error}</p>
            <p className="text-white/30 text-xs">Redirection vers la connexion...</p>
          </>
        ) : (
          <>
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/40 text-sm">Connexion en cours...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function AutoLoginPage() {
  return (
    <Suspense>
      <AutoLoginInner />
    </Suspense>
  );
}
