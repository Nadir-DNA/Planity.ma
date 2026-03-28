import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";
import Link from "next/link";

const mockBookings = [
  {
    id: "1",
    reference: "PLM-A3K7N",
    salon: "Salon Elegance",
    salonSlug: "salon-elegance-casablanca",
    services: ["Coupe femme", "Brushing"],
    date: "2024-03-20",
    time: "14:00",
    duration: 75,
    price: 250,
    status: "CONFIRMED" as const,
    address: "123 Bd Mohammed V, Casablanca",
  },
  {
    id: "2",
    reference: "PLM-B8M2P",
    salon: "Spa Zenith",
    salonSlug: "spa-zenith-marrakech",
    services: ["Hammam", "Massage"],
    date: "2024-03-15",
    time: "10:00",
    duration: 120,
    price: 500,
    status: "COMPLETED" as const,
    address: "Gueliz, Marrakech",
  },
];

const statusConfig = {
  PENDING: { label: "En attente", variant: "warning" as const },
  CONFIRMED: { label: "Confirme", variant: "default" as const },
  COMPLETED: { label: "Termine", variant: "success" as const },
  CANCELLED: { label: "Annule", variant: "destructive" as const },
};

export default function AppointmentsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Mes rendez-vous
      </h1>

      <div className="space-y-4">
        {mockBookings.map((booking) => {
          const config = statusConfig[booking.status];
          return (
            <Card key={booking.id}>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/etablissement/${booking.salonSlug}`}
                        className="font-semibold text-gray-900 hover:text-rose-600"
                      >
                        {booking.salon}
                      </Link>
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {booking.services.join(", ")}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        {booking.date}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        {booking.time} ({booking.duration} min)
                      </span>
                      <span className="flex items-center">
                        <MapPin className="h-3.5 w-3.5 mr-1" />
                        {booking.address}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-lg">{booking.price} DH</span>
                    {booking.status === "CONFIRMED" && (
                      <Button variant="outline" size="sm">
                        Modifier
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  Ref: {booking.reference}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
