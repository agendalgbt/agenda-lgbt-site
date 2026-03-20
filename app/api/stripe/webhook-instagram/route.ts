import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import admin from "@/lib/firebase-admin";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const resend = new Resend(process.env.RESEND_API_KEY);
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature") || "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET_INSTAGRAM!);
  } catch (err: any) {
    console.error("Webhook signature error:", err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata || {};

    if (meta.type !== "instagram") {
      return NextResponse.json({ received: true });
    }

    try {
      const storyDates: string[] = JSON.parse(meta.storyDates || "[]");
      const postDate = meta.postDate || null;
      const batch = adminDb.batch();

      storyDates.forEach((dateStr) => {
        const ref = adminDb.collection("instagram_booked_days").doc(dateStr);
        batch.set(ref, { date: dateStr, story: true }, { merge: true });
      });

      if (postDate) {
        const ref = adminDb.collection("instagram_booked_days").doc(postDate);
        batch.set(ref, { date: postDate, post: true }, { merge: true });
      }

      await batch.commit();

      await adminDb.collection("instagram_sponsorships").add({
        pack: meta.pack,
        packName: meta.packName,
        eventName: meta.eventName,
        eventDate: meta.eventDate,
        instaHandle: meta.instaHandle,
        ticketLink: meta.ticketLink || "",
        brief: meta.brief || "",
        transferLink: meta.transferLink || "",
        customerEmail: meta.customerEmail || session.customer_details?.email || "",
        submission_title: meta.submissionTitle || "",
        storyDates,
        postDate,
        datesPublication: JSON.parse(meta.datesPublication || "[]"),
        amount: session.amount_total,
        stripe_session_id: session.id,
        status: "confirmed",
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      });

      const customerEmail = meta.customerEmail || session.customer_details?.email;
      if (customerEmail) {
        const datesPublication: string[] = JSON.parse(meta.datesPublication || "[]").sort();
        const dateDebut = new Date(datesPublication[0]).toLocaleDateString("fr-FR");
        const dateFin = new Date(datesPublication[datesPublication.length - 1]).toLocaleDateString("fr-FR");
        const amountTTC = session.amount_total || 0;
        const amountHT = parseInt(meta.amountHT || "0", 10);
        const amountTVA = amountTTC - amountHT;
        const fmt = (cents: number) => (cents / 100).toFixed(2).replace(".", ",");

        const storyDatesList = storyDates.sort()
          .map((d) => new Date(d).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }))
          .map((d) => `<li style="padding:2px 0;">${d}</li>`).join("");

        let invoicePdfUrl = null;
        let invoiceHostedUrl = null;
        if (session.invoice) {
          try {
            const invoice = await stripe.invoices.retrieve(session.invoice as string);
            invoicePdfUrl = invoice.invoice_pdf;
            invoiceHostedUrl = invoice.hosted_invoice_url;
          } catch (e: any) {
            console.error("Erreur récupération facture:", e.message);
          }
        }

        const hasBilling = meta.billingName || meta.billingAddress;

        await resend.emails.send({
          from: "Agenda LGBT <hello@agendalgbt.com>",
          to: customerEmail,
          subject: `Sponsorisation Instagram confirmée — ${meta.eventName}`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
              <div style="background:#c0398a;padding:32px 24px;text-align:center;border-radius:8px 8px 0 0;">
                <p style="color:white;font-size:22px;font-weight:bold;margin:0;">Agenda LGBT</p>
                <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:15px;">Confirmation de sponsorisation Instagram</p>
              </div>
              <div style="padding:32px 24px;background:#fff;border:1px solid #eee;border-top:none;border-radius:0 0 8px 8px;">
                <p style="margin-top:0;">Bonjour,</p>
                <p>Votre paiement a bien été reçu. Votre événement <strong>${meta.eventName}</strong> sera mis en avant sur <strong>@agenda_lgbt</strong>.</p>
                <h3 style="color:#c0398a;margin-top:32px;margin-bottom:12px;font-size:15px;text-transform:uppercase;">Récapitulatif</h3>
                <table style="width:100%;border-collapse:collapse;">
                  <tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:10px 0;color:#666;width:40%;">Pack</td><td style="padding:10px 0;"><strong>${meta.packName || meta.pack}</strong></td></tr>
                  <tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:10px 0;color:#666;">Événement</td><td style="padding:10px 0;"><strong>${meta.eventName}</strong></td></tr>
                  <tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:10px 0;color:#666;">Compte Instagram</td><td style="padding:10px 0;">@${meta.instaHandle}</td></tr>
                  <tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:10px 0;color:#666;vertical-align:top;">Stories</td><td style="padding:10px 0;">${storyDates.length} jour(s) · du ${dateDebut} au ${dateFin}<ul style="margin:8px 0 0;padding-left:18px;color:#444;font-size:13px;">${storyDatesList}</ul></td></tr>
                  ${postDate ? `<tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:10px 0;color:#666;">Post</td><td style="padding:10px 0;">${new Date(postDate).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</td></tr>` : ""}
                  <tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:10px 0;color:#666;">Montant HT</td><td style="padding:10px 0;">${fmt(amountHT)} €</td></tr>
                  <tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:10px 0;color:#666;">TVA (20 %)</td><td style="padding:10px 0;">${fmt(amountTVA)} €</td></tr>
                  <tr><td style="padding:10px 0;color:#666;">Total TTC</td><td style="padding:10px 0;font-size:18px;"><strong>${fmt(amountTTC)} €</strong></td></tr>
                </table>
                ${hasBilling ? `<h3 style="color:#c0398a;margin-top:32px;margin-bottom:12px;font-size:15px;text-transform:uppercase;">Facturation</h3><p style="margin:0;line-height:1.6;">${meta.billingName ? meta.billingName + "<br>" : ""}${meta.billingAddress ? meta.billingAddress + "<br>" : ""}${meta.billingZip || meta.billingCity ? meta.billingZip + " " + meta.billingCity : ""}</p>` : ""}
                ${invoicePdfUrl ? `<h3 style="color:#c0398a;margin-top:32px;margin-bottom:12px;font-size:15px;text-transform:uppercase;">Facture</h3><p><a href="${invoicePdfUrl}" style="display:inline-block;background:#c0398a;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px;">Télécharger la facture PDF</a>${invoiceHostedUrl ? ` &nbsp;<a href="${invoiceHostedUrl}" style="color:#c0398a;font-size:14px;">Voir en ligne</a>` : ""}</p>` : ""}
                <p style="color:#aaa;font-size:12px;margin-top:24px;">Référence : ${session.id}</p>
                <hr style="border:none;border-top:1px solid #eee;margin:32px 0 24px;">
                <p style="color:#aaa;font-size:12px;text-align:center;margin:0;">Agenda LGBT · <a href="https://agendalgbt.com" style="color:#c0398a;text-decoration:none;">agendalgbt.com</a></p>
              </div>
            </div>
          `,
        });

        await resend.emails.send({
          from: "Agenda LGBT <hello@agendalgbt.com>",
          to: "hello@agendalgbt.com",
          subject: `[Nouvelle résa Instagram] ${meta.eventName} — ${fmt(amountTTC)} € TTC`,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;"><div style="background:#1a1a26;padding:24px;border-radius:8px 8px 0 0;"><p style="color:#e8609a;font-size:18px;font-weight:bold;margin:0;">Nouvelle réservation · Instagram</p></div><div style="padding:24px;background:#fff;border:1px solid #eee;border-top:none;border-radius:0 0 8px 8px;"><p><strong>Pack :</strong> ${meta.packName}</p><p><strong>Événement :</strong> ${meta.eventName}</p><p><strong>Instagram :</strong> @${meta.instaHandle}</p><p><strong>Email :</strong> ${customerEmail}</p><p><strong>Total TTC :</strong> ${fmt(amountTTC)} €</p><p><strong>Référence :</strong> ${session.id}</p></div></div>`,
        });
      }
    } catch (err: any) {
      console.error("Firebase error:", err);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
