
import { Resend } from "resend";

let resend: Resend | null = null;

// Initialize Resend lazily
function getResendClient(): Resend | null {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  const client = getResendClient();
  
  if (!client) {
    console.warn("RESEND_API_KEY not set - email will not be sent");
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  try {
    const { data, error } = await client.emails.send({
      from: "Planity.ma <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error("Email send error:", err);
    return { success: false, error: err };
  }
}

// Email templates
export function getPasswordResetEmailHtml(
  resetUrl: string,
  userName: string
): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Réinitialisation de mot de passe</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #e11e48; font-size: 24px; margin: 0;">Planity.ma</h1>
      </div>
      
      <h2 style="color: #333; font-size: 18px; margin-bottom: 20px;">
        Réinitialisation de votre mot de passe
      </h2>
      
      <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
        Bonjour ${userName || ""},
      </p>
      
      <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
        Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #e11e48; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 14px; display: inline-block;">
          Réinitialiser mon mot de passe
        </a>
      </div>
      
      <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
        Ce lien expire dans 24 heures. Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.
      </p>
      
      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        Si le lien ne fonctionne pas, copiez cette URL dans votre navigateur :
        <br>${resetUrl}
      </p>
    </div>
    
    <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
      <p>Planity.ma - Votre plateforme de réservation beauté au Maroc</p>
      <p>Casablanca, Maroc</p>
    </div>
  </div>
</body>
</html>
`;
}

export function getEmailVerificationHtml(
  verifyUrl: string,
  userName: string
): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vérification de votre email</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #e11e48; font-size: 24px; margin: 0;">Planity.ma</h1>
      </div>
      
      <h2 style="color: #333; font-size: 18px; margin-bottom: 20px;">
        Bienvenue sur Planity.ma !
      </h2>
      
      <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
        Bonjour ${userName || ""},
      </p>
      
      <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
        Merci de créer votre compte. Veuillez confirmer votre adresse email en cliquant sur le lien ci-dessous :
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyUrl}" style="background-color: #e11e48; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 14px; display: inline-block;">
          Vérifier mon email
        </a>
      </div>
      
      <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
        Ce lien expire dans 48 heures. Une fois vérifié, vous pourrez réserver des rendez-vous chez les meilleurs salons du Maroc.
      </p>
    </div>
    
    <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
      <p>Planity.ma - Votre plateforme de réservation beauté au Maroc</p>
    </div>
  </div>
</body>
</html>
`;
}

export function getBookingConfirmationHtml(
  booking: {
    salonName: string;
    serviceName: string;
    date: string;
    time: string;
    staffName?: string;
    price?: number;
    address: string;
    city: string;
  },
  userName: string
): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation de rendez-vous</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #e11e48; font-size: 24px; margin: 0;">Planity.ma</h1>
      </div>
      
      <h2 style="color: #333; font-size: 18px; margin-bottom: 20px;">
        🎉 Votre rendez-vous est confirmé !
      </h2>
      
      <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
        Bonjour ${userName || ""},
      </p>
      
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
        <h3 style="color: #e11e48; font-size: 16px; margin: 0 0 15px 0;">${booking.salonName}</h3>
        
        <table style="width: 100%; font-size: 14px; color: #666;">
          <tr>
            <td style="padding: 8px 0;"><strong>Service :</strong></td>
            <td style="padding: 8px 0;">${booking.serviceName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Date :</strong></td>
            <td style="padding: 8px 0;">${booking.date}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Heure :</strong></td>
            <td style="padding: 8px 0;">${booking.time}</td>
          </tr>
          ${booking.staffName ? `
          <tr>
            <td style="padding: 8px 0;"><strong>Professionnel :</strong></td>
            <td style="padding: 8px 0;">${booking.staffName}</td>
          </tr>
          ` : ""}
          ${booking.price ? `
          <tr>
            <td style="padding: 8px 0;"><strong>Prix :</strong></td>
            <td style="padding: 8px 0;">${booking.price} MAD</td>
          </tr>
          ` : ""}
        </table>
        
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px; margin: 0;">
            📍 ${booking.address}, ${booking.city}
          </p>
        </div>
      </div>
      
      <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
        Veuillez arrive 5-10 minutes avant votre rendez-vous. Vous pouvez modifier ou annuler votre rendez-vous jusqu'à 24 heures avant.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://planity.ma/mes-rendez-vous" style="background-color: #e11e48; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 14px; display: inline-block;">
          Voir mes rendez-vous
        </a>
      </div>
    </div>
    
    <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
      <p>Planity.ma - Votre plateforme de réservation beauté au Maroc</p>
    </div>
  </div>
</body>
</html>
`;
}

export function getBookingReminderHtml(
  booking: {
    salonName: string;
    serviceName: string;
    date: string;
    time: string;
    address: string;
    city: string;
  },
  userName: string
): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rappel de rendez-vous</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #e11e48; font-size: 24px; margin: 0;">Planity.ma</h1>
      </div>
      
      <h2 style="color: #333; font-size: 18px; margin-bottom: 20px;">
        ⏰ Rappel : Votre rendez-vous demain
      </h2>
      
      <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
        Bonjour ${userName || ""},
      </p>
      
      <div style="background-color: #fff3e0; padding: 20px; border-radius: 6px; border: 1px solid #ffcc80; margin-bottom: 20px;">
        <p style="color: #333; font-size: 16px; font-weight: bold; margin: 0 0 10px 0;">
          ${booking.salonName}
        </p>
        <p style="color: #666; font-size: 14px; margin: 0;">
          ${booking.serviceName} - ${booking.date} à ${booking.time}
        </p>
        <p style="color: #666; font-size: 14px; margin: 10px 0 0 0;">
          📍 ${booking.address}, ${booking.city}
        </p>
      </div>
      
      <p style="color: #666; font-size: 14px; line-height: 1.6;">
        N'oubliez pas votre rendez-vous ! Arrivez 5-10 minutes avant l'heure.
      </p>
    </div>
  </div>
</body>
</html>
`;
}
