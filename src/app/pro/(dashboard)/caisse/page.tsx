"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  X,
  Check,
  Loader2,
  CreditCard,
  Banknote,
  FileText,
  Receipt,
  Printer,
  Mail,
  Search,
  User,
  Trash2,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface Client {
  id: string;
  name: string;
  phone: string;
}

interface CartItem {
  id: string;
  type: "service" | "product";
  name: string;
  price: number;
  quantity: number;
  itemId: string;
}

export default function ProCaissePage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"services" | "products">("services");

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<"CARD" | "CASH" | "CHECK" | "GIFT_CARD">("CASH");
  const [cashReceived, setCashReceived] = useState("");
  const [checkNumber, setCheckNumber] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const salonRes = await fetch("/api/v1/salons");
        if (salonRes.ok) {
          const salonData = await salonRes.json();
          if (salonData.salons?.[0]) {
            const salonId = salonData.salons[0].id;
            setServices(salonData.salons[0].services || []);
          }
        }

        // Mock data for now
        setProducts([
          { id: "p1", name: "Shampooing professionnel", price: 150, stock: 20 },
          { id: "p2", name: "Masque capillaire", price: 200, stock: 15 },
          { id: "p3", name: "Huile d'argan", price: 120, stock: 10 },
        ]);

        setClients([
          { id: "c1", name: "Fatima Zahra", phone: "+212 661 123 456" },
          { id: "c2", name: "Ahmed Benali", phone: "+212 662 789 012" },
          { id: "c3", name: "Khadija Mansouri", phone: "+212 663 345 678" },
        ]);
      } catch (err) {
        toast.error("Erreur de chargement");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal;

  function addToCart(item: Service | Product) {
    const existing = cart.find((c) => c.itemId === item.id);
    if (existing) {
      setCart((prev) =>
        prev.map((c) =>
          c.itemId === item.id ? { ...c, quantity: c.quantity + 1 } : c
        )
      );
    } else {
      setCart((prev) => [
        ...prev,
        {
          id: `${item.id}-${Date.now()}`,
          type: "price" in item ? "service" : "product",
          name: item.name,
          price: item.price,
          quantity: 1,
          itemId: item.id,
        },
      ]);
    }
    toast.success(`${item.name} ajouté`, { icon: "✅" });
  }

  function updateQuantity(itemId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((c) =>
          c.itemId === itemId
            ? { ...c, quantity: Math.max(0, c.quantity + delta) }
            : c
        )
        .filter((c) => c.quantity > 0)
    );
  }

  function removeFromCart(itemId: string) {
    setCart((prev) => prev.filter((c) => c.itemId !== itemId));
  }

  function clearCart() {
    setCart([]);
    setSelectedClient(null);
    toast("Panier vidé", { icon: "🗑️" });
  }

  function processPayment() {
    if (cart.length === 0) {
      toast.error("Le panier est vide");
      return;
    }

    if (paymentMethod === "CASH" && parseFloat(cashReceived) < total) {
      toast.error("Montant insuffisant");
      return;
    }

    // In production, this would call the payment API
    toast.success(`Paiement de ${total} DH traité avec succès !`, { icon: "✅" });

    // Clear cart
    setCart([]);
    setSelectedClient(null);
    setShowPaymentModal(false);
    setCashReceived("");
    setCheckNumber("");
  }

  const change = paymentMethod === "CASH" ? Math.max(0, parseFloat(cashReceived || "0") - total) : 0;

  const filteredItems = (activeTab === "services" ? services : products).filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-8rem)]">
      {/* Left: Items Grid */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Caisse</h1>
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === "services" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("services")}
            >
              Services
            </Button>
            <Button
              variant={activeTab === "products" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("products")}
            >
              Produits
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => addToCart(item)}
              >
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-2">
                    {activeTab === "services" ? (
                      <CreditCard className="h-5 w-5 text-rose-600" />
                    ) : (
                      <FileText className="h-5 w-5 text-rose-600" />
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {item.name}
                  </h3>
                  <p className="text-lg font-bold text-rose-600 mt-1">
                    {item.price} DH
                  </p>
                  {"stock" in item && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      Stock: {item.stock}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-full lg:w-96 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardContent className="p-4 flex-1 flex flex-col">
            {/* Client */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">
                  {selectedClient ? selectedClient.name : "Client"}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowClientModal(true)}
              >
                {selectedClient ? "Changer" : "Sélectionner"}
              </Button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p>Ajoutez des services ou produits</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.price} DH</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => updateQuantity(item.itemId, -1)}
                      >
                        -
                      </Button>
                      <span className="text-sm font-medium w-6 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => updateQuantity(item.itemId, 1)}
                      >
                        +
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-600"
                        onClick={() => removeFromCart(item.itemId)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-rose-600">{total} DH</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 space-y-2">
              <Button
                className="w-full"
                size="lg"
                onClick={() => setShowPaymentModal(true)}
                disabled={cart.length === 0}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Encaisser
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={cart.length === 0}
                >
                  <Printer className="h-4 w-4 mr-1" />
                  Imprimer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={cart.length === 0}
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Envoyer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-red-600 hover:bg-red-50"
                  onClick={clearCart}
                  disabled={cart.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Vider
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Selection Modal */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Sélectionner un client</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowClientModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Input
                placeholder="Rechercher par nom ou téléphone..."
                className="mb-2"
              />
              <div className="space-y-2">
                {clients.map((client) => (
                  <Card
                    key={client.id}
                    className={`cursor-pointer hover:shadow-md transition-shadow ${
                      selectedClient?.id === client.id ? "border-rose-500 bg-rose-50" : ""
                    }`}
                    onClick={() => {
                      setSelectedClient(client);
                      setShowClientModal(false);
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 font-bold text-sm">
                          {client.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{client.name}</p>
                          <p className="text-xs text-gray-500">{client.phone}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Paiement</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowPaymentModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Total à payer</p>
                <p className="text-3xl font-bold text-rose-600">{total} DH</p>
              </div>

              {/* Payment Method */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={paymentMethod === "CASH" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("CASH")}
                >
                  <Banknote className="h-4 w-4 mr-1" />
                  Espèces
                </Button>
                <Button
                  variant={paymentMethod === "CARD" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("CARD")}
                >
                  <CreditCard className="h-4 w-4 mr-1" />
                  Carte
                </Button>
                <Button
                  variant={paymentMethod === "CHECK" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("CHECK")}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Chèque
                </Button>
                <Button
                  variant={paymentMethod === "GIFT_CARD" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("GIFT_CARD")}
                >
                  <Receipt className="h-4 w-4 mr-1" />
                  Carte cadeau
                </Button>
              </div>

              {/* Cash Payment */}
              {paymentMethod === "CASH" && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Montant reçu
                    </label>
                    <Input
                      type="number"
                      placeholder={total.toString()}
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                    />
                  </div>
                  {parseFloat(cashReceived) >= total && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-green-800">
                        Monnaie à rendre: {change.toFixed(2)} DH
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Check Payment */}
              {paymentMethod === "CHECK" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de chèque
                  </label>
                  <Input
                    placeholder="Ex: 1234567"
                    value={checkNumber}
                    onChange={(e) => setCheckNumber(e.target.value)}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
                  Annuler
                </Button>
                <Button onClick={processPayment}>
                  <Check className="h-4 w-4 mr-1" />
                  Confirmer le paiement
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
