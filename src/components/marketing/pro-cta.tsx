import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Calendar, Users } from "lucide-react";

export function ProCTA() {
  return (
    <section className="py-16 sm:py-24 bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Vous etes professionnel de la beaute ?
            </h2>
            <p className="mt-4 text-lg text-gray-300">
              Gerez votre salon, vos rendez-vous et vos clients avec notre
              plateforme tout-en-un. Rejoignez les centaines de professionnels
              qui nous font confiance.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <Calendar className="h-6 w-6 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white">Agenda en ligne</p>
                  <p className="text-sm text-gray-400">
                    Gerez vos rendez-vous facilement
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Users className="h-6 w-6 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white">Fichier clients</p>
                  <p className="text-sm text-gray-400">
                    CRM complet pour votre salon
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <BarChart3 className="h-6 w-6 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white">Statistiques</p>
                  <p className="text-sm text-gray-400">
                    Suivez vos performances
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href="/pro/inscription">
                  Inscrire mon salon gratuitement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="rounded-2xl bg-gray-800 p-8 shadow-2xl">
              <div className="space-y-4">
                <div className="h-4 w-32 rounded bg-gray-700" />
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 35 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-8 rounded ${
                        i % 5 === 0
                          ? "bg-rose-600/30"
                          : i % 3 === 0
                          ? "bg-blue-600/30"
                          : "bg-gray-700"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex space-x-2 mt-4">
                  <div className="h-3 w-3 rounded-full bg-rose-500" />
                  <div className="h-3 w-20 rounded bg-gray-700" />
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <div className="h-3 w-16 rounded bg-gray-700" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
