"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CreditCard } from "lucide-react";

interface DodoPaymentButtonProps {
  bookingId: string;
  amount: number;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

/**
 * Dodo Payment Button Component
 * 
 * Renders a button that initiates a Dodo Payment checkout session.
 * Redirects user to Dodo's secure checkout page.
 */
export function DodoPaymentButton({
  bookingId,
  amount,
  onSuccess,
  onError,
  className,
}: DodoPaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/payments/dodo/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          amount,
          method: "CARD",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Échec du paiement");
      }

      // Redirect to Dodo checkout
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        throw new Error("URL de paiement non disponible");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      console.error("Dodo payment error:", error);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isLoading}
      className={className}
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Traitement en cours...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Payer {amount.toFixed(2)} MAD avec Dodo Payment
        </>
      )}
    </Button>
  );
}

/**
 * Dodo Payment Card Component
 * 
 * Renders a complete payment card with Dodo Payment integration.
 */
export function DodoPaymentCard({
  bookingId,
  amount,
  onSuccess,
  onError,
}: Omit<DodoPaymentButtonProps, "className">) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Paiement sécurisé</CardTitle>
        <CardDescription>
          Réglez votre réservation en toute sécurité via Dodo Payment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Montant total</span>
            <span className="text-2xl font-bold">{amount.toFixed(2)} MAD</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Paiement sécurisé par Dodo Payment • Carte bancaire • 3D Secure
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <DodoPaymentButton
          bookingId={bookingId}
          amount={amount}
          onSuccess={onSuccess}
          onError={onError}
          className="w-full"
        />
      </CardFooter>
    </Card>
  );
}
