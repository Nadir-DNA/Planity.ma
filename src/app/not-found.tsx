import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-gray-900">404</h1>
      <p className="text-xl text-gray-600 mt-4">Page introuvable</p>
      <p className="text-gray-500 mt-2">
        La page que vous cherchez n&apos;existe pas ou a ete deplacee.
      </p>
      <Button className="mt-8" asChild>
        <Link href="/">
          <Home className="mr-2 h-4 w-4" />
          Retour a l&apos;accueil
        </Link>
      </Button>
    </div>
  );
}
