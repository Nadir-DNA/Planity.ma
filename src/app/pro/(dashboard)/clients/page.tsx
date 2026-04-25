"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  User,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Star,
  FileText,
  Plus,
  X,
  Check,
  Loader2,
  Download,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  totalSpent: number;
  lastBooking?: string;
  averageRating?: number;
  notes?: string;
}

interface Booking {
  id: string;
  reference: string;
  date: string;
  services: string[];
  totalPrice: number;
  status: string;
}

export default function ProClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteClient, setNoteClient] = useState<string>("");

  // Mock data for now (will be replaced with API calls)
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // TODO: Fetch from API
        const mockClients: Client[] = [
          {
            id: "1",
            name: "Fatima Zahra",
            email: "fatima@email.com",
            phone: "+212 661 123 456",
            totalBookings: 12,
            totalSpent: 2400,
            lastBooking: "2024-03-15",
            averageRating: 4.8,
            notes: "Préfère toujours Sara comme coiffeuse",
          },
          {
            id: "2",
            name: "Ahmed Benali",
            email: "ahmed@email.com",
            phone: "+212 662 789 012",
            totalBookings: 8,
            totalSpent: 960,
            lastBooking: "2024-03-10",
            averageRating: 4.5,
          },
          {
            id: "3",
            name: "Khadija Mansouri",
            email: "khadija@email.com",
            phone: "+212 663 345 678",
            totalBookings: 24,
            totalSpent: 5200,
            lastBooking: "2024-03-18",
            averageRating: 5.0,
            notes: "Cliente VIP - carte fidélité niveau or",
          },
          {
            id: "4",
            name: "Youssef El Amrani",
            email: "youssef@email.com",
            phone: "+212 664 901 234",
            totalBookings: 3,
            totalSpent: 270,
            lastBooking: "2024-02-20",
          },
          {
            id: "5",
            name: "Sara Idrissi",
            email: "sara.idrissi@email.com",
            phone: "+212 665 567 890",
            totalBookings: 18,
            totalSpent: 3600,
            lastBooking: "2024-03-19",
            averageRating: 4.7,
          },
        ];
        setClients(mockClients);
      } catch (err) {
        toast.error("Erreur de chargement");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredClients = clients.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q)
    );
  });

  function openNote(client: Client) {
    setNoteClient(client.id);
    setNoteText(client.notes || "");
    setShowNoteModal(true);
  }

  function saveNote() {
    setClients((prev) =>
      prev.map((c) =>
        c.id === noteClient ? { ...c, notes: noteText } : c
      )
    );
    toast("Note sauvegardée", { icon: "✅" });
    setShowNoteModal(false);
  }

  function exportCSV() {
    const headers = ["Nom", "Email", "Téléphone", "RDV", "Total dépensé", "Dernier RDV"];
    const rows = filteredClients.map((c) => [
      c.name,
      c.email,
      c.phone,
      c.totalBookings.toString(),
      `${c.totalSpent} DH`,
      c.lastBooking || "—",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clients.csv";
    a.click();
    toast("Export CSV téléchargé", { icon: "📊" });
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500">
            {filteredClients.length} client{filteredClients.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-1" />
            Export CSV
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Nouveau client
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher par nom, email ou téléphone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Client List */}
      {filteredClients.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p>Aucun client trouvé</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                    onClick={() => setSelectedClient(client)}
                  >
                    <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 font-bold">
                      {client.name[0]}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {client.name}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Phone className="h-3.5 w-3.5 mr-1" />
                          {client.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {client.totalBookings} RDV
                      </div>
                      <div className="font-bold text-gray-900">
                        {client.totalSpent} DH
                      </div>
                    </div>
                    {client.averageRating && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-medium">{client.averageRating}</span>
                      </div>
                    )}
                    {client.notes && (
                      <span title="A des notes">
                        <FileText className="h-4 w-4 text-gray-400" />
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openNote(client);
                      }}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Client Detail Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Fiche client</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedClient(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Client Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 font-bold text-2xl">
                  {selectedClient.name[0]}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedClient.name}
                  </h3>
                  <div className="space-y-1 mt-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <Mail className="h-3.5 w-3.5 mr-2" />
                      {selectedClient.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Phone className="h-3.5 w-3.5 mr-2" />
                      {selectedClient.phone}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <Card>
                  <CardContent className="pt-4 text-center">
                    <Calendar className="h-5 w-5 mx-auto text-rose-600 mb-1" />
                    <div className="text-2xl font-bold">{selectedClient.totalBookings}</div>
                    <div className="text-xs text-gray-500">RDV</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <CreditCard className="h-5 w-5 mx-auto text-green-600 mb-1" />
                    <div className="text-2xl font-bold">{selectedClient.totalSpent}</div>
                    <div className="text-xs text-gray-500">DH dépensés</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <Star className="h-5 w-5 mx-auto text-yellow-400 mb-1" />
                    <div className="text-2xl font-bold">
                      {selectedClient.averageRating?.toFixed(1) || "—"}
                    </div>
                    <div className="text-xs text-gray-500">Note moy.</div>
                  </CardContent>
                </Card>
              </div>

              {/* Notes */}
              {selectedClient.notes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-yellow-800 mb-1">
                    <FileText className="h-4 w-4" />
                    Notes
                  </div>
                  <p className="text-sm text-yellow-700">{selectedClient.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    openNote(selectedClient);
                    setSelectedClient(null);
                  }}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Notes
                </Button>
                <Button size="sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  Nouveau RDV
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Note client</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNoteModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                rows={5}
                placeholder="Ex: Préfère toujours Sara, allergique aux produits X..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowNoteModal(false)}>
                  Annuler
                </Button>
                <Button onClick={saveNote}>
                  <Check className="h-4 w-4 mr-1" />
                  Sauvegarder
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
