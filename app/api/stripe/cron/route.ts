import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const todayStr = new Date().toISOString().split("T")[0];

  try {
    const snapshot = await adminDb.collection("activities")
      .where("sponsored_days", "!=", null)
      .get();

    const batch = adminDb.batch();
    let activated = 0;
    let deactivated = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      const sponsoredDays = data.sponsored_days;
      if (!Array.isArray(sponsoredDays) || sponsoredDays.length === 0) return;

      const shouldBeActive = sponsoredDays.includes(todayStr);
      if (shouldBeActive !== data.isSponsored) {
        batch.update(doc.ref, { isSponsored: shouldBeActive });
        shouldBeActive ? activated++ : deactivated++;
      }
    });

    await batch.commit();

    return NextResponse.json({ date: todayStr, activated, deactivated });
  } catch (err: any) {
    console.error("Cron sponsor error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
