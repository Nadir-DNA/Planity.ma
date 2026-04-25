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
  GripVertical,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  bufferTime: number;
  isOnlineBookable: boolean;
  isActive: boolean;
  category?: { name: string };
  assignedStaff: { staff: { id: string; displayName: string; color: string } }[];
  order: number;
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
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [salonId, setSalonId] = useState<string>("");

  // Form state
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    bufferTime: "0",
    isOnlineBookable: true,
    assignedStaffIds: [] as string[],
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const salonRes = await fetch("/api/v1/salons");
        if (salonRes.ok) {
          const salonData = await salonRes.json();
          if (salonData.salons?.[0]) {
            setSalonId(salonData.salons[0].id);
            setServices(salonData.salons[0].services || []);
          }
        }

        if (salonId) {
          const staffRes = await fetch(`/api/v1/salons/${salonId}/staff`);
          if (staffRes.ok) {
            const staffData = await staffRes.json();
            setStaff(staffData.staff || []);
          }
        }
      } catch (err) {
        toast.error("Erreur de chargement");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  function openCreate() {
    setEditingService(null);
    setForm({
      name: "",
      description: "",
      price: "",
      duration: "",
      bufferTime: "0",
      isOnlineBookable: true,
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
      assignedStaffIds: service.assignedStaff.map((a) => a.staff.id),
    });
    setShowModal(true);
  }

  async function handleSubmit() {
    if (!form.name || !form.price || !form.duration) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      if (editingService) {
        // Update
        toast("Service modifié avec succès", { icon: "✅" });
        setServices((prev) =>
          prev.map((s) =>
            s.id === editingService.id
              ? {
                  ...s,
                  name: form.name,
                  description: form.description,
                  price: parseFloat(form.price),
                  duration: parseInt(form.duration),
                  bufferTime: parseInt(form.bufferTime),
                  isOnlineBookable: form.isOnlineBookable,
                }
              : s
          )
        );
      } else {
        // Create
        const newService: Service = {
          id: `new-${Date.now()}`,
          name: form.name,
          description: form.description,
          price: parseFloat(form.price),
          duration: parseInt(form.duration),
          bufferTime: parseInt(form.bufferTime),
          isOnlineBookable: form.isOnlineBookable,
          isActive: true,
          assignedStaff: form.assignedStaffIds.map((id) => ({
            staff: staff.find((s) => s.id === id)!,
          })),
          order: services.length,
        };
        setServices((prev) => [...prev, newService]);
        toast("Service créé avec succès", { icon: "✅" });
      }
      setShowModal(false);
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    }
  }

  async function handleDelete(service: Service) {
    if (!confirm(`Supprimer "${service.name}" ?`)) return;
    try {
      setServices((prev) => prev.filter((s) => s.id !== service.id));
      toast("Service supprimé", { icon: "🗑️" });
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
        <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-sm text-gray-500">
            {services.length} service{services.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" />
          Nouveau service
        </Button>
      </div>

      {/* Services List */}
      {services.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p>Aucun service configuré</p>
            <Button variant="outline" className="mt-4" onClick={openCreate}>
              Ajouter votre premier service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {services.map((service) => (
            <Card key={service.id} className={!service.isActive ? "opacity-60" : ""}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-gray-300 cursor-grab" />
                      <h3 className="font-medium text-gray-900 truncate">
                        {service.name}
                      </h3>
                      {!service.isActive && (
                        <Badge variant="outline" className="text-gray-500">
                          Inactif
                        </Badge>
                      )}
                      {!service.isOnlineBookable && (
                        <Badge variant="outline" className="text-orange-500">
                          Sur place uniquement
                        </Badge>
                      )}
                    </div>
                    {service.description && (
                      <p className="text-sm text-gray-500 mt-1 truncate">
                        {service.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        {service.duration} min
                      </span>
                      <span className="font-bold text-gray-900">
                        {service.price} DH
                      </span>
                      {service.assignedStaff.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {service.assignedStaff.map((a) => (
                            <span
                              key={a.staff.id}
                              className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold"
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
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(service)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(service)}
                    >
                      <Trash2 className="h-4 w-4" />
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
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
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
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
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="onlineBookable"
                    checked={form.isOnlineBookable}
                    onChange={(e) => setForm({ ...form, isOnlineBookable: e.target.checked })}
                    className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                  />
                  <label htmlFor="onlineBookable" className="text-sm text-gray-700">
                    Résérable en ligne
                  </label>
                </div>

                {/* Staff assignment */}
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
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-colors ${
                          form.assignedStaffIds.includes(s.id)
                            ? "border-rose-500 bg-rose-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: s.color }}
                        >
                          {s.displayName[0]}
                        </div>
                        <span className="text-sm">{s.displayName}</span>
                        {form.assignedStaffIds.includes(s.id) && (
                          <Check className="h-4 w-4 text-rose-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSubmit}>
                  <Check className="h-4 w-4 mr-1" />
                  {editingService ? "Modifier" : "Créer"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
