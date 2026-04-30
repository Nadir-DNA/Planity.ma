
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      try {
        const res = await fetch("/api/v1/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Une erreur est survenue");
          return;
        }

        setSuccess(true);
      } catch {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
    });
  }

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Email envoyé</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Consultez votre boîte mail pour réinitialiser votre mot de passe
          </p>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Si un compte existe avec <strong>{email}</strong>, vous recevrez un lien de réinitialisation.
          </p>
          <p className="text-xs text-gray-500">
            Le lien expire dans 24 heures. Si vous ne recevez pas l'email, vérifiez vos spams.
          </p>
          <Link href="/connexion">
            <Button variant="outline" className="mt-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la connexion
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Mot de passe oublié</CardTitle>
        <p className="text-sm text-gray-500 mt-1">
          Entrez votre email pour recevoir un lien de réinitialisation
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="email"
                placeholder="votre@email.com"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isPending}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isPending}>
            {isPending ? "Envoi en cours..." : "Envoyer le lien"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          <Link href="/connexion" className="text-rose-600 font-medium hover:underline inline-flex items-center">
            <ArrowLeft className="mr-1 h-3 w-3" />
            Retour à la connexion
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
