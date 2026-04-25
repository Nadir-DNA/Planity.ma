"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Icons unused in this page - removed

export default function FinancesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Finances</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Revenus ce mois</p>
            <p className="text-2xl font-bold">1.2M DH</p>
            <p className="text-xs text-green-600 mt-1">+15% vs mois dernier</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Commissions</p>
            <p className="text-2xl font-bold">120K DH</p>
            <p className="text-xs text-green-600 mt-1">+12% vs mois dernier</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Remboursements</p>
            <p className="text-2xl font-bold">15K DH</p>
            <p className="text-xs text-red-600 mt-1">-5% vs mois dernier</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">En attente</p>
            <p className="text-2xl font-bold">45K DH</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Les transactions seront affichées ici une fois Stripe Connect activé.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
