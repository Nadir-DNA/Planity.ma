import { create } from "zustand";

interface BookingState {
  salonId: string | null;
  selectedServices: string[];
  selectedStaffId: string | null;
  selectedDate: string;
  selectedTime: string | null;
  notes: string;

  // Actions
  setSalonId: (id: string) => void;
  toggleService: (serviceId: string) => void;
  setSelectedStaff: (staffId: string | null) => void;
  setSelectedDate: (date: string) => void;
  setSelectedTime: (time: string | null) => void;
  setNotes: (notes: string) => void;
  reset: () => void;
}

const initialState = {
  salonId: null,
  selectedServices: [],
  selectedStaffId: null,
  selectedDate: "",
  selectedTime: null,
  notes: "",
};

export const useBookingStore = create<BookingState>((set) => ({
  ...initialState,

  setSalonId: (id) => set({ salonId: id }),

  toggleService: (serviceId) =>
    set((state) => ({
      selectedServices: state.selectedServices.includes(serviceId)
        ? state.selectedServices.filter((id) => id !== serviceId)
        : [...state.selectedServices, serviceId],
    })),

  setSelectedStaff: (staffId) => set({ selectedStaffId: staffId }),

  setSelectedDate: (date) => set({ selectedDate: date, selectedTime: null }),

  setSelectedTime: (time) => set({ selectedTime: time }),

  setNotes: (notes) => set({ notes }),

  reset: () => set(initialState),
}));
