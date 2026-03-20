import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  if (!process.env.STRIPE_TAX_RATE_ID) {
    return NextResponse.json({ error: "Configuration TVA manquante" }, { status: 500 });
  }

  try {
    const {
      pack, packName, eventName, eventDate, instaHandle,
      ticketLink, brief, transferLink, customerEmail, submissionTitle,
      storyDates, postDate, datesPublication,
      amount, amountHT, billingName, billingAddress, billingZip, billingCity,
    } = await req.json();

    if (!pack || !eventName || !eventDate || !instaHandle || !customerEmail || !datesPublication || !amount) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    const sortedDays = [...datesPublication].sort();
    const dateDebut = new Date(sortedDays[0]).toLocaleDateString("fr-FR");
    const dateFin = new Date(sortedDays[sortedDays.length - 1]).toLocaleDateString("fr-FR");

    const customer = await stripe.customers.create({
      email: customerEmail || undefined,
      name: billingName || undefined,
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
            name: `${packName} — ${eventName}`,
            description: `Publication du ${dateDebut} au ${dateFin} · @agenda_lgbt`,
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
          description: `${packName} AgendaLGBT — ${eventName}`,
          metadata: { pack, eventName, instaHandle },
          rendering_options: { amount_tax_display: "include_inclusive_tax" },
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pro/sponsoring/success-instagram?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pro/sponsoring/instagram`,
      metadata: {
        type: "instagram",
        pack,
        packName,
        eventName,
        eventDate,
        instaHandle,
        ticketLink: ticketLink || "",
        brief: (brief || "").slice(0, 500),
        transferLink: transferLink || "",
        customerEmail,
        submissionTitle: submissionTitle || "",
        storyDates: JSON.stringify(storyDates || []),
        postDate: postDate || "",
        datesPublication: JSON.stringify(sortedDays),
        amount: String(amount),
        amountHT: String(amountHT || amount),
        billingName: billingName || "",
        billingAddress: billingAddress || "",
        billingZip: billingZip || "",
        billingCity: billingCity || "",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Checkout instagram error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
