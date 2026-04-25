"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Scissors,
  Clock,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Search,
} from "lucide-react";
import { formatPrice, formatDuration } from "@/lib/utils";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  bufferTime: number;
  isOnlineBookable: boolean;
  isActive: boolean;
  category: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  useEffect(() => {
    // TODO: Fetch services from API
    const mockServices: Service[] = [
      {
        id: "1",
        name: "Coupe femme",
        description: "Coupe et coiffage",
        price: 150,
        duration: 45,
        bufferTime: 15,
        isOnlineBookable: true,
        isActive: true,
        category: "Coiffure",
      },
      {
        id: "2",
        name: "Coupe homme",
        description: "Coupe classique",
        price: 80,
        duration: 30,
        bufferTime: 10,
        isOnlineBookable: true,
        isActive: true,
        category: "Coiffure",
      },
      {
        id: "3",
        name: "Coloration complète",
        description: "Coloration permanente",
        price: 300,
        duration: 90,
        bufferTime: 30,
        isOnlineBookable: true,
        isActive: true,
        category: "Coloration",
      },
      {
        id: "4",
        name: "Brushing",
        description: "Brushing et coiffage",
        price: 100,
        duration: 30,
        bufferTime: 10,
        isOnlineBookable: true,
        isActive: true,
        category: "Coiffure",
      },
      {
        id: "5",
        name: "Mèches",
        description: "Mèches et balayage",
        price: 250,
        duration: 120,
        bufferTime: 30,
        isOnlineBookable: true,
        isActive: true,
        category: "Coloration",
      },
      {
        id: "6",
        name: "Soin capillaire",
        description: "Soin profond",
        price: 200,
        duration: 60,
        bufferTime: 15,
        isOnlineBookable: true,
        isActive: true,
        category: "Soins",
      },
    ];
    setServices(mockServices);
    setLoading(false);
  }, []);

  const filteredServices = services.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function toggleService(id: string) {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  }

  function deleteService(id: string) {
    if (confirm("Supprimer ce service ?")) {
      setServices((prev) => prev.filter((s) => s.id !== id));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-sm text-gray-500 mt-1">
            {services.length} service{services.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau service
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Rechercher un service..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Services list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-600 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredServices.map((service) => (
            <Card key={service.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Scissors className="h-5 w-5 text-rose-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {service.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {service.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDuration(service.duration)}
                      </span>
                      <span className="font-medium text-gray-900">
                        {formatPrice(service.price)}
                      </span>
                      <Badge variant={service.isOnlineBookable ? "default" : "secondary"}>
                        {service.isOnlineBookable ? "Réservation en ligne" : "Sur place uniquement"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleService(service.id)}
                      className="text-gray-400 hover:text-gray-600"
                      title={service.isActive ? "Désactiver" : "Activer"}
                    >
                      {service.isActive ? (
                        <ToggleRight className="h-6 w-6 text-green-500" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-gray-300" />
                      )}
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingService(service)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteService(service.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
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

      {/* Add/Edit modal */}
      {(showAddModal || editingService) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingService ? "Modifier le service" : "Nouveau service"}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du service *
                  </label>
                  <Input
                    placeholder="Ex: Coupe femme"
                    defaultValue={editingService?.name}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    rows={2}
                    defaultValue={editingService?.description}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prix (DH) *
                    </label>
                    <Input
                      type="number"
                      placeholder="150"
                      defaultValue={editingService?.price}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Durée (min) *
                    </label>
                    <Input
                      type="number"
                      placeholder="45"
                      defaultValue={editingService?.duration}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Temps de pause (min)
                    </label>
                    <Input
                      type="number"
                      placeholder="15"
                      defaultValue={editingService?.bufferTime}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Catégorie
                    </label>
                    <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
                      <option value="">Sélectionnez</option>
                      <option value="coiffure">Coiffure</option>
                      <option value="coloration">Coloration</option>
                      <option value="soins">Soins</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="onlineBookable"
                    defaultChecked={editingService?.isOnlineBookable ?? true}
                    className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                  />
                  <label htmlFor="onlineBookable" className="text-sm text-gray-700">
                    Réservation en ligne
                  </label>
                </div>
                <div className="flex space-x-3">
                  <Button className="flex-1">
                    {editingService ? "Modifier" : "Créer"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingService(null);
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
