"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MoreVertical } from "lucide-react";

const mockUsers = [
  { id: "1", name: "Fatima Zahri", email: "fatima@email.com", role: "CONSUMER", bookings: 12, joined: "2024-01-10" },
  { id: "2", name: "Sara Mansouri", email: "sara@salon-elegance.ma", role: "PRO_OWNER", bookings: 0, joined: "2024-01-15" },
  { id: "3", name: "Ahmed Khalil", email: "ahmed@email.com", role: "CONSUMER", bookings: 5, joined: "2024-02-05" },
  { id: "4", name: "Admin Planity", email: "admin@planity.ma", role: "ADMIN", bookings: 0, joined: "2024-01-01" },
  { id: "5", name: "Amina Benali", email: "amina@email.com", role: "CONSUMER", bookings: 8, joined: "2024-02-20" },
];

const roleConfig: Record<string, { label: string; variant: "default" | "secondary" | "success" }> = {
  CONSUMER: { label: "Client", variant: "secondary" },
  PRO_OWNER: { label: "Professionnel", variant: "default" },
  ADMIN: { label: "Admin", variant: "success" },
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const filtered = mockUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
        <p className="text-sm text-gray-500 mt-1">{mockUsers.length} utilisateurs</p>
      </div>

      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Rechercher un utilisateur..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-4 font-medium text-gray-500">Nom</th>
                <th className="text-left p-4 font-medium text-gray-500">Email</th>
                <th className="text-left p-4 font-medium text-gray-500">Role</th>
                <th className="text-left p-4 font-medium text-gray-500">Reservations</th>
                <th className="text-left p-4 font-medium text-gray-500">Inscription</th>
                <th className="text-left p-4 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const config = roleConfig[user.role] || roleConfig.CONSUMER;
                return (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900">{user.name}</td>
                    <td className="p-4 text-gray-600">{user.email}</td>
                    <td className="p-4">
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </td>
                    <td className="p-4 text-gray-600">{user.bookings}</td>
                    <td className="p-4 text-gray-600">{user.joined}</td>
                    <td className="p-4">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
