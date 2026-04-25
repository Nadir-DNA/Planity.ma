"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
  Package,
  AlertTriangle,
  Search,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  category: string;
  supplier?: string;
}

interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: "IN" | "OUT";
  quantity: number;
  date: string;
  note?: string;
}

export default function ProStockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"products" | "movements">("products");

  // Form state
  const [form, setForm] = useState({
    name: "",
    sku: "",
    price: "",
    cost: "",
    stock: "",
    minStock: "5",
    category: "",
    supplier: "",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Mock data
        const mockProducts: Product[] = [
          {
            id: "p1",
            name: "Shampooing professionnel",
            sku: "SH-001",
            price: 150,
            cost: 80,
            stock: 20,
            minStock: 5,
            category: "Shampooing",
            supplier: "Fournisseur Pro",
          },
          {
            id: "p2",
            name: "Masque capillaire",
            sku: "MC-002",
            price: 200,
            cost: 120,
            stock: 15,
            minStock: 5,
            category: "Masque",
            supplier: "Fournisseur Pro",
          },
          {
            id: "p3",
            name: "Huile d'argan",
            sku: "HA-003",
            price: 120,
            cost: 60,
            stock: 3,
            minStock: 5,
            category: "Huile",
            supplier: "Bio Maroc",
          },
          {
            id: "p4",
            name: "Laque fixante",
            sku: "LF-004",
            price: 80,
            cost: 40,
            stock: 25,
            minStock: 10,
            category: "Coiffant",
            supplier: "Fournisseur Pro",
          },
        ];
        setProducts(mockProducts);

        const mockMovements: StockMovement[] = [
          { id: "m1", productId: "p1", productName: "Shampooing professionnel", type: "IN", quantity: 10, date: "2024-03-15", note: "Réception commande" },
          { id: "m2", productId: "p3", productName: "Huile d'argan", type: "OUT", quantity: 2, date: "2024-03-18", note: "Vente caisse" },
          { id: "m3", productId: "p2", productName: "Masque capillaire", type: "IN", quantity: 5, date: "2024-03-10", note: "Réception commande" },
        ];
        setMovements(mockMovements);
      } catch (err) {
        toast.error("Erreur de chargement");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  function openCreate() {
    setEditingProduct(null);
    setForm({
      name: "",
      sku: "",
      price: "",
      cost: "",
      stock: "",
      minStock: "5",
      category: "",
      supplier: "",
    });
    setShowModal(true);
  }

  function openEdit(product: Product) {
    setEditingProduct(product);
    setForm({
      name: product.name,
      sku: product.sku,
      price: product.price.toString(),
      cost: product.cost.toString(),
      stock: product.stock.toString(),
      minStock: product.minStock.toString(),
      category: product.category,
      supplier: product.supplier || "",
    });
    setShowModal(true);
  }

  function handleSubmit() {
    if (!form.name || !form.price || !form.stock) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: form.name,
                sku: form.sku,
                price: parseFloat(form.price),
                cost: parseFloat(form.cost),
                stock: parseInt(form.stock),
                minStock: parseInt(form.minStock),
                category: form.category,
                supplier: form.supplier,
              }
            : p
        )
      );
      toast("Produit modifié avec succès", { icon: "✅" });
    } else {
      const newProduct: Product = {
        id: `new-${Date.now()}`,
        name: form.name,
        sku: form.sku || `SKU-${Date.now()}`,
        price: parseFloat(form.price),
        cost: parseFloat(form.cost) || 0,
        stock: parseInt(form.stock),
        minStock: parseInt(form.minStock),
        category: form.category,
        supplier: form.supplier,
      };
      setProducts((prev) => [...prev, newProduct]);
      toast("Produit créé avec succès", { icon: "✅" });
    }
    setShowModal(false);
  }

  function handleDelete(product: Product) {
    if (!confirm(`Supprimer "${product.name}" ?`)) return;
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
    toast("Produit supprimé", { icon: "🗑️" });
  }

  function updateStock(product: Product, delta: number) {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, stock: Math.max(0, p.stock + delta) } : p
      )
    );

    // Add movement
    const newMovement: StockMovement = {
      id: `m-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      type: delta > 0 ? "IN" : "OUT",
      quantity: Math.abs(delta),
      date: new Date().toISOString().split("T")[0],
    };
    setMovements((prev) => [newMovement, ...prev]);
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

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
          <h1 className="text-2xl font-bold text-gray-900">Stock</h1>
          <p className="text-sm text-gray-500">
            {products.length} produits • Valeur totale: {totalValue.toLocaleString()} DH
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lowStockProducts.length > 0 && (
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {lowStockProducts.length} alerte{lowStockProducts.length > 1 ? "s" : ""}
            </Badge>
          )}
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" />
            Nouveau produit
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === "products" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("products")}
        >
          Produits
        </Button>
        <Button
          variant={activeTab === "movements" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("movements")}
        >
          Historique
        </Button>
      </div>

      {activeTab === "products" ? (
        <>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher par nom ou SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Products List */}
          {filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p>Aucun produit</p>
                <Button variant="outline" className="mt-4" onClick={openCreate}>
                  Ajouter votre premier produit
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredProducts.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">{product.name}</h3>
                          {product.stock <= product.minStock && (
                            <Badge variant="outline" className="text-orange-600 border-orange-600">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Stock bas
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          SKU: {product.sku} • {product.category}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Prix</p>
                          <p className="font-bold">{product.price} DH</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => updateStock(product, -1)}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <span className={`text-lg font-bold w-12 text-center ${
                            product.stock <= product.minStock ? "text-red-600" : "text-gray-900"
                          }`}>
                            {product.stock}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => updateStock(product, 1)}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(product)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(product)}
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
        </>
      ) : (
        <>
          {/* Movements History */}
          {movements.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p>Aucun mouvement de stock</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {movements.map((movement) => (
                <Card key={movement.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{movement.productName}</p>
                        <p className="text-sm text-gray-500">{movement.date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          className={movement.type === "IN" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                        >
                          {movement.type === "IN" ? "+" : "-"}{movement.quantity}
                        </Badge>
                        {movement.note && (
                          <p className="text-sm text-gray-500">{movement.note}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {editingProduct ? "Modifier le produit" : "Nouveau produit"}
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du produit *
                  </label>
                  <Input
                    placeholder="Ex: Shampooing professionnel"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU
                  </label>
                  <Input
                    placeholder="Ex: SH-001"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prix de vente (DH) *
                    </label>
                    <Input
                      type="number"
                      placeholder="150"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Coût d'achat (DH)
                    </label>
                    <Input
                      type="number"
                      placeholder="80"
                      value={form.cost}
                      onChange={(e) => setForm({ ...form, cost: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock actuel *
                    </label>
                    <Input
                      type="number"
                      placeholder="20"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock minimum
                    </label>
                    <Input
                      type="number"
                      placeholder="5"
                      value={form.minStock}
                      onChange={(e) => setForm({ ...form, minStock: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Catégorie
                    </label>
                    <Input
                      placeholder="Ex: Shampooing"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fournisseur
                    </label>
                    <Input
                      placeholder="Ex: Fournisseur Pro"
                      value={form.supplier}
                      onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSubmit}>
                  <Check className="h-4 w-4 mr-1" />
                  {editingProduct ? "Modifier" : "Créer"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
