
"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorFallback } from "@/components/ui/error-boundary";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-8 text-center">
        <h1 className="text-6xl font-bold text-red-500 mb-4">500</h1>
        <h2 className="text-xl font-semibold mb-2">Erreur serveur</h2>
        <p className="text-neutral-500 mb-6">
          Une erreur s est produite. Veuillez réessayer ou contacter le support.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="primary">Réessayer</Button>
          <Link href="/">
            <Button variant="outline">Retour à l accueil</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
