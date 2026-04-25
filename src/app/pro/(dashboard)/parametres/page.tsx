"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  Clock,
  Bell,
  Trash2,
  Globe,
  Image as ImageIcon,
  Upload,
} from "lucide-react";
import { MOROCCAN_CITIES, SALON_CATEGORIES } from "@/lib/constants";

export default function ParametresPage() {
  const [salonName, setSalonName] = useState("Salon Elegance");
  const [salonCategory, setSalonCategory] = useState("coiffeur");
  const [salonAddress, setSalonAddress] = useState("123 Boulevard Mohammed V");
  const [salonCity, setSalonCity] = useState("Casablanca");
  const [salonPhone, setSalonPhone] = useState("+212 5XX-XXXXXX");
  const [salonEmail, setSalonEmail] = useState("contact@salon-elegance.ma");
  const [salonWebsite, setSalonWebsite] = useState("https://salon-elegance.ma");
  const [salonDescription, setSalonDescription] = useState(
    "Salon de coiffure haut de gamme au coeur de Casablanca."
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Paramètres</h1>

      <div className="space-y-6">
        {/* Salon info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Informations du salon
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du salon
              </label>
              <Input
                value={salonName}
                onChange={(e) => setSalonName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                value={salonCategory}
                onChange={(e) => setSalonCategory(e.target.value)}
              >
                {SALON_CATEGORIES.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse
              </label>
              <Input
                value={salonAddress}
                onChange={(e) => setSalonAddress(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ville
                </label>
                <select
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                  value={salonCity}
                  onChange={(e) => setSalonCity(e.target.value)}
                >
                  {MOROCCAN_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <Input
                  value={salonPhone}
                  onChange={(e) => setSalonPhone(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={salonEmail}
                  onChange={(e) => setSalonEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site web
                </label>
                <Input
                  value={salonWebsite}
                  onChange={(e) => setSalonWebsite(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                rows={3}
                value={salonDescription}
                onChange={(e) => setSalonDescription(e.target.value)}
              />
            </div>
            <Button>Enregistrer</Button>
          </CardContent>
        </Card>

        {/* Photos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ImageIcon className="h-5 w-5 mr-2" />
              Photos du salon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-gradient-to-br from-rose-100 to-rose-200 rounded-lg"
                />
              ))}
              <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-rose-400 transition-colors">
                <div className="text-center">
                  <Upload className="h-6 w-6 text-gray-400 mx-auto" />
                  <p className="text-xs text-gray-500 mt-1">Ajouter</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Opening hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Horaires d&apos;ouverture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                "Lundi",
                "Mardi",
                "Mercredi",
                "Jeudi",
                "Vendredi",
                "Samedi",
                "Dimanche",
              ].map((day, i) => (
                <div key={day} className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2 w-28">
                    <input
                      type="checkbox"
                      defaultChecked={i < 6}
                      className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                    />
                    <span className="text-sm font-medium">{day}</span>
                  </label>
                  <Input type="time" defaultValue="09:00" className="w-28" />
                  <span className="text-gray-400">-</span>
                  <Input
                    type="time"
                    defaultValue={i === 5 ? "20:00" : "19:00"}
                    className="w-28"
                  />
                </div>
              ))}
            </div>
            <Button className="mt-4">Enregistrer</Button>
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
              { label: "Nouvelle réservation", key: "new_booking" },
              { label: "Annulation de RDV", key: "cancelation" },
              { label: "Nouvel avis", key: "new_review" },
              { label: "Rappel RDV", key: "reminder" },
            ].map((pref) => (
              <label key={pref.key} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{pref.label}</span>
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                />
              </label>
            ))}
            <Button>Enregistrer</Button>
          </CardContent>
        </Card>

        {/* Stripe */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Paiements (Stripe)
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
               <p className="text-sm font-medium text-blue-800">
                 Connectez votre compte CMI pour recevoir les paiements
               </p>
               <p className="text-sm text-blue-600 mt-1">
                 Les paiements en ligne et les dépôts seront gérés via CMI (Centre Monétique Interbancaire).
               </p>
               <Button className="mt-3">Connecter CMI</Button>
             </div>
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
              La suppression de votre salon est irréversible. Toutes les données
              seront perdues.
            </p>
            <Button variant="destructive">Supprimer mon salon</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
