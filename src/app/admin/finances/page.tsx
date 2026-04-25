"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";

export default function ContenuPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contenu</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestion du contenu de la plateforme
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau contenu
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <FileText className="h-5 w-5 mr-2" />
              Pages statiques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span>Accueil</span>
                <Button variant="ghost" size="sm">Modifier</Button>
              </li>
              <li className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span>À propos</span>
                <Button variant="ghost" size="sm">Modifier</Button>
              </li>
              <li className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span>Contact</span>
                <Button variant="ghost" size="sm">Modifier</Button>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <FileText className="h-5 w-5 mr-2" />
              Catégories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {[
                "Coiffeur",
                "Barbier",
                "Institut de beauté",
                "Spa & Hammam",
                "Manucure & Pédicure",
                "Maquillage",
                "Épilation",
                "Massage",
              ].map((cat) => (
                <li
                  key={cat}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <span>{cat}</span>
                  <Button variant="ghost" size="sm">Modifier</Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <FileText className="h-5 w-5 mr-2" />
              Salons vedettes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Gérez les salons affichés en page d&apos;accueil.
            </p>
            <Button className="mt-3" variant="outline">
              Configurer
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
