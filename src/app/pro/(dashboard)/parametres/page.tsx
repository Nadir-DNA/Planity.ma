"use client";

import { useState, useEffect, useTransition } from "react";
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
  Loader2,
  Plus,
  X,
} from "lucide-react";
import { MOROCCAN_CITIES, SALON_CATEGORIES } from "@/lib/constants";
import { toast } from "react-hot-toast";

interface SalonData {
  id: string;
  name: string;
  category: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
  description: string;
}

interface ScheduleEntry {
  dayOfWeek: number;
  dayName: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

interface Photo {
  id: string;
  url: string;
  alt: string;
  order: number;
}

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

export default function ParametresPage() {
  const [salon, setSalon] = useState<SalonData | null>(null);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [isPending, startTransition] = useTransition();

  // Form state
  const [salonName, setSalonName] = useState("");
  const [salonCategory, setSalonCategory] = useState("");
  const [salonAddress, setSalonAddress] = useState("");
  const [salonCity, setSalonCity] = useState("");
  const [salonPhone, setSalonPhone] = useState("");
  const [salonEmail, setSalonEmail] = useState("");
  const [salonDescription, setSalonDescription] = useState("");

  useEffect(() => {
    async function fetchSalon() {
      try {
        setLoading(true);
        const res = await fetch("/api/v1/pro/salon");
        if (res.ok) {
          const data = await res.json();
          if (data.salon) {
            setSalon(data.salon);
            setSalonName(data.salon.name || "");
            setSalonCategory(data.salon.category || "");
            setSalonAddress(data.salon.address || "");
            setSalonCity(data.salon.city || "");
            setSalonPhone(data.salon.phone || "");
            setSalonEmail(data.salon.email || "");
            setSalonDescription(data.salon.description || "");
          }
          if (data.schedule) {
            const sched = DAYS.map((day, i) => {
              const existing = data.schedule.find((s: { dayOfWeek: number }) => s.dayOfWeek === i);
              return {
                dayOfWeek: i,
                dayName: day,
                isOpen: !!existing,
                openTime: existing?.openTime || "09:00",
                closeTime: existing?.closeTime || "19:00",
              };
            });
            setSchedule(sched);
          }
          if (data.photos) {
            setPhotos(data.photos);
          }
        }
      } catch {
        toast.error("Erreur de chargement");
      } finally {
        setLoading(false);
      }
    }
    fetchSalon();
  }, []);

  async function saveSalonInfo() {
    setSaving(true);
    try {
      const res = await fetch("/api/v1/pro/salon", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: salonName,
          category: salonCategory,
          address: salonAddress,
          city: salonCity,
          phone: salonPhone,
          email: salonEmail,
          description: salonDescription,
        }),
      });
      if (res.ok) {
        toast.success("Informations sauvegardées !");
      } else {
        const data = await res.json();
        toast.error(data.error || "Erreur lors de la sauvegarde");
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setSaving(false);
    }
  }

  async function saveSchedule() {
    setSavingSchedule(true);
    try {
      const res = await fetch("/api/v1/pro/salon", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          openingHours: schedule.map((s) => ({
            dayOfWeek: s.dayOfWeek,
            isOpen: s.isOpen,
            openTime: s.openTime,
            closeTime: s.closeTime,
          })),
        }),
      });
      if (res.ok) {
        toast.success("Horaires sauvegardés !");
      } else {
        toast.error("Erreur lors de la sauvegarde");
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setSavingSchedule(false);
    }
  }

  async function addPhoto() {
    if (!newPhotoUrl.trim()) return;
    try {
      const res = await fetch("/api/v1/pro/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newPhotoUrl.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setPhotos([...photos, data.photo]);
        setNewPhotoUrl("");
        toast.success("Photo ajoutée !");
      } else {
        toast.error("Erreur lors de l'ajout");
      }
    } catch {
      toast.error("Erreur de connexion");
    }
  }

  async function deletePhoto(photoId: string) {
    try {
      const res = await fetch(`/api/v1/pro/photos?id=${photoId}`, { method: "DELETE" });
      if (res.ok) {
        setPhotos(photos.filter((p) => p.id !== photoId));
        toast.success("Photo supprimée");
      }
    } catch {
      toast.error("Erreur");
    }
  }

  function updateSchedule(dayIndex: number, field: string, value: string | boolean) {
    setSchedule((prev) =>
      prev.map((s, i) => (i === dayIndex ? { ...s, [field]: value } : s))
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

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
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du salon</label>
              <Input value={salonName} onChange={(e) => setSalonName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select
                  value={salonCategory}
                  onChange={(e) => setSalonCategory(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Choisir</option>
                  {SALON_CATEGORIES.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                <select
                  value={salonCity}
                  onChange={(e) => setSalonCity(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Choisir</option>
                  {MOROCCAN_CITIES.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
              <Input value={salonAddress} onChange={(e) => setSalonAddress(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <Input value={salonPhone} onChange={(e) => setSalonPhone(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input type="email" value={salonEmail} onChange={(e) => setSalonEmail(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                rows={3}
                value={salonDescription}
                onChange={(e) => setSalonDescription(e.target.value)}
              />
            </div>
            <Button onClick={saveSalonInfo} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Enregistrer
            </Button>
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img
                    src={photo.url}
                    alt={photo.alt || "Photo salon"}
                    className="aspect-square object-cover rounded-lg"
                  />
                  <button
                    onClick={() => deletePhoto(photo.id)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="URL de la photo (https://...)"
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
              />
              <Button onClick={addPhoto} disabled={!newPhotoUrl.trim()}>
                <Plus className="h-4 w-4 mr-1" /> Ajouter
              </Button>
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
              {schedule.map((s, i) => (
                <div key={s.dayName} className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2 w-28">
                    <input
                      type="checkbox"
                      checked={s.isOpen}
                      onChange={(e) => updateSchedule(i, "isOpen", e.target.checked)}
                      className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                    />
                    <span className="text-sm font-medium">{s.dayName}</span>
                  </label>
                  <Input
                    type="time"
                    value={s.openTime}
                    onChange={(e) => updateSchedule(i, "openTime", e.target.value)}
                    className="w-28"
                    disabled={!s.isOpen}
                  />
                  <span className="text-gray-400">-</span>
                  <Input
                    type="time"
                    value={s.closeTime}
                    onChange={(e) => updateSchedule(i, "closeTime", e.target.value)}
                    className="w-28"
                    disabled={!s.isOpen}
                  />
                </div>
              ))}
            </div>
            <Button className="mt-4" onClick={saveSchedule} disabled={savingSchedule}>
              {savingSchedule ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Enregistrer les horaires
            </Button>
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
              La suppression de votre salon est irréversible. Toutes les données seront perdues.
            </p>
            <Button variant="destructive">Supprimer mon salon</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
