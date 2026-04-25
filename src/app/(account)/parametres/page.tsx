"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, Lock, Bell, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const [firstName, setFirstName] = useState("Fatima");
  const [lastName, setLastName] = useState("Zahri");
  const [email, setEmail] = useState("fatima@email.com");
  const [phone, setPhone] = useState("+212 661-123456");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Paramètres</h1>

      <div className="space-y-6">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom
                </label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom
                </label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="inline h-4 w-4 mr-1" />
                Email
              </label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="inline h-4 w-4 mr-1" />
                Téléphone
              </label>
              <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <Button>Enregistrer</Button>
          </CardContent>
        </Card>

        {/* Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="h-5 w-5 mr-2" />
              Mot de passe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe actuel
              </label>
              <Input type="password" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nouveau mot de passe
              </label>
              <Input type="password" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le nouveau mot de passe
              </label>
              <Input type="password" />
            </div>
            <Button>Changer le mot de passe</Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Rappels de rendez-vous par email", key: "email_reminder" },
              { label: "Rappels de rendez-vous par SMS", key: "sms_reminder" },
              { label: "Offres et promotions", key: "marketing" },
              { label: "Newsletters", key: "newsletter" },
            ].map((pref) => (
              <label key={pref.key} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{pref.label}</span>
                <input
                  type="checkbox"
                  defaultChecked={pref.key.includes("reminder")}
                  className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                />
              </label>
            ))}
            <Button>Enregistrer les préférences</Button>
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <Trash2 className="h-5 w-5 mr-2" />
              Zone de danger
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              La suppression de votre compte est irréversible. Toutes vos
              données seront perdues.
            </p>
            <Button variant="destructive">Supprimer mon compte</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
