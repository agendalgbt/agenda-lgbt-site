import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

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
    } else if (type === "approved") {
      subject = `🎉 Votre événement "${titre}" est en ligne !`;
      html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0f; color: white; padding: 40px; border-radius: 16px;">
          <h1 style="color: #4ade80; margin-bottom: 8px;">Événement validé 🎉</h1>
          <p style="color: rgba(255,255,255,0.6); margin-bottom: 24px;">
            Bonjour ${contact_nom},<br/><br/>
            Bonne nouvelle ! Votre événement <strong style="color: white;">"${titre}"</strong> a été validé
            et est maintenant visible sur l'application Agenda LGBT.
          </p>
          <a href="https://agendalgbt.com/pro/dashboard"
             style="background: linear-gradient(to right, #4ade80, #3b82f6); color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; display: inline-block;">
            Voir mon tableau de bord
          </a>
          <p style="color: rgba(255,255,255,0.3); margin-top: 40px; font-size: 12px;">
            Agenda LGBT — <a href="https://agendalgbt.com" style="color: rgba(255,255,255,0.3);">agendalgbt.com</a>
          </p>
        </div>
      `;
    } else if (type === "rejected") {
      const { raison } = body;
      subject = `Votre événement "${titre}" nécessite des modifications`;
      html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0f; color: white; padding: 40px; border-radius: 16px;">
          <h1 style="color: white; margin-bottom: 8px;">Modifications requises</h1>
          <p style="color: rgba(255,255,255,0.6); margin-bottom: 16px;">
            Bonjour ${contact_nom},<br/><br/>
            Votre événement <strong style="color: white;">"${titre}"</strong> n'a pas pu être validé en l'état.
          </p>
          ${raison ? `
          <div style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <p style="color: rgba(255,255,255,0.7); margin: 0; font-size: 14px;"><strong>Motif :</strong> ${raison}</p>
          </div>
          ` : ""}
          <p style="color: rgba(255,255,255,0.6); margin-bottom: 32px;">
            Vous pouvez soumettre une nouvelle version depuis votre espace pro.
          </p>
          <a href="https://agendalgbt.com/pro/soumettre"
             style="background: linear-gradient(to right, #8b5cf6, #3b82f6); color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; display: inline-block;">
            Soumettre à nouveau
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
