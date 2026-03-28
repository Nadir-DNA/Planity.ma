export const APP_NAME = "Planity.ma";
export const APP_DESCRIPTION =
  "Réservez votre prochain rendez-vous beauté en ligne. Coiffeur, barbier, institut de beauté, spa et plus au Maroc.";

export const MOROCCAN_CITIES = [
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Fès",
  "Tanger",
  "Agadir",
  "Meknès",
  "Oujda",
  "Kénitra",
  "Tétouan",
  "Salé",
  "Mohammedia",
  "El Jadida",
  "Béni Mellal",
  "Nador",
  "Taza",
  "Settat",
  "Khouribga",
] as const;

export const SALON_CATEGORIES = [
  { slug: "coiffeur", name: "Coiffeur", nameAr: "حلاق", icon: "scissors" },
  { slug: "barbier", name: "Barbier", nameAr: "حلاق رجالي", icon: "scissors" },
  {
    slug: "institut-beaute",
    name: "Institut de beauté",
    nameAr: "معهد التجميل",
    icon: "sparkles",
  },
  { slug: "spa", name: "Spa & Hammam", nameAr: "سبا وحمام", icon: "droplets" },
  {
    slug: "ongles",
    name: "Manucure & Pédicure",
    nameAr: "مانيكير وباديكير",
    icon: "hand",
  },
  {
    slug: "maquillage",
    name: "Maquillage",
    nameAr: "مكياج",
    icon: "palette",
  },
  {
    slug: "epilation",
    name: "Épilation",
    nameAr: "إزالة الشعر",
    icon: "zap",
  },
  { slug: "massage", name: "Massage", nameAr: "تدليك", icon: "heart" },
] as const;

export const DAYS_OF_WEEK = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
] as const;

export const TIME_SLOTS_INTERVAL = 15; // minutes

export const BOOKING_STATUSES = {
  PENDING: { label: "En attente", color: "yellow" },
  CONFIRMED: { label: "Confirmé", color: "blue" },
  IN_PROGRESS: { label: "En cours", color: "purple" },
  COMPLETED: { label: "Terminé", color: "green" },
  CANCELLED: { label: "Annulé", color: "red" },
  NO_SHOW: { label: "Absent", color: "gray" },
} as const;
