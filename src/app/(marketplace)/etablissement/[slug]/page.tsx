import type { Metadata } from "next";
import Link from "next/link";
import {
  Star,
  MapPin,
  Clock,
  Phone,
  Globe,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Placeholder - will be replaced by DB query
function getSalon(slug: string) {
  return {
    id: "1",
    name: "Salon Elegance",
    slug,
    description:
      "Salon de coiffure haut de gamme au coeur de Casablanca. Notre equipe de professionnels vous accueille dans un cadre chaleureux et moderne pour sublimer votre beaute.",
    category: "Coiffeur",
    address: "123 Boulevard Mohammed V",
    city: "Casablanca",
    phone: "+212 5XX-XXXXXX",
    website: "https://salon-elegance.ma",
    rating: 4.8,
    reviewCount: 124,
    openingHours: [
      { day: "Lundi", hours: "09:00 - 19:00" },
      { day: "Mardi", hours: "09:00 - 19:00" },
      { day: "Mercredi", hours: "09:00 - 19:00" },
      { day: "Jeudi", hours: "09:00 - 19:00" },
      { day: "Vendredi", hours: "09:00 - 19:00" },
      { day: "Samedi", hours: "09:00 - 20:00" },
      { day: "Dimanche", hours: "Ferme" },
    ],
    services: [
      { id: "s1", name: "Coupe femme", price: 150, duration: 45 },
      { id: "s2", name: "Coupe homme", price: 80, duration: 30 },
      { id: "s3", name: "Coloration", price: 300, duration: 90 },
      { id: "s4", name: "Brushing", price: 100, duration: 30 },
      { id: "s5", name: "Meches", price: 250, duration: 120 },
      { id: "s6", name: "Soin capillaire", price: 200, duration: 60 },
    ],
    team: [
      { id: "t1", name: "Sara M.", title: "Coiffeuse senior", avatar: null },
      { id: "t2", name: "Karim B.", title: "Coloriste", avatar: null },
      { id: "t3", name: "Nadia L.", title: "Coiffeuse", avatar: null },
    ],
    reviews: [
      {
        id: "r1",
        author: "Fatima Z.",
        rating: 5,
        comment: "Excellent service, equipe tres professionnelle !",
        date: "Il y a 2 jours",
      },
      {
        id: "r2",
        author: "Ahmed K.",
        rating: 4,
        comment: "Tres bon salon, je recommande. Un peu d'attente parfois.",
        date: "Il y a 1 semaine",
      },
    ],
  };
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const salon = getSalon(params.slug);
  return {
    title: `${salon.name} - ${salon.category} a ${salon.city}`,
    description: salon.description,
  };
}

export default function SalonPage({ params }: { params: { slug: string } }) {
  const salon = getSalon(params.slug);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-900">
          Accueil
        </Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <Link href={`/recherche?city=${salon.city}`} className="hover:text-gray-900">
          {salon.city}
        </Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="text-gray-900">{salon.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Gallery placeholder */}
          <div className="grid grid-cols-4 gap-2 rounded-xl overflow-hidden">
            <div className="col-span-4 sm:col-span-2 row-span-2 aspect-[4/3] bg-gradient-to-br from-rose-200 to-rose-300" />
            <div className="hidden sm:block aspect-square bg-gradient-to-br from-rose-100 to-rose-200" />
            <div className="hidden sm:block aspect-square bg-gradient-to-br from-rose-100 to-rose-200" />
          </div>

          {/* Salon info */}
          <div>
            <div className="flex items-start justify-between">
              <div>
                <Badge variant="secondary">{salon.category}</Badge>
                <h1 className="mt-2 text-3xl font-bold text-gray-900">
                  {salon.name}
                </h1>
                <div className="flex items-center mt-2 space-x-4">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                    <span className="ml-1 font-semibold">{salon.rating}</span>
                    <span className="ml-1 text-gray-500">
                      ({salon.reviewCount} avis)
                    </span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    {salon.address}, {salon.city}
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-4 text-gray-600">{salon.description}</p>
          </div>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle>Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-gray-100">
                {salon.services.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {service.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        <Clock className="inline h-3.5 w-3.5 mr-1" />
                        {service.duration} min
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold text-gray-900">
                        {service.price} DH
                      </span>
                      <Button size="sm" asChild>
                        <Link
                          href={`/reservation/${salon.id}?service=${service.id}`}
                        >
                          Reserver
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team */}
          <Card>
            <CardHeader>
              <CardTitle>L&apos;equipe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {salon.team.map((member) => (
                  <div key={member.id} className="text-center">
                    <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-rose-200 to-rose-300 flex items-center justify-center text-rose-700 font-bold text-lg">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <p className="mt-2 font-medium text-gray-900">
                      {member.name}
                    </p>
                    <p className="text-sm text-gray-500">{member.title}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Avis clients ({salon.reviewCount})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {salon.reviews.map((review) => (
                  <div key={review.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                          {review.author[0]}
                        </div>
                        <span className="font-medium">{review.author}</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {review.date}
                      </span>
                    </div>
                    <div className="flex items-center mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "text-amber-400 fill-amber-400"
                              : "text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* CTA */}
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <Button className="w-full" size="lg" asChild>
                <Link href={`/reservation/${salon.id}`}>
                  <Calendar className="mr-2 h-5 w-5" />
                  Prendre rendez-vous
                </Link>
              </Button>

              <div className="mt-6 space-y-4">
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-3 text-gray-400" />
                  <span>{salon.phone}</span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-3 text-gray-400" />
                  <span>
                    {salon.address}, {salon.city}
                  </span>
                </div>
                {salon.website && (
                  <div className="flex items-center text-sm">
                    <Globe className="h-4 w-4 mr-3 text-gray-400" />
                    <a
                      href={salon.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-rose-600 hover:underline"
                    >
                      Site web
                    </a>
                  </div>
                )}
              </div>

              {/* Opening hours */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Horaires</h4>
                <div className="space-y-2">
                  {salon.openingHours.map((h) => (
                    <div
                      key={h.day}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-gray-500">{h.day}</span>
                      <span
                        className={
                          h.hours === "Ferme"
                            ? "text-red-500"
                            : "text-gray-900"
                        }
                      >
                        {h.hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
