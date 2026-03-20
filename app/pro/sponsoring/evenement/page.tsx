"use client";

import AuthGuard from "../../components/AuthGuard";
import ProHeader from "../../components/ProHeader";

export default function SponsoringEvenementPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0a0a0f]">
        <ProHeader />
        <iframe
          src="/_sp/sponsor.html"
          style={{ position: "fixed", top: 64, left: 0, width: "100%", height: "calc(100% - 64px)", border: "none" }}
          title="Sponsorisation événement"
        />
      </div>
    </AuthGuard>
  );
}
