import Link from "next/link";
import { TrendingUp, Bell, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const proStats = [
  { icon: TrendingUp, stat: "+50%", description: "de fréquence sur les RDV en ligne" },
  { icon: Bell, stat: "-30%", description: "d'oublis avec rappels SMS" },
  { icon: Clock, stat: "50%", description: "des RDV pris hors horaires" },
];

export function ProCTA() {
  return (
    <section className="py-20 sm:py-28 bg-surface-container">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="bg-surface-bright rounded-md p-8 sm:p-12 border border-outline-light">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text content */}
            <div>
              <p className="text-xs uppercase tracking-widest text-on-surface-muted mb-4">
                Pour les professionnels
              </p>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-on-surface">
                Gérez vos réservations,
                <br />
                <span className="text-on-surface-variant">simplement.</span>
              </h2>
              <p className="mt-4 text-sm text-on-surface-muted leading-relaxed max-w-lg">
                Planity.ma vous offre les outils pour développer votre activité :
                agenda en ligne, rappels SMS, gestion des clients et statistiques
                détaillées.
              </p>
              <div className="mt-6">
                <Link href="/pro/inscription">
                  <Button className="bg-primary hover:bg-on-surface text-primary-on rounded-md px-6 py-3 text-sm font-medium">
                    Commencer gratuitement
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Stats */}
            <div className="grid grid-cols-1 gap-6">
              {proStats.map((item) => (
                <div
                  key={item.stat}
                  className="flex items-start space-x-4 p-4 rounded-md bg-surface border border-outline-light"
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-md bg-surface-container flex-shrink-0">
                    <item.icon className="h-4 w-4 text-on-surface-variant" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold tracking-tight text-on-surface">
                      {item.stat}
                    </p>
                    <p className="text-xs text-on-surface-muted mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}