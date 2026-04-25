"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
  Lock,
} from "lucide-react";
import { MOROCCAN_CITIES, SALON_CATEGORIES, DAYS_OF_WEEK } from "@/lib/constants";
import { completeProOnboarding } from "@/server/actions/pro";

const STEPS = [
  { label: "Votre salon", icon: Building2 },
  { label: "Horaires", icon: Clock },
  { label: "Services", icon: Scissors },
  { label: "Équipe", icon: Users },
];

interface ServiceData {
  name: string;
  price: string;
  duration: string;
}

interface StaffData {
  name: string;
  title: string;
}

export default function ProRegistrationPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Salon info
  const [salonInfo, setSalonInfo] = useState({
    name: "",
    category: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    description: "",
  });

  // Password
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Opening hours
  const [openingHours, setOpeningHours] = useState(
    DAYS_OF_WEEK.map((day, i) => ({
      day,
      isOpen: i < 6,
      openTime: "09:00",
      closeTime: i === 5 ? "20:00" : "19:00",
    }))
  );

  // Services
  const [services, setServices] = useState<ServiceData[]>([
    { name: "", price: "", duration: "" },
    { name: "", price: "", duration: "" },
    { name: "", price: "", duration: "" },
  ]);

  // Staff
  const [staff, setStaff] = useState<StaffData[]>([
    { name: "", title: "" },
  ]);

  function updateSalonInfo(field: string, value: string) {
    setSalonInfo((prev) => ({ ...prev, [field]: value }));
  }

  function updateOpeningHours(index: number, field: string, value: string | boolean) {
    setOpeningHours((prev) =>
      prev.map((h, i) => (i === index ? { ...h, [field]: value } : h))
    );
  }

  function updateService(index: number, field: string, value: string) {
    setServices((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  }

  function updateStaff(index: number, field: string, value: string) {
    setStaff((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  }

  function addService() {
    setServices((prev) => [...prev, { name: "", price: "", duration: "" }]);
  }

  function removeService(index: number) {
    setServices((prev) => prev.filter((_, i) => i !== index));
  }

  function addStaff() {
    setStaff((prev) => [...prev, { name: "", title: "" }]);
  }

  function removeStaff(index: number) {
    setStaff((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    setError("");

    // Validate password
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    startTransition(async () => {
      try {
        const result = await completeProOnboarding({
          firstName: salonInfo.name.split(" ")[0] || "Propriétaire",
          lastName: salonInfo.name.split(" ").slice(1).join(" ") || "Salon",
          email: salonInfo.email,
          phone: salonInfo.phone,
          password,
          salonName: salonInfo.name,
          salonCategory: salonInfo.category,
          salonAddress: salonInfo.address,
          salonCity: salonInfo.city,
          salonPostalCode: undefined,
          salonPhone: salonInfo.phone,
          salonEmail: salonInfo.email,
          salonDescription: salonInfo.description,
          openingHours: openingHours.map((h) => ({
            day: h.day,
            isOpen: h.isOpen,
            openTime: h.openTime,
            closeTime: h.closeTime,
          })),
          services: services.filter((s) => s.name && s.price && s.duration),
          staff: staff.filter((s) => s.name),
        });

        if ("error" in result) {
          setError(result.error);
          return;
        }

        // Redirect to dashboard
        router.push("/pro/agenda");
      } catch {
        setError("Une erreur est survenue lors de la création du salon");
      }
    });
  }

  const isStepValid = () => {
    switch (step) {
      case 0:
        return salonInfo.name && salonInfo.category && salonInfo.address && salonInfo.city && salonInfo.phone && salonInfo.email;
      case 1:
        return openingHours.some((h) => h.isOpen);
      case 2:
        return services.some((s) => s.name && s.price && s.duration);
      case 3:
        return staff.some((s) => s.name);
      default:
        return true;
    }
  };

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

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

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
              <Input
                placeholder="Ex: Salon Elegance"
                value={salonInfo.name}
                onChange={(e) => updateSalonInfo("name", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie *
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                value={salonInfo.category}
                onChange={(e) => updateSalonInfo("category", e.target.value)}
              >
                <option value="">Sélectionnez une catégorie</option>
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
              <Input
                placeholder="123 Boulevard Mohammed V"
                value={salonInfo.address}
                onChange={(e) => updateSalonInfo("address", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ville *
                </label>
                <select
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  value={salonInfo.city}
                  onChange={(e) => updateSalonInfo("city", e.target.value)}
                >
                  <option value="">Sélectionnez</option>
                  {MOROCCAN_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone *
                </label>
                <Input
                  type="tel"
                  placeholder="+212 5XX-XXXXXX"
                  value={salonInfo.phone}
                  onChange={(e) => updateSalonInfo("phone", e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <Input
                type="email"
                placeholder="contact@monsalon.ma"
                value={salonInfo.email}
                onChange={(e) => updateSalonInfo("email", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                rows={3}
                placeholder="Décrivez votre salon en quelques lignes..."
                value={salonInfo.description}
                onChange={(e) => updateSalonInfo("description", e.target.value)}
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
              {openingHours.map((h, i) => (
                <div key={h.day} className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2 w-28">
                    <input
                      type="checkbox"
                      checked={h.isOpen}
                      onChange={(e) => updateOpeningHours(i, "isOpen", e.target.checked)}
                      className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                    />
                    <span className="text-sm font-medium">{h.day}</span>
                  </label>
                  <Input
                    type="time"
                    value={h.openTime}
                    onChange={(e) => updateOpeningHours(i, "openTime", e.target.value)}
                    disabled={!h.isOpen}
                    className="w-28"
                  />
                  <span className="text-gray-400">-</span>
                  <Input
                    type="time"
                    value={h.closeTime}
                    onChange={(e) => updateOpeningHours(i, "closeTime", e.target.value)}
                    disabled={!h.isOpen}
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
              <Button variant="outline" size="sm" onClick={addService}>
                <Scissors className="h-4 w-4 mr-1" />
                Ajouter un service
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Ajoutez les services que vous proposez avec leurs prix et durées.
              Vous pourrez les modifier plus tard.
            </p>
            <div className="space-y-3">
              {services.map((s, i) => (
                <div key={i} className="grid grid-cols-4 gap-3 items-end">
                  <Input
                    placeholder="Nom du service"
                    value={s.name}
                    onChange={(e) => updateService(i, "name", e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Prix (DH)"
                    value={s.price}
                    onChange={(e) => updateService(i, "price", e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Durée (min)"
                    value={s.duration}
                    onChange={(e) => updateService(i, "duration", e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeService(i)}
                    disabled={services.length === 1}
                  >
                    Supprimer
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Team + Password */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Votre équipe</CardTitle>
              <Button variant="outline" size="sm" onClick={addStaff}>
                <Users className="h-4 w-4 mr-1" />
                Ajouter un membre
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Ajoutez les membres de votre équipe. Chaque membre aura son
              propre planning.
            </p>
            <div className="space-y-3">
              {staff.map((s, i) => (
                <div key={i} className="grid grid-cols-3 gap-3 items-end">
                  <Input
                    placeholder="Prénom et nom"
                    value={s.name}
                    onChange={(e) => updateStaff(i, "name", e.target.value)}
                  />
                  <Input
                    placeholder="Poste (ex: Coiffeur)"
                    value={s.title}
                    onChange={(e) => updateStaff(i, "title", e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStaff(i)}
                    disabled={staff.length === 1}
                  >
                    Supprimer
                  </Button>
                </div>
              ))}
            </div>

            {/* Password section */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Lock className="h-4 w-4 mr-2" />
                Mot de passe de votre compte
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe *
                  </label>
                  <Input
                    type="password"
                    placeholder="Minimum 8 caractères"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmer le mot de passe *
                  </label>
                  <Input
                    type="password"
                    placeholder="Confirmez votre mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-800">
                Votre salon est prêt !
              </p>
              <p className="text-sm text-green-600 mt-1">
                Cliquez sur &quot;Terminer&quot; pour activer votre page et commencer à
                recevoir des réservations en ligne.
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
          disabled={step === 0 || isPending}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>
        <Button
          onClick={() => {
            if (step === 3) {
              handleSubmit();
            } else {
              setStep(Math.min(3, step + 1));
            }
          }}
          disabled={!isStepValid() || isPending}
        >
          {step === 3 ? (
            <>
              {isPending ? "Création..." : "Terminer"}
              {!isPending && <Check className="h-4 w-4 ml-1" />}
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
