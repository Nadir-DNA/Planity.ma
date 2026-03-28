"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus,
  CreditCard,
  Banknote,
  Receipt,
  Search,
} from "lucide-react";

const todayTransactions = [
  {
    id: "1",
    client: "Fatima Z.",
    services: ["Coupe femme", "Brushing"],
    amount: 250,
    method: "CARD",
    time: "10:30",
  },
  {
    id: "2",
    client: "Ahmed K.",
    services: ["Coupe homme"],
    amount: 80,
    method: "CASH",
    time: "11:00",
  },
  {
    id: "3",
    client: "Amina B.",
    services: ["Coloration"],
    amount: 300,
    method: "CARD",
    time: "12:30",
  },
];

export default function CaissePage() {
  const totalToday = todayTransactions.reduce((sum, t) => sum + t.amount, 0);
  const cardTotal = todayTransactions
    .filter((t) => t.method === "CARD")
    .reduce((sum, t) => sum + t.amount, 0);
  const cashTotal = todayTransactions
    .filter((t) => t.method === "CASH")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Caisse</h1>
          <p className="text-sm text-gray-500 mt-1">
            Encaissements et transactions
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Receipt className="h-4 w-4 mr-1" />
            Rapport Z
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Nouvel encaissement
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total aujourd&apos;hui</p>
            <p className="text-2xl font-bold mt-1">{totalToday} DH</p>
            <p className="text-xs text-gray-400">{todayTransactions.length} transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-blue-500" />
              <p className="text-sm text-gray-500">Carte bancaire</p>
            </div>
            <p className="text-2xl font-bold mt-1">{cardTotal} DH</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Banknote className="h-4 w-4 text-green-500" />
              <p className="text-sm text-gray-500">Especes</p>
            </div>
            <p className="text-2xl font-bold mt-1">{cashTotal} DH</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transactions du jour</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input placeholder="Rechercher..." className="pl-10 h-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {todayTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-bold text-sm">
                    {tx.client.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{tx.client}</p>
                    <p className="text-sm text-gray-500">
                      {tx.services.join(", ")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{tx.amount} DH</p>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <Badge variant={tx.method === "CARD" ? "default" : "secondary"} className="text-xs">
                      {tx.method === "CARD" ? "Carte" : "Especes"}
                    </Badge>
                    <span className="text-xs text-gray-400">{tx.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
