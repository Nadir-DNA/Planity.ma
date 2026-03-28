"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Calendar, Clock } from "lucide-react";

const team = [
  {
    id: "1",
    name: "Sara M.",
    title: "Coiffeuse senior",
    color: "#EC4899",
    active: true,
    schedule: "Lun-Sam 09:00-19:00",
    services: 6,
    bookingsToday: 5,
  },
  {
    id: "2",
    name: "Karim B.",
    title: "Coloriste",
    color: "#3B82F6",
    active: true,
    schedule: "Lun-Sam 09:00-19:00",
    services: 4,
    bookingsToday: 3,
  },
  {
    id: "3",
    name: "Nadia L.",
    title: "Coiffeuse",
    color: "#10B981",
    active: true,
    schedule: "Lun-Ven 10:00-18:00",
    services: 5,
    bookingsToday: 4,
  },
];

export default function EquipePage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipe</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerez votre equipe et leurs plannings
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Ajouter un membre
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map((member) => (
          <Card key={member.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-500">{member.title}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2 text-gray-400" />
                  {member.schedule}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  {member.bookingsToday} RDV aujourd&apos;hui
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Badge variant={member.active ? "success" : "secondary"}>
                  {member.active ? "Actif" : "Inactif"}
                </Badge>
                <span className="text-xs text-gray-500">
                  {member.services} services assignes
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
