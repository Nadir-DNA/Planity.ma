"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Search,
  Package,
  Edit,
  Trash2,
  Barcode,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  barcode: string;
  sku: string;
  price: number;
  costPrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
  supplier: string;
  isActive: boolean;
}

export default function StockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const mockProducts: Product[] = [
      {
        id: "1",
        name: "Shampooing professionnel 500ml",
        barcode: "3760001234567",
        sku: "SH-500",
        price: 120,
        costPrice: 60,
        stockQuantity: 25,
        lowStockThreshold: 5,
        supplier: "L'Oréal Pro",
        isActive: true,
      },
      {
        id: "2",
        name: "Après-shampooing réparateur",
        barcode: "3760001234568",
        sku: "AS-500",
        price: 95,
        costPrice: 45,
        stockQuantity: 3,
        lowStockThreshold: 5,
        supplier: "Kérastase",
        isActive: true,
      },
      {
        id: "3",
        name: "Masque capillaire intensif",
        barcode: "3760001234569",
        sku: "MS-300",
        price: 180,
        costPrice: 90,
        stockQuantity: 15,
        lowStockThreshold: 5,
        supplier: "L'Oréal Pro",
        isActive: true,
      },
      {
        id: "4",
        name: "Huile d'argan bio",
        barcode: "3760001234570",
        sku: "HU-100",
        price: 250,
        costPrice: 120,
        stockQuantity: 8,
        lowStockThreshold: 3,
        supplier: "Bio Maroc",
        isActive: true,
      },
    ];
    setProducts(mockProducts);
    setLoading(false);
  }, []);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockProducts = products.filter(
    (p) => p.stockQuantity <= p.lowStockThreshold
  );

  const totalValue = products.reduce(
    (sum, p) => sum + p.price * p.stockQuantity,
    0
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestion des produits et inventaire
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau produit
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total produits</p>
            <p className="text-2xl font-bold">{products.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Valeur du stock</p>
            <p className="text-2xl font-bold">{formatPrice(totalValue)}</p>
          </CardContent>
        </Card>
        <Card className={lowStockProducts.length > 0 ? "border-amber-200 bg-amber-50" : ""}>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Alertes stock bas</p>
            <p className="text-2xl font-bold flex items-center">
              {lowStockProducts.length}
              {lowStockProducts.length > 0 && (
                <AlertTriangle className="h-5 w-5 text-amber-500 ml-2" />
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Rechercher par nom, code-barres ou SKU..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Products list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-600 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className={
                product.stockQuantity <= product.lowStockThreshold
                  ? "border-amber-200"
                  : ""
              }
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Package className="h-5 w-5 text-rose-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {product.name}
                        </p>
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Barcode className="h-3 w-3 mr-1" />
                            {product.barcode}
                          </span>
                          <span>SKU: {product.sku}</span>
                          <span>Fournisseur: {product.supplier}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(product.price)}</p>
                      <p className="text-xs text-gray-500">
                        Coût: {formatPrice(product.costPrice)}
                      </p>
                    </div>
                    <div className="text-center">
                      <div
                        className={`text-lg font-bold ${
                          product.stockQuantity <= product.lowStockThreshold
                            ? "text-red-600"
                            : "text-gray-900"
                        }`}
                      >
                        {product.stockQuantity}
                      </div>
                      <p className="text-xs text-gray-500">en stock</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm">
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add product modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Nouveau produit
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du produit *
                  </label>
                  <Input placeholder="Ex: Shampooing professionnel" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code-barres
                    </label>
                    <Input placeholder="3760001234567" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU
                    </label>
                    <Input placeholder="SH-500" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prix de vente (DH) *
                    </label>
                    <Input type="number" placeholder="120" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prix d&apos;achat (DH)
                    </label>
                    <Input type="number" placeholder="60" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock initial
                    </label>
                    <Input type="number" placeholder="10" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Seuil d&apos;alerte
                    </label>
                    <Input type="number" placeholder="5" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fournisseur
                    </label>
                    <Input placeholder="L'Oréal Pro" />
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button className="flex-1">Créer</Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
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
