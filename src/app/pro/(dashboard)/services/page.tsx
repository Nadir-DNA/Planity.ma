"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Clock, GripVertical, Trash2 } from "lucide-react";

const serviceCategories = [
  {
    name: "Coupe",
    services: [
      { id: "1", name: "Coupe femme", price: 150, duration: 45, active: true },
      { id: "2", name: "Coupe homme", price: 80, duration: 30, active: true },
      { id: "3", name: "Coupe enfant", price: 60, duration: 20, active: true },
    ],
  },
  {
    name: "Coloration",
    services: [
      { id: "4", name: "Coloration complete", price: 300, duration: 90, active: true },
      { id: "5", name: "Meches", price: 250, duration: 120, active: true },
      { id: "6", name: "Balayage", price: 350, duration: 150, active: false },
    ],
  },
  {
    name: "Soins",
    services: [
      { id: "7", name: "Brushing", price: 100, duration: 30, active: true },
      { id: "8", name: "Soin capillaire", price: 200, duration: 60, active: true },
    ],
  },
];

export default function ServicesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerez vos prestations et tarifs
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Ajouter un service
        </Button>
      </div>

      <div className="space-y-6">
        {serviceCategories.map((category) => (
          <Card key={category.name}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{category.name}</CardTitle>
                <Badge variant="secondary">
                  {category.services.length} services
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {category.services.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center space-x-3">
                      <GripVertical className="h-4 w-4 text-gray-300 cursor-grab" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900">
                            {service.name}
                          </p>
                          {!service.active && (
                            <Badge variant="secondary" className="text-xs">
                              Inactif
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          <Clock className="inline h-3 w-3 mr-1" />
                          {service.duration} min
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold">{service.price} DH</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
