"use client";

import AuthGuard from "../../components/AuthGuard";

export default function SponsoringEvenementPage() {
  return (
    <AuthGuard>
      <iframe
        src="/_sp/sponsor.html"
        style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
        title="Sponsorisation événement"
      />
    </AuthGuard>
  );
}
