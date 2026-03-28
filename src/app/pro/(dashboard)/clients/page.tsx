"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, Phone, Mail } from "lucide-react";

const mockClients = [
  {
    id: "1",
    name: "Fatima Zahri",
    email: "fatima@email.com",
    phone: "+212 661-123456",
    visits: 12,
    lastVisit: "2024-03-15",
    totalSpent: 3600,
    tags: ["Fidele", "VIP"],
  },
  {
    id: "2",
    name: "Ahmed Khalil",
    email: "ahmed@email.com",
    phone: "+212 662-789012",
    visits: 5,
    lastVisit: "2024-03-10",
    totalSpent: 800,
    tags: ["Nouveau"],
  },
  {
    id: "3",
    name: "Amina Benali",
    email: "amina@email.com",
    phone: "+212 663-456789",
    visits: 8,
    lastVisit: "2024-03-01",
    totalSpent: 2100,
    tags: ["Fidele"],
  },
];

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClients = mockClients.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-1">
            {mockClients.length} clients au total
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Ajouter un client
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Rechercher un client..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Client list */}
      <div className="space-y-3">
        {filteredClients.map((client) => (
          <Card key={client.id} className="hover:shadow-sm transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 font-bold">
                    {client.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">
                        {client.name}
                      </h3>
                      {client.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {client.phone}
                      </span>
                      <span className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {client.email}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">{client.visits} visites</p>
                  <p className="text-xs text-gray-500">
                    {client.totalSpent} DH depenses
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
