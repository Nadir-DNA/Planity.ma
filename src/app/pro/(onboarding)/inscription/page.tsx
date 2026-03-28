"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  Clock,
  Scissors,
  Users,
  Check,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { MOROCCAN_CITIES, SALON_CATEGORIES, DAYS_OF_WEEK } from "@/lib/constants";

const STEPS = [
  { label: "Votre salon", icon: Building2 },
  { label: "Horaires", icon: Clock },
  { label: "Services", icon: Scissors },
  { label: "Equipe", icon: Users },
];

export default function ProRegistrationPage() {
  const [step, setStep] = useState(0);

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Inscrivez votre salon
        </h1>
        <p className="text-gray-500 mt-2">
          Configurez votre espace professionnel en quelques minutes
        </p>
      </div>

      {/* Steps */}
      <div className="flex items-center justify-center mb-8">
        {STEPS.map((s, i) => (
          <div key={s.label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  i <= step
                    ? "bg-rose-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {i < step ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
              </div>
              <span className="text-xs mt-1 hidden sm:block">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-16 sm:w-24 h-0.5 mx-2 ${
                  i < step ? "bg-rose-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Salon info */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Informations de votre salon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du salon *
              </label>
              <Input placeholder="Ex: Salon Elegance" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categorie *
              </label>
              <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500">
                <option value="">Selectionnez une categorie</option>
                {SALON_CATEGORIES.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse *
              </label>
              <Input placeholder="123 Boulevard Mohammed V" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ville *
                </label>
                <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500">
                  <option value="">Selectionnez</option>
                  {MOROCCAN_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telephone *
                </label>
                <Input type="tel" placeholder="+212 5XX-XXXXXX" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input type="email" placeholder="contact@monsalon.ma" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                rows={3}
                placeholder="Decrivez votre salon en quelques lignes..."
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Opening hours */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Horaires d&apos;ouverture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {DAYS_OF_WEEK.map((day, i) => (
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
          </CardContent>
        </Card>
      )}

      {/* Step 3: Services */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Vos services</CardTitle>
              <Button variant="outline" size="sm">
                <Scissors className="h-4 w-4 mr-1" />
                Ajouter un service
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Ajoutez les services que vous proposez avec leurs prix et durees.
              Vous pourrez les modifier plus tard.
            </p>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="grid grid-cols-3 gap-3">
                  <Input placeholder="Nom du service" />
                  <Input type="number" placeholder="Prix (DH)" />
                  <Input type="number" placeholder="Duree (min)" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Team */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Votre equipe</CardTitle>
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-1" />
                Ajouter un membre
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Ajoutez les membres de votre equipe. Chaque membre aura son
              propre planning.
            </p>
            <div className="space-y-3">
              {[1].map((i) => (
                <div key={i} className="grid grid-cols-2 gap-3">
                  <Input placeholder="Prenom et nom" />
                  <Input placeholder="Poste (ex: Coiffeur)" />
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-800">
                Votre salon est pret !
              </p>
              <p className="text-sm text-green-600 mt-1">
                Cliquez sur &quot;Terminer&quot; pour activer votre page et commencer a
                recevoir des reservations en ligne.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>
        <Button onClick={() => setStep(Math.min(3, step + 1))}>
          {step === 3 ? (
            <>
              <Check className="h-4 w-4 mr-1" />
              Terminer
            </>
          ) : (
            <>
              Suivant
              <ArrowRight className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
