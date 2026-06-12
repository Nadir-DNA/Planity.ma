"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

/**
 * Bannière affichée sur le dashboard pro tant que le salon n'est pas activé
 * (abonnement Dodo non payé). Propose de (re)lancer le checkout.
 */
export function SalonActivationBanner() {
  const [inactive, setInactive] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/v1/pro/salon")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.salon && data.salon.isActive === false) {
          setInactive(true);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  async function startPayment() {
    setRedirecting(true);
    try {
      const res = await fetch("/api/v1/pro/salon/activate", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
      toast.error(data.error || "Impossible de lancer le paiement, réessayez.");
    } catch {
      toast.error("Erreur de connexion");
    }
    setRedirecting(false);
  }

  if (!inactive) return null;

  return (
    <div className="mx-4 mt-4 flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4">
      <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
      <div className="flex-1">
        <p className="text-sm font-medium text-amber-800">
          Votre salon n&apos;est pas encore visible en ligne
        </p>
        <p className="text-sm text-amber-700">
          Finalisez votre abonnement pour apparaître dans les recherches et
          recevoir des réservations.
        </p>
      </div>
      <Button onClick={startPayment} disabled={redirecting} className="shrink-0">
        {redirecting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <CreditCard className="h-4 w-4 mr-2" />
        )}
        Finaliser le paiement
      </Button>
    </div>
  );
}
