"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
// Badge unused - removed
import {
  Search,
  Plus,
  Mail,
  Phone,
  Star,
  Filter,
} from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  totalBookings: number;
  totalSpent: number;
  lastBooking: string;
  averageRating: number;
  notes: string;
}

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [, setShowAddModal] = useState(false); // eslint-disable-line @typescript-eslint/no-unused-vars

  useEffect(() => {
    // TODO: Fetch clients from API
    const mockClients: Client[] = [
      {
        id: "1",
        name: "Fatima Zahri",
        email: "fatima@email.com",
        phone: "+212 661-123456",
        avatar: null,
        totalBookings: 12,
        totalSpent: 2400,
        lastBooking: "2024-03-15",
        averageRating: 4.5,
        notes: "Cliente fidèle, préfère Sara M.",
      },
      {
        id: "2",
        name: "Amina Kabbaj",
        email: "amina@email.com",
        phone: "+212 662-234567",
        avatar: null,
        totalBookings: 8,
        totalSpent: 1600,
        lastBooking: "2024-03-10",
        averageRating: 4.8,
        notes: "",
      },
      {
        id: "3",
        name: "Leila Bennani",
        email: "leila@email.com",
        phone: "+212 663-345678",
        avatar: null,
        totalBookings: 5,
        totalSpent: 1000,
        lastBooking: "2024-02-28",
        averageRating: 4.2,
        notes: "Allergie aux produits capillaires",
      },
    ];
    setClients(mockClients);
    setLoading(false);
  }, []);

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-1">
            {clients.length} client{clients.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau client
        </Button>
      </div>

      {/* Search and filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Rechercher par nom, email ou téléphone..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filtres
        </Button>
      </div>

      {/* Client list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-600 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredClients.map((client) => (
            <Card
              key={client.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedClient(client)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 font-bold">
                      {client.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{client.name}</p>
                      <div className="flex items-center space-x-3 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {client.email}
                        </span>
                        <span className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {client.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {client.totalBookings} RDV
                      </p>
                      <p className="text-xs text-gray-500">
                        {client.totalSpent} DH
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                      <span className="ml-1 text-sm font-medium">
                        {client.averageRating}
                      </span>
                    </div>
                  </div>
                </div>
                {client.notes && (
                  <p className="mt-2 text-sm text-gray-500 italic">
                    Note: {client.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Client detail modal */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedClient.name}
                </h2>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{selectedClient.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{selectedClient.phone}</span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedClient.totalBookings}
                    </p>
                    <p className="text-xs text-gray-500">RDV</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedClient.totalSpent}
                    </p>
                    <p className="text-xs text-gray-500">DH</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedClient.averageRating}
                    </p>
                    <p className="text-xs text-gray-500">★</p>
                  </div>
                </div>

                {selectedClient.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      rows={3}
                      defaultValue={selectedClient.notes}
                    />
                  </div>
                )}

                <div className="flex space-x-3">
                  <Button className="flex-1">Nouveau RDV</Button>
                  <Button variant="outline">Modifier</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
