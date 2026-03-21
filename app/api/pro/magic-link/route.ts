import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

// POST: génère un magic token pour un email donné
export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "email requis" }, { status: 400 });

  try {
    const token = crypto.randomUUID();
    await adminDb.collection("magic_tokens").add({
      email,
      token,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      used: false,
    });
    return NextResponse.json({ token });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET: vérifie le token et retourne un Firebase custom token
export async function GET(req: NextRequest) {
  const t = req.nextUrl.searchParams.get("t");
  if (!t) return NextResponse.json({ error: "token manquant" }, { status: 400 });

  try {
    const snap = await adminDb.collection("magic_tokens").where("token", "==", t).limit(1).get();
    if (snap.empty) return NextResponse.json({ error: "token invalide" }, { status: 401 });

    const doc = snap.docs[0];
    const data = doc.data();

    if (data.used) return NextResponse.json({ error: "token déjà utilisé" }, { status: 401 });

    const expiresAt = data.expires_at?.toDate ? data.expires_at.toDate() : new Date(data.expires_at);
    if (expiresAt < new Date()) return NextResponse.json({ error: "token expiré" }, { status: 401 });

    await doc.ref.update({ used: true });

    const userRecord = await adminAuth.getUserByEmail(data.email);
    const customToken = await adminAuth.createCustomToken(userRecord.uid);

    return NextResponse.json({ customToken });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
