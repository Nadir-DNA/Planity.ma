"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Badge unused - removed
import {
  Search,
  CreditCard,
  Banknote,
  Receipt,
  Trash2,
  Printer,
  Mail,
  User,
  Scissors,
  Package,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface CartItem {
  id: string;
  name: string;
  type: "service" | "product";
  price: number;
  quantity: number;
}

interface Payment {
  method: "CARD" | "CASH" | "CHECK" | "ONLINE" | "GIFT_CARD";
  amount: number;
}

export default function CaissePage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [, setPayments] = useState<Payment[]>([]); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showClientSearch, setShowClientSearch] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = 0;
  const total = subtotal - discount;

  const availableServices = [
    { id: "s1", name: "Coupe femme", price: 150 },
    { id: "s2", name: "Coupe homme", price: 80 },
    { id: "s3", name: "Coloration", price: 300 },
    { id: "s4", name: "Brushing", price: 100 },
    { id: "s5", name: "Mèches", price: 250 },
    { id: "s6", name: "Soin capillaire", price: 200 },
  ];

  const availableProducts = [
    { id: "p1", name: "Shampooing professionnel", price: 120 },
    { id: "p2", name: "Après-shampooing", price: 95 },
    { id: "p3", name: "Masque capillaire", price: 180 },
  ];

  const mockClients = [
    { id: "c1", name: "Fatima Zahri", phone: "+212 661-123456" },
    { id: "c2", name: "Amina Kabbaj", phone: "+212 662-234567" },
    { id: "c3", name: "Leila Bennani", phone: "+212 663-345678" },
  ];

  function addToCart(item: { id: string; name: string; price: number; type: "service" | "product" }) {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }

  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((c) => c.id !== id));
  }

  function updateQuantity(id: string, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((c) => (c.id === id ? { ...c, quantity } : c))
    );
  }

  function processPayment(method: Payment["method"]) {
    setPayments((prev) => [...prev, { method, amount: total }]);
    setShowPaymentModal(false);
    // TODO: Send receipt via email/SMS
    setCart([]);
    setPayments([]);
    setSelectedClient(null);
  }

  function printReceipt() {
    window.print();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Caisse</h1>
        <p className="text-sm text-gray-500 mt-1">
          Point de vente — Encaissement
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Services and products */}
        <div className="lg:col-span-2 space-y-4">
          {/* Client selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <User className="h-5 w-5 mr-2" />
                Client
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedClient ? (
                <div className="flex items-center justify-between p-3 bg-rose-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {mockClients.find((c) => c.id === selectedClient)?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {mockClients.find((c) => c.id === selectedClient)?.phone}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedClient(null)}
                  >
                    Changer
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Rechercher un client..."
                    className="pl-10"
                    onFocus={() => setShowClientSearch(true)}
                  />
                  {showClientSearch && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                      {mockClients.map((client) => (
                        <button
                          key={client.id}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                          onClick={() => {
                            setSelectedClient(client.id);
                            setShowClientSearch(false);
                          }}
                        >
                          <p className="font-medium">{client.name}</p>
                          <p className="text-xs text-gray-500">{client.phone}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Scissors className="h-5 w-5 mr-2" />
                Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableServices.map((service) => (
                  <button
                    key={service.id}
                    className="p-3 rounded-lg border border-gray-200 hover:border-rose-300 hover:shadow-md transition-all text-left"
                    onClick={() => addToCart({ ...service, type: "service" })}
                  >
                    <p className="font-medium text-sm text-gray-900">
                      {service.name}
                    </p>
                    <p className="text-sm font-semibold text-rose-600 mt-1">
                      {formatPrice(service.price)}
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Package className="h-5 w-5 mr-2" />
                Produits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableProducts.map((product) => (
                  <button
                    key={product.id}
                    className="p-3 rounded-lg border border-gray-200 hover:border-rose-300 hover:shadow-md transition-all text-left"
                    onClick={() => addToCart({ ...product, type: "product" })}
                  >
                    <p className="font-medium text-sm text-gray-900">
                      {product.name}
                    </p>
                    <p className="text-sm font-semibold text-rose-600 mt-1">
                      {formatPrice(product.price)}
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Cart and payment */}
        <div className="space-y-4">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Receipt className="h-5 w-5 mr-2" />
                Panier ({cart.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Panier vide
                </p>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatPrice(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-sm hover:bg-gray-300"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          -
                        </button>
                        <span className="text-sm font-medium w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-sm hover:bg-gray-300"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="border-t border-gray-200 pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Sous-total</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Réduction</span>
                        <span>-{formatPrice(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => setShowPaymentModal(true)}
                    disabled={cart.length === 0}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Encaisser
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Paiement — {formatPrice(total)}
              </h2>
              <div className="space-y-3">
                <Button
                  className="w-full justify-start"
                  onClick={() => processPayment("CARD")}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Carte bancaire
                </Button>
                <Button
                  className="w-full justify-start"
                  onClick={() => processPayment("CASH")}
                >
                  <Banknote className="h-4 w-4 mr-2" />
                  Espèces
                </Button>
                <Button
                  className="w-full justify-start"
                  onClick={() => processPayment("CHECK")}
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  Chèque
                </Button>
                <Button
                  className="w-full justify-start"
                  onClick={() => processPayment("GIFT_CARD")}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Carte cadeau
                </Button>

                <div className="flex space-x-3 mt-4">
                  <Button variant="outline" className="flex-1" onClick={printReceipt}>
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimer
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Mail className="h-4 w-4 mr-2" />
                    Envoyer
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  className="w-full mt-2"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
