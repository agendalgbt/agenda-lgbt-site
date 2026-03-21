import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { adminDb } from "@/lib/firebase-admin";


async function generateMagicLink(email: string): Promise<string> {
  try {
    const token = crypto.randomUUID();
    await adminDb.collection("magic_tokens").add({
      email,
      token,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      used: false,
    });
    return `https://pro.agendalgbt.com/pro/auto-login?t=${token}`;
  } catch {
    return "https://pro.agendalgbt.com/pro/connexion";
  }
}

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const body = await req.json();
    const { type, to, nom_organisation, contact_nom, titre, submission_id } = body;

    let subject = "";
    let html = "";

    if (type === "welcome") {
      subject = `Bienvenue sur Agenda LGBT Pro, ${nom_organisation} !`;
      html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0f; color: white; padding: 40px; border-radius: 16px;">
          <h1 style="background: linear-gradient(to right, #8b5cf6, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px;">
            Bienvenue, ${nom_organisation} !
          </h1>
          <p style="color: rgba(255,255,255,0.6); margin-bottom: 24px;">
            Bonjour ${contact_nom},<br/><br/>
            Votre espace organisateur a bien été créé sur Agenda LGBT Pro.
            Votre compte est en cours de validation par notre équipe (sous 24h).
          </p>
          <p style="color: rgba(255,255,255,0.6); margin-bottom: 32px;">
            En attendant, vous pouvez déjà soumettre vos événements depuis votre dashboard.
          </p>
          <a href="https://agendalgbt.com/pro/dashboard"
             style="background: linear-gradient(to right, #8b5cf6, #3b82f6); color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; display: inline-block;">
            Accéder à mon espace pro
          </a>
          <p style="color: rgba(255,255,255,0.3); margin-top: 40px; font-size: 12px;">
            Agenda LGBT — <a href="https://agendalgbt.com" style="color: rgba(255,255,255,0.3);">agendalgbt.com</a>
          </p>
        </div>
      `;
    } else if (type === "submission") {
      subject = `Votre événement "${titre}" a bien été reçu`;
      html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0f; color: white; padding: 40px; border-radius: 16px;">
          <h1 style="color: white; margin-bottom: 8px;">Soumission reçue ✓</h1>
          <p style="color: rgba(255,255,255,0.6); margin-bottom: 24px;">
            Bonjour ${contact_nom},<br/><br/>
            Votre événement <strong style="color: white;">"${titre}"</strong> a bien été reçu par notre équipe.
            Nous l'examinerons dans les prochaines 24 heures.
          </p>
          <p style="color: rgba(255,255,255,0.6); margin-bottom: 32px;">
            Vous recevrez un email dès que votre événement sera validé ou si des modifications sont nécessaires.
          </p>
          <a href="https://agendalgbt.com/pro/dashboard"
             style="background: linear-gradient(to right, #8b5cf6, #3b82f6); color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; display: inline-block;">
            Voir mes soumissions
          </a>
          <p style="color: rgba(255,255,255,0.3); margin-top: 40px; font-size: 12px;">
            Agenda LGBT — <a href="https://agendalgbt.com" style="color: rgba(255,255,255,0.3);">agendalgbt.com</a>
          </p>
        </div>
      `;

      // Envoi de la confirmation à l'organisateur
      const { error: errorOrga } = await resend.emails.send({
        from: "Agenda LGBT <hello@agendalgbt.com>",
        to,
        subject,
        html,
      });
      if (errorOrga) {
        console.error("Resend error (orga):", errorOrga);
        return NextResponse.json({ error: errorOrga }, { status: 500 });
      }

      // Notification admin
      const { error: errorAdmin } = await resend.emails.send({
        from: "Agenda LGBT <hello@agendalgbt.com>",
        to: "hello@agendalgbt.com",
        subject: `📬 Nouvelle soumission : "${titre}" — ${nom_organisation}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0f; color: white; padding: 40px; border-radius: 16px;">
            <h1 style="color: #8b5cf6; margin-bottom: 8px;">Nouvelle soumission 📬</h1>
            <p style="color: rgba(255,255,255,0.6); margin-bottom: 24px;">
              Un organisateur vient de soumettre un événement.
            </p>
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <p style="margin: 0 0 8px; color: white;"><strong>Événement :</strong> ${titre}</p>
              <p style="margin: 0 0 8px; color: rgba(255,255,255,0.6);"><strong>Organisateur :</strong> ${nom_organisation}</p>
              <p style="margin: 0; color: rgba(255,255,255,0.6);"><strong>Contact :</strong> ${contact_nom} — ${to}</p>
            </div>
            <a href="https://agendalgbt.streamlit.app"
               style="background: linear-gradient(to right, #8b5cf6, #3b82f6); color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; display: inline-block;">
              Voir dans le dashboard →
            </a>
            <p style="color: rgba(255,255,255,0.3); margin-top: 40px; font-size: 12px;">
              Agenda LGBT Pro — notification automatique
            </p>
          </div>
        `,
      });
      if (errorAdmin) {
        console.error("Resend error (admin):", errorAdmin);
      }

      return NextResponse.json({ success: true });
    } else if (type === "approved") {
      const magicLink = await generateMagicLink(to);
      subject = `Une décision a été prise concernant votre événement "${titre}"`;
      html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0f; color: white; padding: 40px; border-radius: 16px;">
          <h1 style="background: linear-gradient(to right, #8b5cf6, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px;">
            Votre soumission a été examinée
          </h1>
          <p style="color: rgba(255,255,255,0.6); margin-bottom: 24px;">
            Bonjour ${contact_nom},<br/><br/>
            Notre équipe vient d'examiner votre soumission <strong style="color: white;">"${titre}"</strong>.<br/><br/>
            Connectez-vous à votre espace pour découvrir le résultat et les actions disponibles.
          </p>
          <a href="${magicLink}"
             style="background: linear-gradient(to right, #8b5cf6, #3b82f6); color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; display: inline-block;">
            → Accéder à mon espace
          </a>
          <p style="color: rgba(255,255,255,0.3); margin-top: 40px; font-size: 12px;">
            Agenda LGBT — <a href="https://agendalgbt.com" style="color: rgba(255,255,255,0.3);">agendalgbt.com</a>
          </p>
        </div>
      `;
    } else if (type === "rejected") {
      const magicLink = await generateMagicLink(to);
      subject = `Une décision a été prise concernant votre événement "${titre}"`;
      html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0f; color: white; padding: 40px; border-radius: 16px;">
          <h1 style="background: linear-gradient(to right, #8b5cf6, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px;">
            Votre soumission a été examinée
          </h1>
          <p style="color: rgba(255,255,255,0.6); margin-bottom: 24px;">
            Bonjour ${contact_nom},<br/><br/>
            Notre équipe vient d'examiner votre soumission <strong style="color: white;">"${titre}"</strong>.<br/><br/>
            Connectez-vous à votre espace pour découvrir le résultat et les actions disponibles.
          </p>
          <a href="${magicLink}"
             style="background: linear-gradient(to right, #8b5cf6, #3b82f6); color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; display: inline-block;">
            → Accéder à mon espace
          </a>
          <p style="color: rgba(255,255,255,0.3); margin-top: 40px; font-size: 12px;">
            Agenda LGBT — <a href="https://agendalgbt.com" style="color: rgba(255,255,255,0.3);">agendalgbt.com</a>
          </p>
        </div>
      `;
    } else {
      return NextResponse.json({ error: "Unknown email type" }, { status: 400 });
    }

    const { error } = await resend.emails.send({
      from: "Agenda LGBT <hello@agendalgbt.com>",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
