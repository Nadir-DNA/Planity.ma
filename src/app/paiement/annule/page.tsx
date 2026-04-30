import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

/**
 * Dodo Payment Cancelled Page
 * 
 * Displayed when a payment is cancelled by the user.
 */
export default function PaymentCancelledPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <XCircle className="h-16 w-16 text-red-500 mx-auto" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Paiement annulé
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Votre paiement a été annulé. Votre réservation n&apos;a pas été confirmée.
        </p>
        
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4 inline mr-2" />
            Réessayer
          </Link>
          
          <Link
            href="/"
            className="block w-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
