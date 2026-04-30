
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import the full map component
const MapComponent = dynamic(
  () => import("./map-component"),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-500 text-sm">Chargement de la carte...</span>
      </div>
    )
  }
);

interface SalonLocation {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
}

interface SalonMapProps {
  salons?: SalonLocation[];
  center?: [number, number];
  zoom?: number;
  singleSalon?: SalonLocation;
  height?: string;
  onSalonClick?: (salon: SalonLocation) => void;
}

export function SalonMap({
  salons = [],
  center = [33.5731, -7.5898],
  zoom = 12,
  singleSalon,
  height = "400px",
  onSalonClick,
}: SalonMapProps) {
  const mapCenter = singleSalon 
    ? [singleSalon.lat, singleSalon.lng] 
    : salons.length > 0 
      ? [salons[0].lat, salons[0].lng] 
      : center;

  return (
    <div style={{ height }}>
      <MapComponent 
        salons={salons}
        center={mapCenter as [number, number]}
        zoom={zoom}
        singleSalon={singleSalon}
        onSalonClick={onSalonClick}
      />
    </div>
  );
}

export function MiniMap({ 
  lat, 
  lng, 
  height = "200px" 
}: { 
  lat: number; 
  lng: number; 
  height?: string;
}) {
  return (
    <div style={{ height }}>
      <MapComponent 
        center={[lat, lng]}
        zoom={15}
        mini={true}
      />
    </div>
  );
}
