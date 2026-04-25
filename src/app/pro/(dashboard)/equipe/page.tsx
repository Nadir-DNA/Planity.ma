"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  User,
  Edit,
  Trash2,
  Calendar,
  ToggleLeft,
  ToggleRight,
  UserPlus,
} from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
  title: string;
  color: string;
  phone: string;
  email: string;
  isActive: boolean;
  schedules: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isWorking: boolean;
  }[];
}

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

export default function EquipePage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);

  useEffect(() => {
    // TODO: Fetch staff from API
    const mockStaff: StaffMember[] = [
      {
        id: "1",
        name: "Sara M.",
        title: "Coiffeuse senior",
        color: "#EC4899",
        phone: "+212 661-111111",
        email: "sara@salon-elegance.ma",
        isActive: true,
        schedules: Array.from({ length: 7 }, (_, i) => ({
          dayOfWeek: i,
          startTime: "09:00",
          endTime: i === 5 ? "20:00" : "19:00",
          isWorking: i < 6,
        })),
      },
      {
        id: "2",
        name: "Karim B.",
        title: "Coloriste",
        color: "#3B82F6",
        phone: "+212 662-222222",
        email: "karim@salon-elegance.ma",
        isActive: true,
        schedules: Array.from({ length: 7 }, (_, i) => ({
          dayOfWeek: i,
          startTime: "09:00",
          endTime: "19:00",
          isWorking: i < 6,
        })),
      },
      {
        id: "3",
        name: "Nadia L.",
        title: "Coiffeuse",
        color: "#10B981",
        phone: "+212 663-333333",
        email: "nadia@salon-elegance.ma",
        isActive: true,
        schedules: Array.from({ length: 7 }, (_, i) => ({
          dayOfWeek: i,
          startTime: "09:00",
          endTime: "19:00",
          isWorking: i < 6,
        })),
      },
    ];
    setStaff(mockStaff);
    setLoading(false);
  }, []);

  function toggleMember(id: string) {
    setStaff((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isActive: !m.isActive } : m))
    );
  }

  function deleteMember(id: string) {
    if (confirm("Supprimer ce membre ?")) {
      setStaff((prev) => prev.filter((m) => m.id !== id));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Équipe</h1>
          <p className="text-sm text-gray-500 mt-1">
            {staff.filter((m) => m.isActive).length} membre{staff.filter((m) => m.isActive).length !== 1 ? "s" : ""} actif{staff.filter((m) => m.isActive).length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Ajouter un membre
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-600 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((member) => (
            <Card key={member.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: member.color }}
                    >
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-500">{member.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => toggleMember(member.id)}
                      title={member.isActive ? "Désactiver" : "Activer"}
                    >
                      {member.isActive ? (
                        <ToggleRight className="h-6 w-6 text-green-500" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-gray-300" />
                      )}
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingMember(member)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMember(member.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-500 flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    {member.email}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    Horaires:
                  </p>
                  <div className="grid grid-cols-7 gap-1 text-xs">
                    {DAYS.map((day, i) => {
                      const schedule = member.schedules[i];
                      return (
                        <div
                          key={day}
                          className={`text-center p-1 rounded ${
                            schedule?.isWorking
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-50 text-gray-400"
                          }`}
                          title={`${day}: ${schedule?.isWorking ? `${schedule.startTime} - ${schedule.endTime}` : "Repos"}`}
                        >
                          {day.slice(0, 2)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit modal */}
      {(showAddModal || editingMember) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingMember ? "Modifier le membre" : "Ajouter un membre"}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet *
                  </label>
                  <Input
                    placeholder="Ex: Sara Mansouri"
                    defaultValue={editingMember?.name}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Poste *
                  </label>
                  <Input
                    placeholder="Ex: Coiffeuse senior"
                    defaultValue={editingMember?.title}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <Input
                      type="email"
                      placeholder="sara@salon.ma"
                      defaultValue={editingMember?.email}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <Input
                      type="tel"
                      placeholder="+212 6XX-XXXXXX"
                      defaultValue={editingMember?.phone}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Couleur (agenda)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      defaultValue={editingMember?.color || "#EC4899"}
                      className="h-10 w-10 rounded cursor-pointer"
                    />
                    <span className="text-sm text-gray-500">
                      Choisir une couleur pour l&apos;agenda
                    </span>
                  </div>
                </div>

                {/* Schedules */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horaires hebdomadaires
                  </label>
                  <div className="space-y-2">
                    {DAYS.map((day, i) => (
                      <div key={day} className="flex items-center space-x-3">
                        <label className="flex items-center space-x-2 w-28">
                          <input
                            type="checkbox"
                            defaultChecked={
                              editingMember?.schedules[i]?.isWorking ?? i < 6
                            }
                            className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                          />
                          <span className="text-sm">{day}</span>
                        </label>
                        <Input
                          type="time"
                          defaultValue={
                            editingMember?.schedules[i]?.startTime ?? "09:00"
                          }
                          className="w-28"
                        />
                        <span className="text-gray-400">-</span>
                        <Input
                          type="time"
                          defaultValue={
                            editingMember?.schedules[i]?.endTime ?? "19:00"
                          }
                          className="w-28"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button className="flex-1">
                    {editingMember ? "Modifier" : "Ajouter"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingMember(null);
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
