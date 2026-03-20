import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  if (!process.env.STRIPE_TAX_RATE_ID) {
    return NextResponse.json({ error: "Configuration TVA manquante" }, { status: 500 });
  }

  try {
    const { eventId, eventName, days, amount, amountHT, billingName, billingAddress, billingZip, billingCity, orgaEmail } = await req.json();

    if (!eventId || !eventName || !days || !amount) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    if (days.length < 3) {
      return NextResponse.json({ error: "Minimum 3 jours requis" }, { status: 400 });
    }

    const sortedDays = [...days].sort();
    const dateDebut = new Date(sortedDays[0]).toLocaleDateString("fr-FR");
    const dateFin = new Date(sortedDays[sortedDays.length - 1]).toLocaleDateString("fr-FR");

    const customer = await stripe.customers.create({
      name: billingName || undefined,
      email: orgaEmail || undefined,
      address: billingName ? {
        line1: billingAddress || "",
        postal_code: billingZip || "",
        city: billingCity || "",
        country: "FR",
      } : undefined,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer: customer.id,
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: {
            name: `Sponsorisation — ${eventName}`,
            description: `${days.length} jour(s) · du ${dateDebut} au ${dateFin}`,
          },
          unit_amount: amountHT || amount,
          tax_behavior: "exclusive",
        },
        quantity: 1,
        tax_rates: [process.env.STRIPE_TAX_RATE_ID],
      }],
      mode: "payment",
      allow_promotion_codes: true,
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: `Sponsorisation Agenda LGBT — ${eventName} · du ${dateDebut} au ${dateFin}`,
          metadata: { eventId, eventName },
          rendering_options: { amount_tax_display: "include_inclusive_tax" },
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pro/sponsoring/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pro/sponsoring/evenement`,
      metadata: {
        eventId,
        eventName,
        days: JSON.stringify(days),
        amountHT: String(amountHT || amount),
        amount: String(amount),
        orgaEmail: orgaEmail || "",
        billingName: billingName || "",
        billingAddress: billingAddress || "",
        billingZip: billingZip || "",
        billingCity: billingCity || "",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
