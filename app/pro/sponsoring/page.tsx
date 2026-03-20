"use client";

import AuthGuard from "../components/AuthGuard";

export default function SponsoringPage() {
  return (
    <AuthGuard>
      <iframe
        src="/_sp/index.html"
        style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
        title="Sponsoring"
      />
    </AuthGuard>
  );
}
