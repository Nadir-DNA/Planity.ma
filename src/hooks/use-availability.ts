"use client";

import { useQuery } from "@tanstack/react-query";

interface TimeSlot {
  start: string;
  end: string;
}

interface StaffAvailability {
  staffId: string;
  staffName: string;
  staffColor: string;
  slots: TimeSlot[];
}

interface AvailabilityResponse {
  date: string;
  salonId: string;
  availability: StaffAvailability[];
}

async function fetchAvailability(
  salonId: string,
  date: string,
  serviceId?: string,
  staffId?: string
): Promise<AvailabilityResponse> {
  const params = new URLSearchParams({ salonId, date });
  if (serviceId) params.set("serviceId", serviceId);
  if (staffId) params.set("staffId", staffId);

  const res = await fetch(`/api/v1/availability?${params}`);
  if (!res.ok) throw new Error("Erreur lors du chargement des disponibilites");
  return res.json();
}

export function useAvailability(
  salonId: string | null,
  date: string,
  serviceId?: string,
  staffId?: string
) {
  return useQuery({
    queryKey: ["availability", salonId, date, serviceId, staffId],
    queryFn: () => fetchAvailability(salonId!, date, serviceId, staffId),
    enabled: !!salonId && !!date,
    staleTime: 30 * 1000, // 30 seconds - availability changes frequently
  });
}
