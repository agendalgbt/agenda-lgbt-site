import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "email requis" }, { status: 400 });

  try {
    const [sponSnap, igSnap] = await Promise.all([
      adminDb.collection("sponsorships").where("orga_email", "==", email).get(),
      adminDb.collection("instagram_sponsorships").where("customerEmail", "==", email).get(),
    ]);

    const sponsorships = sponSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const igSponsorships = igSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return NextResponse.json({ sponsorships, igSponsorships });
  } catch (err: any) {
    console.error("Erreur sponsorships API:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
