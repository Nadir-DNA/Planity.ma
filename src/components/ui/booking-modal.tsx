
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Calendar } from "./calendar";
import { TimeSlotPicker, generateMockSlots } from "./time-slot-picker";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, DialogClose } from "./dialog";
import { Button } from "./button";
import { RatingStars } from "./rating-stars";
import { ChevronRight, Clock } from "lucide-react";

interface Service { id: string; name: string; price: number; duration: number }
interface Salon { name: string; rating: number; reviewCount: number }

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salon: Salon;
  services: Service[];
  onConfirm: (data: { serviceId: string; date: Date; time: string }) => void;
}

export function BookingModal({ open, onOpenChange, salon, services, onConfirm }: BookingModalProps) {
  const [step, setStep] = useState<"service" | "datetime">("service");
  const [service, setService] = useState<Service | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [slot, setSlot] = useState<{ time: string; available: boolean } | undefined>(undefined);

  const handleConfirm = () => {
    if (service && date && slot) {
      onConfirm({ serviceId: service.id, date, time: slot.time });
      onOpenChange(false);
      setStep("service");
      setService(null);
      setDate(null);
      setSlot(undefined);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogClose onClick={() => onOpenChange(false)} />
      
      <DialogHeader>
        <DialogTitle>{step === "service" ? "Choisir un service" : "Choisir une date"}</DialogTitle>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-medium">{salon.name}</span>
          <RatingStars rating={salon.rating} size="sm" />
          <span className="text-sm text-neutral-500">({salon.reviewCount})</span>
        </div>
      </DialogHeader>

      <DialogContent>
        {step === "service" && (
          <div className="space-y-3">
            {services.map((s) => (
              <button
                key={s.id}
                onClick={() => setService(s)}
                className={cn(
                  "w-full p-4 rounded-lg border text-left",
                  service?.id === s.id ? "border-mint bg-mint/5" : "border-neutral-200 hover:border-neutral-300"
                )}
              >
                <div className="flex justify-between">
                  <span className="font-medium">{s.name}</span>
                  <div className="text-right">
                    <span className="font-semibold">{s.price} MAD</span>
                    <span className="text-sm text-neutral-500 flex items-center gap-1 mt-1"><Clock className="w-3 h-3" />{s.duration} min</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === "datetime" && (
          <div className="space-y-4">
            <Calendar selectedDate={date || undefined} onDateSelect={(d) => { setDate(d); setSlot(undefined); }} minDate={new Date()} />
            {date && <TimeSlotPicker slots={generateMockSlots()} selectedSlot={slot} onSelect={setSlot} />}
          </div>
        )}
      </DialogContent>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
        {step === "service" ? (
          <Button onClick={() => service && setStep("datetime")} disabled={!service}>Continuer <ChevronRight className="w-4 h-4 ml-1" /></Button>
        ) : (
          <Button onClick={handleConfirm} disabled={!date || !slot}>Confirmer</Button>
        )}
      </DialogFooter>
    </Dialog>
  );
}
