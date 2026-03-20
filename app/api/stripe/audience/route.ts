import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") || "");
  const lng = parseFloat(searchParams.get("lng") || "");

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: "lat/lng manquants", count: 0 }, { status: 400 });
  }

  try {
    let count = 0;
    let lastDoc: any = null;
    const BATCH = 500;

    while (true) {
      let q: any = adminDb.collection("users").limit(BATCH);
      if (lastDoc) q = q.startAfter(lastDoc);
      const snapshot = await q.get();
      if (snapshot.empty) break;

      snapshot.forEach((doc: any) => {
        const loc = doc.data().last_known_location;
        if (!loc) return;
        const d = haversine(lat, lng, loc.latitude, loc.longitude);
        if (d <= 30) count++;
      });

      lastDoc = snapshot.docs[snapshot.docs.length - 1];
      if (snapshot.size < BATCH) break;
    }

    return NextResponse.json({ count });
  } catch (e: any) {
    console.error("Audience error:", e);
    return NextResponse.json({ error: e.message, count: 0 }, { status: 500 });
  }
}
