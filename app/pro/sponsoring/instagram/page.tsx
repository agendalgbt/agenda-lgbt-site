"use client";

import { useAuth } from "../../context/AuthContext";
import AuthGuard from "../../components/AuthGuard";
import ProHeader from "../../components/ProHeader";

export default function SponsoringInstagramPage() {
  const { user } = useAuth();
  const params = new URLSearchParams();
  if (user?.email) params.set("userEmail", user.email);
  const src = `/_sp/instagram.html${params.toString() ? "?" + params.toString() : ""}`;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0a0a0f]">
        <ProHeader />
        <iframe
          src={src}
          style={{ position: "fixed", top: 64, left: 0, width: "100%", height: "calc(100% - 64px)", border: "none" }}
          title="Sponsorisation Instagram"
        />
      </div>
    </AuthGuard>
  );
}
