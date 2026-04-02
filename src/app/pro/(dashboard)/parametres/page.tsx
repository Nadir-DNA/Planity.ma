"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Clock, CreditCard, Bell } from "lucide-react";
import { MOROCCAN_CITIES, DAYS_OF_WEEK } from "@/lib/constants";

export default function ProSettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Parametres du salon
      </h1>

      <div className="space-y-6">
        {/* Salon info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Informations generales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du salon
                </label>
                <Input defaultValue="Salon Elegance" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telephone
                </label>
                <Input defaultValue="+212 522-123456" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse
              </label>
              <Input defaultValue="123 Boulevard Mohammed V" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ville
                </label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500">
                  {MOROCCAN_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input defaultValue="contact@salon-elegance.ma" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                rows={3}
                defaultValue="Salon de coiffure haut de gamme au coeur de Casablanca."
              />
            </div>
            <Button>Enregistrer</Button>
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
              {DAYS_OF_WEEK.map((day, i) => (
                <div key={day} className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2 w-28">
                    <input
                      type="checkbox"
                      defaultChecked={i < 6}
                      className="rounded border-gray-300 text-rose-600"
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
            <Button className="mt-4">Enregistrer les horaires</Button>
          </CardContent>
        </Card>

        {/* Booking policy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Politique de reservation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Politique d&apos;annulation
              </label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                rows={2}
                defaultValue="Annulation gratuite jusqu'a 24h avant le rendez-vous."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Acompte requis (%)
                </label>
                <Input type="number" defaultValue="0" min="0" max="100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delai minimum de reservation
                </label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500">
                  <option value="0">Pas de delai minimum</option>
                  <option value="1">1 heure avant</option>
                  <option value="2">2 heures avant</option>
                  <option value="24">24 heures avant</option>
                </select>
              </div>
            </div>
            <Button>Enregistrer</Button>
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
              { label: "Nouvelle reservation (email)", key: "new_booking_email" },
              { label: "Nouvelle reservation (SMS)", key: "new_booking_sms" },
              { label: "Annulation de reservation", key: "cancel_booking" },
              { label: "Nouvel avis client", key: "new_review" },
              { label: "Rappel de cloture de caisse", key: "pos_close" },
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
      </div>
    </div>
  );
}
