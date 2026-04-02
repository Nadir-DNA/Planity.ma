"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, AlertTriangle, Package } from "lucide-react";

const mockProducts = [
  {
    id: "1",
    name: "Shampooing Kerastase",
    sku: "KER-SH-001",
    price: 280,
    costPrice: 180,
    stock: 12,
    lowThreshold: 5,
    supplier: "Kerastase Maroc",
  },
  {
    id: "2",
    name: "Masque L'Oreal",
    sku: "LOR-MQ-002",
    price: 180,
    costPrice: 110,
    stock: 3,
    lowThreshold: 5,
    supplier: "L'Oreal Maroc",
  },
  {
    id: "3",
    name: "Huile d'Argan bio",
    sku: "ARG-HU-001",
    price: 150,
    costPrice: 80,
    stock: 25,
    lowThreshold: 10,
    supplier: "Cooperative Argan",
  },
  {
    id: "4",
    name: "Ciseaux professionnels",
    sku: "OUT-CI-001",
    price: 450,
    costPrice: 300,
    stock: 2,
    lowThreshold: 3,
    supplier: "Pro Tools",
  },
];

export default function StockPage() {
  const lowStockCount = mockProducts.filter(
    (p) => p.stock <= p.lowThreshold
  ).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock & Produits</h1>
          <p className="text-sm text-gray-500 mt-1">
            {mockProducts.length} produits - {lowStockCount} en stock bas
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Ajouter un produit
        </Button>
      </div>

      {/* Alerts */}
      {lowStockCount > 0 && (
        <div className="flex items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
          <div>
            <p className="text-sm font-medium text-yellow-800">
              {lowStockCount} produit(s) en stock bas
            </p>
            <p className="text-xs text-yellow-600">
              Pensez a passer commande aupres de vos fournisseurs.
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input placeholder="Rechercher un produit..." className="pl-10" />
      </div>

      {/* Product list */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-4 font-medium text-gray-500">Produit</th>
                <th className="text-left p-4 font-medium text-gray-500">SKU</th>
                <th className="text-left p-4 font-medium text-gray-500">Prix vente</th>
                <th className="text-left p-4 font-medium text-gray-500">Prix achat</th>
                <th className="text-left p-4 font-medium text-gray-500">Stock</th>
                <th className="text-left p-4 font-medium text-gray-500">Fournisseur</th>
              </tr>
            </thead>
            <tbody>
              {mockProducts.map((product) => {
                const isLow = product.stock <= product.lowThreshold;
                return (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                          <Package className="h-5 w-5 text-gray-400" />
                        </div>
                        <span className="font-medium text-gray-900">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-500 font-mono text-xs">
                      {product.sku}
                    </td>
                    <td className="p-4 font-medium">{product.price} DH</td>
                    <td className="p-4 text-gray-500">{product.costPrice} DH</td>
                    <td className="p-4">
                      <Badge variant={isLow ? "warning" : "success"}>
                        {product.stock} unites
                      </Badge>
                    </td>
                    <td className="p-4 text-gray-500">{product.supplier}</td>
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
