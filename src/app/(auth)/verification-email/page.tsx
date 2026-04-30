
"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error" | "pending">("loading");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!token) {
      setStatus("pending");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/v1/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Votre email a été vérifié avec succès.");
          setTimeout(() => router.push("/connexion"), 3000);
        } else {
          setStatus("error");
          setMessage(data.error || "Le lien de vérification est invalide ou a expiré.");
        }
      } catch {
        setStatus("error");
        setMessage("Une erreur est survenue. Veuillez réessayer.");
      }
    });
  }, [token, router]);

  // No token - show resend option
  if (status === "pending") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
            <Mail className="h-6 w-6 text-amber-600" />
          </div>
          <CardTitle className="text-2xl">Vérification requise</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Un email de vérification a été envoyé à votre adresse. Consultez votre boîte mail.
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Cliquez sur le lien dans l'email pour activer votre compte.
          </p>
          <Link href="/connexion">
            <Button variant="outline">
              Retour à la connexion
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Loading
  if (status === "loading") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-rose-600" />
          <CardTitle className="text-2xl mt-4">Vérification en cours</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-500">
            Veuillez patienter...
          </p>
        </CardContent>
      </Card>
    );
  }

  // Success
  if (status === "success") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Email vérifié</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            {message}
          </p>
          <p className="text-xs text-gray-500">
            Redirection vers la page de connexion...
          </p>
          <Link href="/connexion">
            <Button className="mt-4">
              Se connecter
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Error
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
          <XCircle className="h-6 w-6 text-red-600" />
        </div>
        <CardTitle className="text-2xl">Erreur de vérification</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-gray-600 mb-4">
          {message}
        </p>
        <Link href="/connexion">
          <Button variant="outline">
            Retour à la connexion
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
