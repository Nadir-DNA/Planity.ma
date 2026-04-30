/**
 * Centralized email templates for Planity.ma
 * Replaces duplicated templates in email.ts and notification.service.ts
 */

// Base HTML wrapper
const baseTemplate = (content: string, title: string) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: Inter, -apple-system, sans-serif; background: #f5f0e8; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: 700; color: #1a1a1a; }
    .accent { color: #2dd4a8; }
    .content { line-height: 1.6; color: #333; }
    .button { display: inline-block; padding: 16px 32px; background: #2dd4a8; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
    .link { color: #2dd4a8; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Planity<span class="accent">.ma</span></div>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>Planity.ma — Réservation beauté au Maroc</p>
      <p>Casablanca • Rabat • Marrakech</p>
    </div>
  </div>
</body>
</html>
`;

// Template variables interface
export interface EmailTemplateData {
  userName?: string;
  salonName?: string;
  salonAddress?: string;
  date?: string;
  time?: string;
  service?: string;
  staffName?: string;
  price?: string;
  resetUrl?: string;
  verificationUrl?: string;
  cancelReason?: string;
};

// ==================== Auth Templates ====================

export function passwordResetTemplate(data: EmailTemplateData): string {
  const content = `
    <h1 style="margin: 0 0 20px; font-size: 24px; color: #1a1a1a;">Réinitialisation de votre mot de passe</h1>
    <p>Bonjour ${data.userName || ''},</p>
    <p>Vous avez demandé la réinitialisation de votre mot de passe sur Planity.ma.</p>
    <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
    <a href="${data.resetUrl}" class="button">Réinitialiser mon mot de passe</a>
    <p style="color: #666; font-size: 14px;">Ce lien expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez cet email.</p>
  `;
  return baseTemplate(content, "Réinitialisation mot de passe");
}

export function emailVerificationTemplate(data: EmailTemplateData): string {
  const content = `
    <h1 style="margin: 0 0 20px; font-size: 24px; color: #1a1a1a;">Vérification de votre email</h1>
    <p>Bonjour ${data.userName || ''},</p>
    <p>Merci de vous inscrire sur Planity.ma ! Vérifiez votre email en cliquant sur le bouton ci-dessous :</p>
    <a href="${data.verificationUrl}" class="button">Vérifier mon email</a>
    <p style="color: #666; font-size: 14px;">Ce lien expire dans 24 heures.</p>
  `;
  return baseTemplate(content, "Vérification email");
}

// ==================== Booking Templates ====================

export function bookingConfirmationTemplate(data: EmailTemplateData): string {
  const content = `
    <h1 style="margin: 0 0 20px; font-size: 24px; color: #1a1a1a;">Réservation confirmée ✓</h1>
    <p>Bonjour ${data.userName || ''},</p>
    <p>Votre rendez-vous est confirmé ! Voici les détails :</p>
    
    <div style="background: #f5f0e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0 0 10px;"><strong>Salon :</strong> ${data.salonName}</p>
      <p style="margin: 0 0 10px;"><strong>Adresse :</strong> ${data.salonAddress}</p>
      <p style="margin: 0 0 10px;"><strong>Date :</strong> ${data.date}</p>
      <p style="margin: 0 0 10px;"><strong>Heure :</strong> ${data.time}</p>
      <p style="margin: 0 0 10px;"><strong>Service :</strong> ${data.service}</p>
      ${data.staffName ? `<p style="margin: 0 0 10px;"><strong>Professionnel :</strong> ${data.staffName}</p>` : ''}
      ${data.price ? `<p style="margin: 0;"><strong>Prix :</strong> ${data.price}</p>` : ''}
    </div>
    
    <p>Un rappel vous sera envoyé 24h avant votre rendez-vous.</p>
    <p>Pour modifier ou annuler, connectez-vous à votre compte.</p>
  `;
  return baseTemplate(content, "Réservation confirmée");
}

export function bookingReminderTemplate(data: EmailTemplateData): string {
  const content = `
    <h1 style="margin: 0 0 20px; font-size: 24px; color: #1a1a1a;">Rappel de rendez-vous 📅</h1>
    <p>Bonjour ${data.userName || ''},</p>
    <p>Ceci est un rappel pour votre rendez-vous tomorrow :</p>
    
    <div style="background: #f5f0e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0 0 10px;"><strong>Salon :</strong> ${data.salonName}</p>
      <p style="margin: 0 0 10px;"><strong>Date :</strong> ${data.date}</p>
      <p style="margin: 0 0 10px;"><strong>Heure :</strong> ${data.time}</p>
      <p style="margin: 0 0 10px;"><strong>Service :</strong> ${data.service}</p>
    </div>
    
    <p style="color: #666;">Merci d'arriver 5 minutes avant votre rendez-vous.</p>
  `;
  return baseTemplate(content, "Rappel rendez-vous");
}

export function bookingCancellationTemplate(data: EmailTemplateData): string {
  const content = `
    <h1 style="margin: 0 0 20px; font-size: 24px; color: #1a1a1a;">Réservation annulée ✗</h1>
    <p>Bonjour ${data.userName || ''},</p>
    <p>Votre rendez-vous a été annulé :</p>
    
    <div style="background: #f5f0e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0 0 10px;"><strong>Salon :</strong> ${data.salonName}</p>
      <p style="margin: 0 0 10px;"><strong>Date :</strong> ${data.date}</p>
      <p style="margin: 0 0 10px;"><strong>Heure :</strong> ${data.time}</p>
      ${data.cancelReason ? `<p style="margin: 0;"><strong>Motif :</strong> ${data.cancelReason}</p>` : ''}
    </div>
    
    <p>Vous pouvez rebooker un nouveau rendez-vous sur notre site.</p>
    <a href="https://planity.ma" class="button">Rechercher un salon</a>
  `;
  return baseTemplate(content, "Réservation annulée");
}

// ==================== Review Templates ====================

export function reviewRequestTemplate(data: EmailTemplateData): string {
  const content = `
    <h1 style="margin: 0 0 20px; font-size: 24px; color: #1a1a1a;">Donnez votre avis ⭐</h1>
    <p>Bonjour ${data.userName || ''},</p>
    <p>Comment s'est passé votre rendez-vous chez ${data.salonName} ?</p>
    <p>Partagez votre expérience pour aider d'autres clients !</p>
    <a href="https://planity.ma/mes-rendez-vous" class="button">Laisser un avis</a>
    <p style="color: #666; font-size: 14px;">Votre avis sera publié après modération.</p>
  `;
  return baseTemplate(content, "Donnez votre avis");
}

// ==================== Export all templates ====================

export const emailTemplates = {
  passwordReset: passwordResetTemplate,
  emailVerification: emailVerificationTemplate,
  bookingConfirmation: bookingConfirmationTemplate,
  bookingReminder: bookingReminderTemplate,
  bookingCancellation: bookingCancellationTemplate,
  reviewRequest: reviewRequestTemplate,
};