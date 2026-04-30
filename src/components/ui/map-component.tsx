
"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Rose salon marker
const salonIcon = L.divIcon({
  className: "custom-salon-marker",
  html: `<div style="background: #e11e48; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">S</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

interface SalonLocation {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
}

interface MapComponentProps {
  salons?: SalonLocation[];
  center: [number, number];
  zoom: number;
  singleSalon?: SalonLocation;
  mini?: boolean;
  onSalonClick?: (salon: SalonLocation) => void;
}

export default function MapComponent({
  salons = [],
  center,
  zoom,
  singleSalon,
  mini = false,
  onSalonClick,
}: MapComponentProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={!mini}
      dragging={!mini}
      zoomControl={!mini}
      attributionControl={!mini}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {singleSalon && (
        <Marker 
          position={[singleSalon.lat, singleSalon.lng]} 
          icon={salonIcon}
        >
          {!mini && (
            <Popup>
              <div className="text-sm p-1">
                <strong className="text-rose-600">{singleSalon.name}</strong>
                <br />
                <span className="text-gray-600">{singleSalon.address}</span>
                <br />
                <span className="text-gray-500">{singleSalon.city}</span>
              </div>
            </Popup>
          )}
        </Marker>
      )}

      {salons.map((salon) => (
        <Marker
          key={salon.id}
          position={[salon.lat, salon.lng]}
          icon={defaultIcon}
          eventHandlers={{
            click: () => onSalonClick?.(salon),
          }}
        >
          <Popup>
            <div className="text-sm p-1">
              <strong className="text-rose-600">{salon.name}</strong>
              <br />
              <span className="text-gray-600">{salon.address}</span>
              <br />
              <span className="text-gray-500">{salon.city}</span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
