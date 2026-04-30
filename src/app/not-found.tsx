
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-8 text-center">
        <h1 className="text-6xl font-bold text-mint mb-4">404</h1>
        <h2 className="text-xl font-semibold mb-2">Page introuvable</h2>
        <p className="text-neutral-500 mb-6">
          La page que vous recherchez n existe pas ou a été déplacée.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/">
            <Button variant="primary">Retour à l accueil</Button>
          </Link>
          <Link href="/recherche">
            <Button variant="outline">Trouver un salon</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
