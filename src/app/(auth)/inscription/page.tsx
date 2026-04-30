"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, User, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { registerUser } from "@/server/actions/auth";
import { Turnstile } from "@/components/shared/turnstile";

const MA_PHONE_REGEX = /^(\+212|0)([6-7]\d{8})$/;

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateField(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function validatePhone(value: string): boolean {
    const stripped = value.replace(/\s/g, "");
    if (stripped.length === 0) {
      setPhoneError("");
      return true;
    }
    if (!MA_PHONE_REGEX.test(stripped)) {
setPhoneError("Format invalide. Exemples : 0612345678, +212****5678");
      return false;
    }
    setPhoneError("");
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!validatePhone(formData.phone)) {
      return;
    }

    if (!turnstileToken) {
      setError("Veuillez compléter la vérification CAPTCHA");
      return;
    }

    startTransition(async () => {
      const form = new FormData();
      form.append("firstName", formData.firstName);
      form.append("lastName", formData.lastName);
      form.append("email", formData.email);
      form.append("phone", formData.phone);
      form.append("password", formData.password);
      form.append("turnstileToken", turnstileToken);

      const result = await registerUser(form);

      if (result.error) {
        setError(result.error);
        // Reset turnstile token so user must re-verify
        setTurnstileToken(null);
        return;
      }

      router.push("/connexion?registered=true");
    });
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Créer un compte</CardTitle>
        <p className="text-sm text-gray-500 mt-1">
          Rejoignez Planity.ma et réservez en ligne
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Prénom"
                  className="pl-10"
                  value={formData.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  required
                  disabled={isPending}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <Input
                placeholder="Nom"
                value={formData.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
                required
                disabled={isPending}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="email"
                placeholder="votre@email.com"
                className="pl-10"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                required
                disabled={isPending}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="tel"
                placeholder="06 XX XX XX XX"
                className={cn(
                  "pl-10 border-[rgba(198,198,198,0.2)] focus:border-[rgba(198,198,198,0.2)] focus:ring-1 focus:ring-[rgba(198,198,198,0.4)]",
                  phoneError && "border-[rgba(198,198,198,0.4)]"
                )}
                value={formData.phone}
                onChange={(e) => {
                  updateField("phone", e.target.value);
                  validatePhone(e.target.value);
                }}
                onBlur={() => validatePhone(formData.phone)}
                disabled={isPending}
              />
            </div>
            {phoneError && (
              <p className="mt-1 text-xs text-gray-700">
                {phoneError}
              </p>
            )}
            {!phoneError && (
              <p className="mt-1 text-xs text-gray-400">
                Formats acceptés : 06XXXXXXXX, 07XXXXXXXX, +2126XXXXXXXX
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="password"
                placeholder="Minimum 8 caractères"
                className="pl-10"
                value={formData.password}
                onChange={(e) => updateField("password", e.target.value)}
                required
                minLength={8}
                disabled={isPending}
              />
            </div>
          </div>

          {/* Cloudflare Turnstile CAPTCHA */}
          <Turnstile
            onVerify={(token) => setTurnstileToken(token)}
            onExpire={() => setTurnstileToken(null)}
            onError={() => {
              setTurnstileToken(null);
              setError("Erreur de vérification CAPTCHA. Veuillez réessayer.");
            }}
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isPending || !turnstileToken}
          >
            {isPending ? "Création en cours..." : "Créer mon compte"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Déjà un compte ?{" "}
          <Link href="/connexion" className="text-rose-600 font-medium hover:underline">
            Se connecter
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}