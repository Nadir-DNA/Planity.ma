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
  Clock,
  Users,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Service {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  duration: number;
  bufferTime: number;
  isOnlineBookable: boolean;
  isActive: boolean;
  order: number;
  category?: { name: string } | null;
  assignedStaff: { staffId: string; staff: { id: string; displayName: string; color: string } }[];
}

interface Staff {
  id: string;
  displayName: string;
  color: string;
  title?: string;
}

export default function ProServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    bufferTime: "0",
    isOnlineBookable: true,
    isActive: true,
    assignedStaffIds: [] as string[],
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [servicesRes, staffRes] = await Promise.all([
        fetch("/api/v1/pro/services"),
        fetch("/api/v1/pro/staff"),
      ]);
      if (servicesRes.ok) {
        const data = await servicesRes.json();
        setServices(data.services || []);
      }
      if (staffRes.ok) {
        const data = await staffRes.json();
        setStaff(data.staff || []);
      }
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingService(null);
    setForm({
      name: "",
      description: "",
      price: "",
      duration: "",
      bufferTime: "0",
      isOnlineBookable: true,
      isActive: true,
      assignedStaffIds: [],
    });
    setShowModal(true);
  }

  function openEdit(service: Service) {
    setEditingService(service);
    setForm({
      name: service.name,
      description: service.description || "",
      price: service.price.toString(),
      duration: service.duration.toString(),
      bufferTime: service.bufferTime.toString(),
      isOnlineBookable: service.isOnlineBookable,
      isActive: service.isActive,
      assignedStaffIds: service.assignedStaff.map((a) => a.staffId),
    });
    setShowModal(true);
  }

  function openDelete(service: Service) {
    setDeletingService(service);
    setShowDeleteModal(true);
  }

  async function handleSubmit() {
    if (!form.name || !form.price || !form.duration) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      setSaving(true);
      if (editingService) {
        const res = await fetch(`/api/v1/pro/services/${editingService.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            description: form.description || null,
            price: parseFloat(form.price),
            duration: parseInt(form.duration),
            bufferTime: parseInt(form.bufferTime),
            isOnlineBookable: form.isOnlineBookable,
            isActive: form.isActive,
            assignedStaffIds: form.assignedStaffIds,
          }),
        });
        if (!res.ok) throw new Error("Erreur lors de la modification");
        toast.success("Service modifié avec succès");
      } else {
        const res = await fetch("/api/v1/pro/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            description: form.description || null,
            price: parseFloat(form.price),
            duration: parseInt(form.duration),
            bufferTime: parseInt(form.bufferTime),
            isOnlineBookable: form.isOnlineBookable,
            isActive: form.isActive,
            assignedStaffIds: form.assignedStaffIds,
          }),
        });
        if (!res.ok) throw new Error("Erreur lors de la création");
        toast.success("Service créé avec succès");
      }
      setShowModal(false);
      await fetchData();
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingService) return;
    try {
      const res = await fetch(`/api/v1/pro/services/${deletingService.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      toast.success("Service supprimé");
      setShowDeleteModal(false);
      setDeletingService(null);
      await fetchData();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  }

  function toggleStaff(staffId: string) {
    setForm((prev) => ({
      ...prev,
      assignedStaffIds: prev.assignedStaffIds.includes(staffId)
        ? prev.assignedStaffIds.filter((id) => id !== staffId)
        : [...prev.assignedStaffIds, staffId],
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
          <h1 className="text-2xl font-bold text-black tracking-tight">Services</h1>
          <p className="text-sm text-gray-500">
            {services.length} service{services.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-black text-white hover:bg-gray-800 rounded-md"
        >
          <Plus className="h-4 w-4 mr-1" />
          Ajouter un service
        </Button>
      </div>

      {/* Services List */}
      {services.length === 0 ? (
        <Card className="border border-[rgba(198,198,198,0.2)] rounded-md">
          <CardContent className="pt-6 text-center text-gray-500">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p>Aucun service configuré</p>
            <Button variant="outline" className="mt-4 rounded-md" onClick={openCreate}>
              Ajouter votre premier service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {services.map((service) => (
            <Card
              key={service.id}
              className={`border border-[rgba(198,198,198,0.2)] rounded-md hover:border-[rgba(198,198,198,0.4)] transition-colors ${!service.isActive ? "opacity-50" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-black truncate">
                        {service.name}
                      </h3>
                      {service.isActive ? (
                        <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50 text-[10px]">
                          Actif
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500 text-[10px]">
                          Inactif
                        </Badge>
                      )}
                    </div>
                    {service.description && (
                      <p className="text-sm text-gray-500 mt-0.5 truncate">
                        {service.description}
                      </p>
                    )}
                    {service.category && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {service.category.name}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        {service.duration} min
                      </span>
                      <span className="font-semibold text-black">
                        {service.price} DH
                      </span>
                      {service.assignedStaff.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {service.assignedStaff.map((a) => (
                            <span
                              key={a.staffId}
                              className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-bold"
                              style={{ backgroundColor: a.staff.color }}
                              title={a.staff.displayName}
                            >
                              {a.staff.displayName[0]}
                            </span>
                          ))}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-md"
                      onClick={() => openEdit(service)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-md text-red-600 hover:bg-red-50"
                      onClick={() => openDelete(service)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
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
                  {editingService ? "Modifier le service" : "Nouveau service"}
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du service *
                  </label>
                  <Input
                    placeholder="Ex: Coupe femme"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full rounded-md border border-[rgba(198,198,198,0.3)] px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    rows={2}
                    placeholder="Description du service..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prix (DH) *
                    </label>
                    <Input
                      type="number"
                      placeholder="150"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Durée (min) *
                    </label>
                    <Input
                      type="number"
                      placeholder="45"
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: e.target.value })}
                      className="rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pause (min)
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={form.bufferTime}
                      onChange={(e) => setForm({ ...form, bufferTime: e.target.value })}
                      className="rounded-md"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="onlineBookable"
                    checked={form.isOnlineBookable}
                    onChange={(e) => setForm({ ...form, isOnlineBookable: e.target.checked })}
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                  <label htmlFor="onlineBookable" className="text-sm text-gray-700">
                    Réservable en ligne
                  </label>
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
                    Service actif
                  </label>
                </div>

                {/* Staff assignment */}
                {staff.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Professionnels assignés
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {staff.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => toggleStaff(s.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-colors ${
                            form.assignedStaffIds.includes(s.id)
                              ? "border-black bg-gray-50"
                              : "border-[rgba(198,198,198,0.3)] hover:border-[rgba(198,198,198,0.5)]"
                          }`}
                        >
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: s.color }}
                          >
                            {s.displayName[0]}
                          </div>
                          <span className="text-sm">{s.displayName}</span>
                          {form.assignedStaffIds.includes(s.id) && (
                            <Check className="h-3.5 w-3.5 text-black" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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
                  {editingService ? "Modifier" : "Créer"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingService && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm border border-[rgba(198,198,198,0.2)] rounded-md">
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-lg font-semibold text-black">Supprimer le service</h2>
              <p className="text-sm text-gray-500">
                Êtes-vous sûr de vouloir supprimer &ldquo;{deletingService.name}&rdquo; ? Cette action est irréversible.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  className="rounded-md"
                  onClick={() => { setShowDeleteModal(false); setDeletingService(null); }}
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