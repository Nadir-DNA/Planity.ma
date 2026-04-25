"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Shield, User, UserCheck, Ban, Eye } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "CONSUMER" | "PRO_OWNER" | "PRO_STAFF" | "ADMIN";
  status: "active" | "suspended";
  createdAt: string;
  bookings: number;
}

export default function UtilisateursPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: "1",
        name: "Fatima Zahri",
        email: "fatima@email.com",
        phone: "+212 661-123456",
        role: "CONSUMER",
        status: "active",
        createdAt: "2024-01-10",
        bookings: 12,
      },
      {
        id: "2",
        name: "Sara Mansouri",
        email: "sara@salon-elegance.ma",
        phone: "+212 662-234567",
        role: "PRO_OWNER",
        status: "active",
        createdAt: "2024-01-15",
        bookings: 0,
      },
      {
        id: "3",
        name: "Admin Planity",
        email: "admin@planity.ma",
        phone: "",
        role: "ADMIN",
        status: "active",
        createdAt: "2023-12-01",
        bookings: 0,
      },
      {
        id: "4",
        name: "Karim Bennani",
        email: "karim@barber-house.ma",
        phone: "+212 663-345678",
        role: "PRO_OWNER",
        status: "active",
        createdAt: "2024-02-01",
        bookings: 0,
      },
    ];
    setUsers(mockUsers);
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const roleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge variant="default"><Shield className="h-3 w-3 mr-1" /> Admin</Badge>;
      case "PRO_OWNER":
        return <Badge variant="secondary"><User className="h-3 w-3 mr-1" /> Pro</Badge>;
      case "PRO_STAFF":
        return <Badge variant="secondary"><UserCheck className="h-3 w-3 mr-1" /> Staff</Badge>;
      default:
        return <Badge variant="outline">Client</Badge>;
    }
  };

  function toggleSuspend(id: string) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "active" ? "suspended" : "active" }
          : u
      )
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Utilisateurs</h1>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Rechercher par nom ou email..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 font-bold">
                    {user.name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    {user.phone && (
                      <p className="text-xs text-gray-400">{user.phone}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    {roleBadge(user.role)}
                    <p className="text-xs text-gray-500 mt-1">
                      {user.bookings > 0 ? `${user.bookings} RDV` : ""}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  {user.role !== "ADMIN" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className={
                        user.status === "suspended"
                          ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                          : "text-red-500 hover:text-red-700 hover:bg-red-50"
                      }
                      onClick={() => toggleSuspend(user.id)}
                    >
                      {user.status === "suspended" ? (
                        <UserCheck className="h-4 w-4" />
                      ) : (
                        <Ban className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
