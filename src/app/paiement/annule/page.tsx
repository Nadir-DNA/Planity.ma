"use client";

import { X, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function PaymentCancelledPage() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div
        className={`
          relative max-w-md w-full bg-surface-bright rounded-2xl overflow-hidden
          transition-all duration-700 ease-out
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        `}
      >
        {/* Cancel gradient bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400" />

        <div className="p-10 text-center">
          {/* Cancel icon */}
          <div className="relative mx-auto mb-7 w-20 h-20">
            <div className="absolute inset-0 bg-amber-50 rounded-full animate-ping opacity-20" />
            <div className="relative w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center">
              <X className="h-10 w-10 text-amber-500" strokeWidth={2.5} />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-semibold tracking-tight text-on-surface mb-2">
            Paiement annulé
          </h1>
          <p className="text-on-surface-muted text-sm leading-relaxed mb-8">
            Votre paiement a été annulé. Aucun montant n&apos;a été débité. Vous pouvez réessayer quand vous le souhaitez.
          </p>

          {/* Divider */}
          <div className="border-t border-outline-light mb-8" />

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/"
              className="
                group flex items-center justify-center w-full h-12
                bg-on-surface text-surface-bright
                font-medium text-sm tracking-wide
                rounded-xl
                transition-all duration-200
                hover:opacity-85
                active:scale-[0.98]
              "
            >
              <RefreshCw className="h-4 w-4 mr-2.5" strokeWidth={1.8} />
              Réessayer
            </Link>

            <Link
              href="/"
              className="
                group flex items-center justify-center w-full h-11
                text-on-surface-variant text-sm font-medium
                rounded-xl border border-outline-light
                transition-all duration-200
                hover:bg-surface-low hover:border-outline-medium
                active:scale-[0.98]
              "
            >
              <ArrowLeft className="h-4 w-4 mr-2" strokeWidth={1.8} />
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
