/**
 * Cloudflare Turnstile server-side verification
 * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(token: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // If no secret key is configured, skip verification (for development)
  if (!secretKey || secretKey.startsWith("0x4AAAAAAAxxxx")) {
    console.warn("[Turnstile] Secret key not configured — skipping verification");
    return { success: true };
  }

  if (!token) {
    return { success: false, error: "Vérification CAPTCHA requise" };
  }

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    const data = await response.json();

    if (data.success) {
      return { success: true };
    }

    console.error("[Turnstile] Verification failed:", data["error-codes"]);
    return {
      success: false,
      error: "Vérification CAPTCHA échouée. Veuillez réessayer.",
    };
  } catch (err) {
    console.error("[Turnstile] Verification error:", err);
    return {
      success: false,
      error: "Erreur de vérification CAPTCHA. Veuillez réessayer.",
    };
  }
}