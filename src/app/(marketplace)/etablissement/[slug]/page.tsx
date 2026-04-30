"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Star,
  MapPin,
  Clock,
  Phone,
  Globe,
  ChevronRight,
  Calendar,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MiniMap } from "@/components/ui/salon-map";

interface SalonPageProps {
  params: { slug: string };
}

interface MockService {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
  isActive?: boolean;
  isOnlineBookable?: boolean;
}

interface MockStaff {
  id: string;
  displayName: string;
  title?: string;
  color: string;
  avatar?: string;
}

interface MockReview {
  id: string;
  author: string;
  overallRating: number;
  comment: string;
  date: string;
}

interface SalonImage {
  id: string;
  url: string;
  caption: string;
  order: number;
}

interface SalonData {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website?: string;
  averageRating: number;
  reviewCount: number;
  latitude: number;
  longitude: number;
  coverImage?: string;
  images: SalonImage[];
  services: MockService[];
  staff: MockStaff[];
  openingHours: { dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean }[];
  reviews: MockReview[];
}

const DAYS_FR = [
  "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"
];

const CATEGORY_LABELS: Record<string, string> = {
  COIFFEUR: "Coiffeur",
  BARBIER: "Barbier",
  INSTITUT_BEAUTE: "Institut de beauté",
  SPA: "Spa & Hammam",
  ONGLES: "Manucure & Pédicure",
  MAQUILLAGE: "Maquillage",
  EPILATION: "Épilation",
  MASSAGE: "Massage",
};

export default function SalonPage({ params }: SalonPageProps) {
  const [salon, setSalon] = useState<SalonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    async function fetchSalon() {
      try {
        const res = await fetch(`/api/v1/salons/${params.slug}`);
        if (!res.ok) throw new Error("Salon introuvable");
        const data = await res.json();
        // Map API response to our interface
        const s = data.salon;
        setSalon({
          id: s.id,
          name: s.name,
          slug: s.slug,
          description: s.description || "",
          category: s.category,
          address: s.address,
          city: s.city,
          phone: s.phone || "",
          email: s.email || "",
          averageRating: s.averageRating || 0,
          reviewCount: s.reviewCount || (s._count?.reviews) || 0,
          latitude: s.latitude || 0,
          longitude: s.longitude || 0,
          coverImage: s.coverImage || (s.photos?.[0]?.url) || "",
          images: (s.photos || []).map((p: { id: string; url: string; alt?: string; order: number }) => ({
            id: p.id,
            url: p.url,
            caption: p.alt || "",
            order: p.order ?? 0,
          })),
          services: (s.services || []).map((sv: MockService & { name?: string; price?: number; duration?: number }) => ({
            id: sv.id,
            name: sv.name,
            price: sv.price,
            duration: sv.duration,
            description: sv.description,
          })),
          staff: (s.staff || []).map((st: MockStaff) => ({
            id: st.id,
            displayName: st.displayName,
            title: st.title,
            color: st.color,
            avatar: st.avatar,
          })),
          openingHours: s.openingHours || [],
          reviews: (s.reviews || []).map((r: MockReview & { user?: { name: string }; createdAt?: string; comment?: string }) => ({
            id: r.id,
            author: r.author || r.user?.name || "Anonyme",
            overallRating: r.overallRating,
            comment: r.comment || "",
            date: r.date || (r.createdAt ? new Date(r.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "Récemment"),
          })),
        });
      } catch (err) {
        console.error("Erreur chargement salon:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSalon();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-on-surface" />
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-semibold text-on-surface">Salon introuvable</h2>
        <p className="mt-2 text-on-surface-muted">Ce salon n&apos;existe pas ou a été supprimé.</p>
        <Button className="mt-6" asChild>
          <Link href="/recherche">Rechercher un salon</Link>
        </Button>
      </div>
    );
  }

  const categoryLabel = CATEGORY_LABELS[salon.category] || salon.category;
  const hasImages = salon.images.length > 0 || salon.coverImage;
  const heroImage = salon.images.length > 0
    ? salon.images[selectedImage]?.url || salon.coverImage
    : salon.coverImage;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-on-surface-muted mb-6">
        <Link href="/" className="hover:text-on-surface">
          Accueil
        </Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <Link href={`/recherche?city=${salon.city}`} className="hover:text-on-surface">
          {salon.city}
        </Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="text-on-surface">{salon.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Gallery / Cover Image */}
          {hasImages ? (
            <div className="space-y-2">
              <div className="relative aspect-[16/9] bg-surface-container-low rounded-md overflow-hidden">
                <Image
                  src={heroImage || ""}
                  alt={salon.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              </div>
              {salon.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {salon.images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative flex-shrink-0 w-20 h-14 rounded-md overflow-hidden border-2 transition-colors ${
                        idx === selectedImage
                          ? "border-on-surface"
                          : "border-transparent hover:border-outline-light"
                      }`}
                    >
                      <Image
                        src={img.url}
                        alt={img.caption || `${salon.name} photo ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-[16/9] bg-surface-container-low rounded-md flex items-center justify-center">
              <span className="text-6xl font-bold text-on-surface-muted select-none">
                {salon.name?.[0]?.toUpperCase() || "S"}
              </span>
            </div>
          )}

          {/* Salon info */}
          <div>
            <div className="flex items-start justify-between">
              <div>
                <Badge variant="secondary" className="text-xs uppercase tracking-wider">
                  {categoryLabel}
                </Badge>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-on-surface">
                  {salon.name}
                </h1>
                <div className="flex items-center mt-2 space-x-4">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-on-surface fill-on-surface" />
                    <span className="ml-1 font-semibold text-on-surface">{salon.averageRating}</span>
                    <span className="ml-1 text-on-surface-muted">
                      ({salon.reviewCount} avis)
                    </span>
                  </div>
                  <div className="flex items-center text-on-surface-muted">
                    <MapPin className="h-4 w-4 mr-1" />
                    {salon.address}, {salon.city}
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-4 text-on-surface-muted">{salon.description}</p>
          </div>

          {/* Services */}
          <div className="bg-surface-bright rounded-md border border-outline-light p-6">
            <h2 className="text-lg font-semibold tracking-tight text-on-surface mb-4">Services</h2>
            <div className="divide-y divide-outline-light">
              {salon.services.filter((s) => s.isOnlineBookable !== false && s.isActive !== false).map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium text-on-surface">{service.name}</p>
                    {service.description && (
                      <p className="text-sm text-on-surface-muted">{service.description}</p>
                    )}
                    <p className="text-xs text-on-surface-muted mt-0.5">
                      <Clock className="inline h-3 w-3 mr-0.5" />
                      {service.duration} min
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-on-surface">
                      {service.price} DH
                    </span>
                    <Button size="sm" asChild>
                      <Link href={`/reservation/${salon.id}?service=${service.id}`}>
                        Réserver
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team */}
          <div className="bg-surface-bright rounded-md border border-outline-light p-6">
            <h2 className="text-lg font-semibold tracking-tight text-on-surface mb-4">L&apos;équipe</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {salon.staff.map((member) => (
                <div key={member.id} className="text-center p-3 rounded-md bg-surface-container-low">
                  <div
                    className="mx-auto h-14 w-14 rounded-full flex items-center justify-center text-sm font-bold text-surface-bright"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.displayName.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <p className="mt-2 font-medium text-sm text-on-surface">{member.displayName}</p>
                  {member.title && (
                    <p className="text-xs text-on-surface-muted">{member.title}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          {salon.reviews.length > 0 && (
            <div className="bg-surface-bright rounded-md border border-outline-light p-6">
              <h2 className="text-lg font-semibold tracking-tight text-on-surface mb-4">
                Avis clients ({salon.reviewCount})
              </h2>
              <div className="space-y-6">
                {salon.reviews.map((review) => (
                  <div key={review.id} className="pb-4 border-b border-outline-light last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-surface-container-low flex items-center justify-center text-xs font-bold text-on-surface">
                          {(review.author || "?")[0]}
                        </div>
                        <span className="font-medium text-on-surface">{review.author}</span>
                      </div>
                      <span className="text-xs text-on-surface-muted">{review.date}</span>
                    </div>
                    <div className="flex items-center mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.overallRating
                              ? "text-on-surface fill-on-surface"
                              : "text-outline-light"
                          }`}
                        />
                      ))}
                    </div>
                    {review.comment && (
                      <p className="mt-2 text-sm text-on-surface-muted">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-surface-bright rounded-md border border-outline-light p-6 sticky top-24">
            <Button className="w-full" size="lg" asChild>
              <Link href={`/reservation/${salon.id}`}>
                <Calendar className="mr-2 h-5 w-5" />
                Prendre rendez-vous
              </Link>
            </Button>

            <div className="mt-6 space-y-4">
              {salon.phone && (
                <div className="flex items-center text-sm text-on-surface-muted">
                  <Phone className="h-4 w-4 mr-3 text-on-surface-muted" />
                  <span>{salon.phone}</span>
                </div>
              )}
              <div className="flex items-center text-sm text-on-surface-muted">
                <MapPin className="h-4 w-4 mr-3 text-on-surface-muted" />
                <span>{salon.address}, {salon.city}</span>
              </div>
            </div>

            {/* Opening hours */}
            {salon.openingHours.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium text-on-surface mb-3">Horaires</h4>
                <div className="space-y-2">
                  {salon.openingHours
                    .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                    .map((h) => (
                      <div key={h.dayOfWeek} className="flex justify-between text-sm">
                        <span className="text-on-surface-muted">{DAYS_FR[h.dayOfWeek]}</span>
                        <span className={h.isClosed ? "text-red-500" : "text-on-surface"}>
                          {h.isClosed ? "Fermé" : `${h.openTime} - ${h.closeTime}`}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Interactive Map */}
            {salon.latitude && salon.longitude && (
              <div className="mt-6">
                <h4 className="font-medium text-on-surface mb-3">Localisation</h4>
                <div className="rounded-md overflow-hidden">
                  <MiniMap lat={salon.latitude} lng={salon.longitude} height="200px" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}