"use client";

import { useAuth } from "../../context/AuthContext";
import AuthGuard from "../../components/AuthGuard";
import ProHeader from "../../components/ProHeader";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SponsoringInstagramInner() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const submissionTitle = searchParams.get("submissionTitle") || "";
  const params = new URLSearchParams();
  if (user?.email) params.set("userEmail", user.email);
  if (submissionTitle) params.set("submissionTitle", submissionTitle);
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

export default function SponsoringInstagramPage() {
  return (
    <Suspense>
      <SponsoringInstagramInner />
    </Suspense>
  );
}
