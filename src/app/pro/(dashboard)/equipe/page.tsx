"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
  Users,
  Palette,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Schedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isWorking: boolean;
}

interface StaffMember {
  id: string;
  displayName: string;
  title?: string | null;
  bio?: string | null;
  color: string;
  avatar?: string | null;
  isActive: boolean;
  schedules: Schedule[];
  services: { serviceId: string; service: { id: string; name: string } }[];
}

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
  "#EC4899", "#06B6D4", "#F97316", "#6366F1", "#14B8A6",
];

export default function ProEquipePage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<StaffMember | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    displayName: "",
    title: "",
    bio: "",
    color: COLORS[0],
    isActive: true,
    schedules: DAYS.map((_, i) => ({
      dayOfWeek: i,
      startTime: "09:00",
      endTime: "19:00",
      isWorking: i < 6,
    })) as Schedule[],
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  async function fetchStaff() {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/pro/staff");
      if (res.ok) {
        const data = await res.json();
        setStaff(data.staff || []);
      }
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingMember(null);
    setForm({
      displayName: "",
      title: "",
      bio: "",
      color: COLORS[staff.length % COLORS.length],
      isActive: true,
      schedules: DAYS.map((_, i) => ({
        dayOfWeek: i,
        startTime: "09:00",
        endTime: "19:00",
        isWorking: i < 6,
      })),
    });
    setShowModal(true);
  }

  function openEdit(member: StaffMember) {
    setEditingMember(member);
    setForm({
      displayName: member.displayName,
      title: member.title || "",
      bio: member.bio || "",
      color: member.color,
      isActive: member.isActive,
      schedules: member.schedules.length > 0
        ? member.schedules
        : DAYS.map((_, i) => ({
            dayOfWeek: i,
            startTime: "09:00",
            endTime: "19:00",
            isWorking: i < 6,
          })),
    });
    setShowModal(true);
  }

  function openDelete(member: StaffMember) {
    setDeletingMember(member);
    setShowDeleteModal(true);
  }

  function updateSchedule(index: number, field: string, value: string | boolean) {
    setForm((prev) => ({
      ...prev,
      schedules: prev.schedules.map((s, i) =>
        i === index ? { ...s, [field]: value } : s
      ),
    }));
  }

  async function handleSubmit() {
    if (!form.displayName) {
      toast.error("Le nom est obligatoire");
      return;
    }

    try {
      setSaving(true);
      if (editingMember) {
        const res = await fetch(`/api/v1/pro/staff/${editingMember.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Erreur lors de la modification");
        toast.success("Membre modifié avec succès");
      } else {
        const res = await fetch("/api/v1/pro/staff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Erreur lors de la création");
        toast.success("Membre ajouté avec succès");
      }
      setShowModal(false);
      await fetchStaff();
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingMember) return;
    try {
      const res = await fetch(`/api/v1/pro/staff/${deletingMember.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      toast.success("Membre supprimé");
      setShowDeleteModal(false);
      setDeletingMember(null);
      await fetchStaff();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  }

  function toggleAllDays(working: boolean) {
    setForm((prev) => ({
      ...prev,
      schedules: prev.schedules.map((s) => ({
        ...s,
        isWorking: working,
      })),
    }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black tracking-tight">Équipe</h1>
          <p className="text-sm text-gray-500">
            {staff.filter((s) => s.isActive).length} actif{staff.filter((s) => s.isActive).length !== 1 ? "s" : ""} sur {staff.length}
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-black text-white hover:bg-gray-800 rounded-md"
        >
          <Plus className="h-4 w-4 mr-1" />
          Ajouter un membre
        </Button>
      </div>

      {/* Team Grid */}
      {staff.length === 0 ? (
        <Card className="border border-[rgba(198,198,198,0.2)] rounded-md">
          <CardContent className="pt-6 text-center text-gray-500">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p>Aucun membre d&apos;équipe</p>
            <Button variant="outline" className="mt-4 rounded-md" onClick={openCreate}>
              Ajouter votre premier membre
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((member) => (
            <Card
              key={member.id}
              className={`border border-[rgba(198,198,198,0.2)] rounded-md hover:border-[rgba(198,198,198,0.4)] transition-colors ${!member.isActive ? "opacity-50" : ""}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: member.color }}
                    >
                      {member.displayName[0]}
                    </div>
                    <div>
                      <h3 className="font-medium text-black">
                        {member.displayName}
                      </h3>
                      {member.title && (
                        <p className="text-sm text-gray-500">{member.title}</p>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      member.isActive
                        ? "text-green-700 border-green-200 bg-green-50"
                        : "text-gray-500"
                    }
                  >
                    {member.isActive ? "Actif" : "Inactif"}
                  </Badge>
                </div>

                {/* Schedule summary */}
                <div className="mt-4 flex flex-wrap gap-1">
                  {DAYS.map((day, i) => {
                    const schedule = member.schedules.find((s) => s.dayOfWeek === i);
                    const isWorking = schedule?.isWorking ?? i < 6;
                    return (
                      <span
                        key={day}
                        className={`text-xs px-2 py-1 rounded-md ${
                          isWorking
                            ? "bg-[#f9f9f9] text-black"
                            : "bg-gray-50 text-gray-400"
                        }`}
                        title={
                          isWorking
                            ? `${day}: ${schedule?.startTime || "09:00"} - ${schedule?.endTime || "19:00"}`
                            : `${day}: Fermé`
                        }
                      >
                        {day.slice(0, 2)}
                      </span>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1 mt-4 pt-4 border-t border-[rgba(198,198,198,0.2)]">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-md"
                    onClick={() => openEdit(member)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-md text-red-600 hover:bg-red-50"
                    onClick={() => openDelete(member)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto border border-[rgba(198,198,198,0.2)] rounded-md">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-black">
                  {editingMember ? "Modifier le membre" : "Nouveau membre"}
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet *
                  </label>
                  <Input
                    placeholder="Ex: Sara Mohammed"
                    value={form.displayName}
                    onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                    className="rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Poste / Titre
                  </label>
                  <Input
                    placeholder="Ex: Coiffeuse senior"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="rounded-md"
                  />
                </div>

                {/* Color picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Palette className="h-3.5 w-3.5 inline mr-1" />
                    Couleur agenda
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setForm({ ...form, color: c })}
                        className={`w-8 h-8 rounded-full transition-transform ${
                          form.color === c ? "scale-110 ring-2 ring-offset-2 ring-gray-400" : ""
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                {/* Schedule */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Horaires hebdomadaires
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => toggleAllDays(true)}
                        className="text-xs text-black hover:underline"
                      >
                        Tout activer
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleAllDays(false)}
                        className="text-xs text-gray-400 hover:underline"
                      >
                        Tout désactiver
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {form.schedules.map((s, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <label className="flex items-center gap-2 w-24">
                          <input
                            type="checkbox"
                            checked={s.isWorking}
                            onChange={(e) => updateSchedule(i, "isWorking", e.target.checked)}
                            className="rounded border-gray-300 text-black focus:ring-black"
                          />
                          <span className="text-sm">{DAYS[i]}</span>
                        </label>
                        <Input
                          type="time"
                          value={s.startTime}
                          onChange={(e) => updateSchedule(i, "startTime", e.target.value)}
                          disabled={!s.isWorking}
                          className="w-24 rounded-md"
                        />
                        <span className="text-gray-300">-</span>
                        <Input
                          type="time"
                          value={s.endTime}
                          onChange={(e) => updateSchedule(i, "endTime", e.target.value)}
                          disabled={!s.isWorking}
                          className="w-24 rounded-md"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">
                    Membre actif (visible dans l&apos;agenda)
                  </label>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-[rgba(198,198,198,0.2)]">
                <Button variant="outline" className="rounded-md" onClick={() => setShowModal(false)}>
                  Annuler
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="bg-black text-white hover:bg-gray-800 rounded-md"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-1" />
                  )}
                  {editingMember ? "Modifier" : "Ajouter"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingMember && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm border border-[rgba(198,198,198,0.2)] rounded-md">
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-lg font-semibold text-black">Supprimer le membre</h2>
              <p className="text-sm text-gray-500">
                Êtes-vous sûr de vouloir supprimer &ldquo;{deletingMember.displayName}&rdquo; ? Cette action est irréversible.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  className="rounded-md"
                  onClick={() => { setShowDeleteModal(false); setDeletingMember(null); }}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleDelete}
                  className="bg-red-600 text-white hover:bg-red-700 rounded-md"
                >
                  Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}