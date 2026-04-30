/**
 * Mock data for Planity.ma — used as fallback when DB is unavailable.
 * When Supabase is connected, API routes will use Prisma first, then fallback to these.
 */

export interface MockSalon {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  coverImage: string | null;
  photos: { id: string; url: string; alt: string; order: number }[];
  isActive: boolean;
  isVerified: boolean;
  averageRating: number;
  reviewCount: number;
  latitude: number;
  longitude: number;
  services: MockService[];
  staff: MockStaff[];
  openingHours: MockOpeningHour[];
  reviews: MockReview[];
}

export interface MockService {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  isActive: boolean;
  isOnlineBookable: boolean;
}

export interface MockStaff {
  id: string;
  displayName: string;
  title: string | null;
  color: string;
  avatar: string | null;
  isActive: boolean;
}

export interface MockOpeningHour {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface MockReview {
  id: string;
  author: string;
  avatar: string | null;
  overallRating: number;
  comment: string;
  date: string;
  status: string;
}

export const DAYS_FR = [
  "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"
];

const STANDARD_HOURS: MockOpeningHour[] = [
  { dayOfWeek: 0, openTime: "09:00", closeTime: "19:00", isClosed: false },
  { dayOfWeek: 1, openTime: "09:00", closeTime: "19:00", isClosed: false },
  { dayOfWeek: 2, openTime: "09:00", closeTime: "19:00", isClosed: false },
  { dayOfWeek: 3, openTime: "09:00", closeTime: "19:00", isClosed: false },
  { dayOfWeek: 4, openTime: "09:00", closeTime: "19:00", isClosed: false },
  { dayOfWeek: 5, openTime: "09:00", closeTime: "20:00", isClosed: false },
  { dayOfWeek: 6, openTime: "00:00", closeTime: "00:00", isClosed: true },
];

const SPA_HOURS: MockOpeningHour[] = [
  { dayOfWeek: 0, openTime: "10:00", closeTime: "21:00", isClosed: false },
  { dayOfWeek: 1, openTime: "10:00", closeTime: "21:00", isClosed: false },
  { dayOfWeek: 2, openTime: "10:00", closeTime: "21:00", isClosed: false },
  { dayOfWeek: 3, openTime: "10:00", closeTime: "21:00", isClosed: false },
  { dayOfWeek: 4, openTime: "10:00", closeTime: "21:00", isClosed: false },
  { dayOfWeek: 5, openTime: "09:00", closeTime: "22:00", isClosed: false },
  { dayOfWeek: 6, openTime: "10:00", closeTime: "18:00", isClosed: false },
];

export const MOCK_SALONS: MockSalon[] = [
  // ===== CASABLANCA =====
  {
    id: "salon-1",
    name: "Salon Élégance",
    slug: "salon-elegance-casablanca",
    category: "COIFFEUR",
    description: "Salon de coiffure haut de gamme au cœur de Casablanca. Notre équipe de professionnels vous accueille dans un cadre chaleureux et moderne pour sublimer votre beauté. Spécialistes des techniques les plus récentes : balayage, mèches ombrées, lissage brésilien.",
    city: "Casablanca",
    address: "123 Boulevard Mohammed V",
    phone: "+212 522 123 456",
    email: "contact@salon-elegance.ma",
    coverImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=800&fit=crop",
    photos: [{"id": "se-1", "url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a157?w=800&h=600&fit=crop", "alt": "Intérieur salon", "order": 0}, {"id": "se-2", "url": "https://images.unsplash.com/photo-1634449571010-02ee6e8f02b6?w=800&h=600&fit=crop", "alt": "Station de travail", "order": 1}, {"id": "se-3", "url": "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=600&fit=crop", "alt": "Salle de soin", "order": 2}],
    isActive: true,
    isVerified: true,
    averageRating: 4.8,
    reviewCount: 124,
    latitude: 33.5731,
    longitude: -7.5898,
    services: [
      { id: "s1-1", name: "Coupe femme", description: "Coupe et coiffure personnalisée", price: 150, duration: 45, isActive: true, isOnlineBookable: true },
      { id: "s1-2", name: "Coloration", description: "Coloration complète ou mèches", price: 300, duration: 90, isActive: true, isOnlineBookable: true },
      { id: "s1-3", name: "Brushing", description: "Brushing et coiffage", price: 100, duration: 30, isActive: true, isOnlineBookable: true },
      { id: "s1-4", name: "Mèches & Balayage", description: "Mèches ombrées et balayage soleil", price: 450, duration: 120, isActive: true, isOnlineBookable: true },
      { id: "s1-5", name: "Soin capillaire", description: "Soin profond kératine", price: 200, duration: 60, isActive: true, isOnlineBookable: true },
      { id: "s1-6", name: "Lissage brésilien", description: "Lissage longue durée", price: 800, duration: 180, isActive: true, isOnlineBookable: true },
    ],
    staff: [
      { id: "st1-1", displayName: "Sara M.", title: "Coiffeuse senior", color: "#3B82F6", avatar: null, isActive: true },
      { id: "st1-2", displayName: "Karim B.", title: "Coloriste", color: "#10B981", avatar: null, isActive: true },
      { id: "st1-3", displayName: "Nadia L.", title: "Coiffeuse", color: "#8B5CF6", avatar: null, isActive: true },
    ],
    openingHours: STANDARD_HOURS,
    reviews: [
      { id: "r1-1", author: "Fatima Z.", avatar: null, overallRating: 5, comment: "Excellent service ! Sara est une vraie professionnelle. Je recommande vivement le balayage.", date: "Il y a 2 jours", status: "APPROVED" },
      { id: "r1-2", author: "Ahmed K.", avatar: null, overallRating: 4, comment: "Très bon salon, je recommande. Un peu d'attente le samedi.", date: "Il y a 1 semaine", status: "APPROVED" },
      { id: "r1-3", author: "Leïla R.", avatar: null, overallRating: 5, comment: "Ma coloration est parfaite, merci Karim !", date: "Il y a 2 semaines", status: "APPROVED" },
    ],
  },
  {
    id: "salon-2",
    name: "Barber House",
    slug: "barber-house-rabat",
    category: "BARBIER",
    description: "Barbier professionnel à Rabat. Coupes modernes et classiques, taille de barbe, rasage traditionnel. Ambiance masculine et services de qualité dans un cadre raffiné.",
    city: "Rabat",
    address: "45 Rue Hassan II",
    phone: "+212 537 789 012",
    email: "contact@barber-house.ma",
    coverImage: "https://images.unsplash.com/photo-1503951914875-452162b0fe14?w=1200&h=800&fit=crop",
    photos: [{"id": "bh-1", "url": "https://images.unsplash.com/photo-1503951914875-452162b0fe14?w=800&h=600&fit=crop", "alt": "Barbier", "order": 0}, {"id": "bh-2", "url": "https://images.unsplash.com/photo-1585747860013-005058014110?w=800&h=600&fit=crop", "alt": "Intérieur", "order": 1}],
    isActive: true,
    isVerified: true,
    averageRating: 4.9,
    reviewCount: 89,
    latitude: 34.0209,
    longitude: -6.8417,
    services: [
      { id: "s2-1", name: "Coupe homme", description: "Coupe classique ou moderne", price: 80, duration: 30, isActive: true, isOnlineBookable: true },
      { id: "s2-2", name: "Barbe & Moustache", description: "Taille et soin de la barbe", price: 50, duration: 20, isActive: true, isOnlineBookable: true },
      { id: "s2-3", name: "Rasage traditionnel", description: "Rasage au coupe-chaux", price: 60, duration: 30, isActive: true, isOnlineBookable: true },
      { id: "s2-4", name: "Coupe + Barbe", description: "Forfait coupe et barbe", price: 120, duration: 50, isActive: true, isOnlineBookable: true },
    ],
    staff: [
      { id: "st2-1", displayName: "Karim B.", title: "Barbier senior", color: "#F59E0B", avatar: null, isActive: true },
      { id: "st2-2", displayName: "Youssef M.", title: "Barbier", color: "#EF4444", avatar: null, isActive: true },
    ],
    openingHours: STANDARD_HOURS,
    reviews: [
      { id: "r2-1", author: "Mehdi T.", avatar: null, overallRating: 5, comment: "Le meilleur barbier de Rabat ! Coupe nickel et accueil au top.", date: "Il y a 3 jours", status: "APPROVED" },
      { id: "r2-2", author: "Omar S.", avatar: null, overallRating: 5, comment: "Rasage traditionnel impeccable. Je reviens toutes les semaines.", date: "Il y a 1 semaine", status: "APPROVED" },
    ],
  },
  {
    id: "salon-3",
    name: "Spa Zénith",
    slug: "spa-zenith-marrakech",
    category: "SPA",
    description: "Spa et hammam de luxe à Marrakech. Détente absolue dans un cadre oriental authentique. Soins du corps, massages rituels, et rituels de beauté dans une oasis de sérénité.",
    city: "Marrakech",
    address: "78 Avenue Moulay Ismail",
    phone: "+212 524 456 789",
    email: "reservations@spa-zenith.ma",
    coverImage: "https://images.unsplash.com/photo-1544161515-1585e22f81fc?w=1200&h=800&fit=crop",
    photos: [{"id": "sz-1", "url": "https://images.unsplash.com/photo-1544161515-1585e22f81fc?w=800&h=600&fit=crop", "alt": "Spa", "order": 0}, {"id": "sz-2", "url": "https://images.unsplash.com/photo-1600334089692-13b28cad0998?w=800&h=600&fit=crop", "alt": "Massage", "order": 1}],
    isActive: true,
    isVerified: true,
    averageRating: 4.7,
    reviewCount: 201,
    latitude: 31.6295,
    longitude: -7.9811,
    services: [
      { id: "s3-1", name: "Hammam traditionnel", description: "Hammam complet avec gommage et savon noir", price: 200, duration: 60, isActive: true, isOnlineBookable: true },
      { id: "s3-2", name: "Massage relaxant", description: "Massage aux huiles essentielles", price: 350, duration: 60, isActive: true, isOnlineBookable: true },
      { id: "s3-3", name: "Soin du visage", description: "Soin visage hydratant et éclat", price: 250, duration: 45, isActive: true, isOnlineBookable: true },
      { id: "s3-4", name: "Enveloppement argile", description: "Enveloppement au rhassoul et argile", price: 280, duration: 45, isActive: true, isOnlineBookable: true },
      { id: "s3-5", name: "Forfait détente", description: "Hammam + massage + thé à la menthe", price: 550, duration: 120, isActive: true, isOnlineBookable: true },
    ],
    staff: [
      { id: "st3-1", displayName: "Amina K.", title: "Spécialiste hammam", color: "#EC4899", avatar: null, isActive: true },
      { id: "st3-2", displayName: "Rachid T.", title: "Masseur certifié", color: "#14B8A6", avatar: null, isActive: true },
      { id: "st3-3", displayName: "Halima S.", title: "Esthéticienne", color: "#F97316", avatar: null, isActive: true },
    ],
    openingHours: SPA_HOURS,
    reviews: [
      { id: "r3-1", author: "Sophie D.", avatar: null, overallRating: 5, comment: "Un havre de paix à Marrakech. Le forfait détente vaut chaque dirham.", date: "Il y a 5 jours", status: "APPROVED" },
      { id: "r3-2", author: "Mohammed A.", avatar: null, overallRating: 4, comment: "Excellent hammam, personnel très professionnel. Un peu cher mais la qualité est au rendez-vous.", date: "Il y a 2 semaines", status: "APPROVED" },
    ],
  },
  {
    id: "salon-4",
    name: "Beauty Lounge",
    slug: "beauty-lounge-tanger",
    category: "INSTITUT_BEAUTE",
    description: "Institut de beauté complet à Tanger. Manucure, pédicure, maquillage, soins du visage et épilation. Un lieu élégant où beauté rime avec bien-être.",
    city: "Tanger",
    address: "12 Rue Ibn Battouta",
    phone: "+212 539 234 567",
    email: "info@beauty-lounge.ma",
    coverImage: "https://images.unsplash.com/photo-1519014816541-b57beca5a1f8?w=1200&h=800&fit=crop",
    photos: [{"id": "bl-1", "url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a157?w=800&h=600&fit=crop", "alt": "Beauté", "order": 0}],
    isActive: true,
    isVerified: true,
    averageRating: 4.6,
    reviewCount: 156,
    latitude: 35.7595,
    longitude: -5.8340,
    services: [
      { id: "s4-1", name: "Manucure classique", description: "Soin des mains et vernis", price: 120, duration: 45, isActive: true, isOnlineBookable: true },
      { id: "s4-2", name: "Pédicure soin", description: "Soin complet des pieds", price: 150, duration: 50, isActive: true, isOnlineBookable: true },
      { id: "s4-3", name: "Maquillage soirée", description: "Maquillage professionnel pour événements", price: 300, duration: 60, isActive: true, isOnlineBookable: true },
      { id: "s4-4", name: "Épilation jambes", description: "Épilation complète jambes", price: 200, duration: 40, isActive: true, isOnlineBookable: true },
      { id: "s4-5", name: "Soin visage éclat", description: "Nettoyage de peau et hydratation", price: 250, duration: 60, isActive: true, isOnlineBookable: true },
    ],
    staff: [
      { id: "st4-1", displayName: "Imane F.", title: "Esthéticienne senior", color: "#A855F7", avatar: null, isActive: true },
      { id: "st4-2", displayName: "Salma B.", title: "Manucueur pro", color: "#06B6D4", avatar: null, isActive: true },
    ],
    openingHours: STANDARD_HOURS,
    reviews: [
      { id: "r4-1", author: "Nadia H.", avatar: null, overallRating: 5, comment: "Ma manucure est toujours parfaite ici. Imane est une artiste !", date: "Il y a 1 jour", status: "APPROVED" },
      { id: "r4-2", author: "Khadija M.", avatar: null, overallRating: 4, comment: "Bon institut mais parfois bondé le weekend.", date: "Il y a 1 semaine", status: "APPROVED" },
    ],
  },

  // ===== FÈS =====
  {
    id: "salon-5",
    name: "Coiffure Fatima Zahra",
    slug: "coiffure-fatima-zahra-fes",
    category: "COIFFEUR",
    description: "Salon de coiffure pour femmes au cœur de la médina de Fès. Spécialiste des coupes modernes et des coiffures traditionnelles marocaines pour mariages et événements.",
    city: "Fès",
    address: "23 Derb El Miter, Médina",
    phone: "+212 535 678 901",
    email: "contact@coiffure-fz.ma",
    coverImage: "https://images.unsplash.com/photo-1634449571010-02ee6e8f02b6?w=1200&h=800&fit=crop",
    photos: [{"id": "cf-1", "url": "https://images.unsplash.com/photo-1634449571010-02ee6e8f02b6?w=800&h=600&fit=crop", "alt": "Coiffure", "order": 0}, {"id": "cf-2", "url": "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop", "alt": "Salon", "order": 1}],
    isActive: true,
    isVerified: true,
    averageRating: 4.5,
    reviewCount: 67,
    latitude: 34.0331,
    longitude: -5.0003,
    services: [
      { id: "s5-1", name: "Coupe femme", description: "Coupe tendance personnalisée", price: 100, duration: 40, isActive: true, isOnlineBookable: true },
      { id: "s5-2", name: "Coiffure événement", description: "Coiffure pour mariage ou fête", price: 500, duration: 120, isActive: true, isOnlineBookable: true },
      { id: "s5-3", name: "Mèches & Balayage", description: "Éclaircissement et effets soleil", price: 350, duration: 90, isActive: true, isOnlineBookable: true },
      { id: "s5-4", name: "Soin kératine", description: "Lissage et soin kératine", price: 600, duration: 150, isActive: true, isOnlineBookable: true },
    ],
    staff: [
      { id: "st5-1", displayName: "Fatima Z.", title: "Coiffeuse & Propriétaire", color: "#D946EF", avatar: null, isActive: true },
      { id: "st5-2", displayName: "Hassna O.", title: "Coiffeuse", color: "#22D3EE", avatar: null, isActive: true },
    ],
    openingHours: STANDARD_HOURS,
    reviews: [
      { id: "r5-1", author: "Meriem L.", avatar: null, overallRating: 5, comment: "Fatima m'a fait une coiffure de mariage magnifique !", date: "Il y a 3 jours", status: "APPROVED" },
    ],
  },

  // ===== AGADIR =====
  {
    id: "salon-6",
    name: "Océane Spa & Beauté",
    slug: "oceane-spa-beaute-agadir",
    category: "SPA",
    description: "Spa et institut de beauté face à la mer à Agadir. Massages, soins du corps et du visage dans une ambiance océane et relaxante. Idéal après une journée à la plage.",
    city: "Agadir",
    address: "56 Boulevard de la Corniche",
    phone: "+212 528 345 678",
    email: "reservation@oceane-spa.ma",
    coverImage: "https://images.unsplash.com/photo-1600948836781-67e5895f5512?w=1200&h=800&fit=crop",
    photos: [{"id": "os-1", "url": "https://images.unsplash.com/photo-1600948836781-67e5895f5512?w=800&h=600&fit=crop", "alt": "Spa mer", "order": 0}, {"id": "os-2", "url": "https://images.unsplash.com/photo-1545579134-6a9c6e7e4f2d?w=800&h=600&fit=crop", "alt": "Soins", "order": 1}],
    isActive: true,
    isVerified: true,
    averageRating: 4.9,
    reviewCount: 143,
    latitude: 30.4278,
    longitude: -9.5981,
    services: [
      { id: "s6-1", name: "Massage balnéaire", description: "Massage aux coquillages chauffés", price: 400, duration: 60, isActive: true, isOnlineBookable: true },
      { id: "s6-2", name: "Hammam & gommage", description: "Hammam rituel avec gommage au savon noir", price: 250, duration: 60, isActive: true, isOnlineBookable: true },
      { id: "s6-3", name: "Soin hydratant corps", description: "Enveloppement algues et hydratation", price: 300, duration: 50, isActive: true, isOnlineBookable: true },
      { id: "s6-4", name: "Forfait mer & détente", description: "Hammam + massage + soin visage", price: 700, duration: 150, isActive: true, isOnlineBookable: true },
    ],
    staff: [
      { id: "st6-1", displayName: "Khadija R.", title: "Directrice spa", color: "#0EA5E9", avatar: null, isActive: true },
      { id: "st6-2", displayName: "Sara A.", title: "Masseuse", color: "#84CC16", avatar: null, isActive: true },
    ],
    openingHours: SPA_HOURS,
    reviews: [
      { id: "r6-1", author: "Claire B.", avatar: null, overallRating: 5, comment: "L'expérience forfait mer & détente est incroyable. Vue sur l'océan, service impeccable.", date: "Il y a 4 jours", status: "APPROVED" },
      { id: "r6-2", author: "Ahmed M.", avatar: null, overallRating: 5, comment: "Meilleur spa d'Agadir, sans hésitation.", date: "Il y a 2 semaines", status: "APPROVED" },
    ],
  },

  // ===== CASABLANCA =====
  {
    id: "salon-7",
    name: "Nail Palace",
    slug: "nail-palace-casablanca",
    category: "ONGLES",
    description: "Studio de manucure et pédicure chic à Casablanca. Pose de vernis, gel, résine, nail art. Des ongles impeccables à chaque visite dans notre espace dédié et lumineux.",
    city: "Casablanca",
    address: "87 Rue Allal Ben Abdellah",
    phone: "+212 522 567 890",
    email: "hello@nail-palace.ma",
    coverImage: "https://images.unsplash.com/photo-1621605815971-fbc982cf8b8a?w=1200&h=800&fit=crop",
    photos: [{"id": "np-1", "url": "https://images.unsplash.com/photo-1621605815971-fbc982cf8b8a?w=800&h=600&fit=crop", "alt": "Onglerie", "order": 0}],
    isActive: true,
    isVerified: true,
    averageRating: 4.4,
    reviewCount: 92,
    latitude: 33.5883,
    longitude: -7.6114,
    services: [
      { id: "s7-1", name: "Manucure gel", description: "Pose complète gel sur ongles naturels", price: 180, duration: 60, isActive: true, isOnlineBookable: true },
      { id: "s7-2", name: "Pédicure soin", description: "Soin complet des pieds + vernis", price: 200, duration: 60, isActive: true, isOnlineBookable: true },
      { id: "s7-3", name: "Nail art", description: "Décoration créative sur ongles", price: 120, duration: 45, isActive: true, isOnlineBookable: true },
      { id: "s7-4", name: "Résine remplissage", description: "Remplissage résine", price: 150, duration: 45, isActive: true, isOnlineBookable: true },
    ],
    staff: [
      { id: "st7-1", displayName: "Yasmine K.", title: "Nail artiste", color: "#F43F5E", avatar: null, isActive: true },
      { id: "st7-2", displayName: "Houda M.", title: "Prothésiste ongulaire", color: "#8B5CF6", avatar: null, isActive: true },
    ],
    openingHours: STANDARD_HOURS,
    reviews: [
      { id: "r7-1", author: "Rajaa N.", avatar: null, overallRating: 5, comment: "Yasmine fait des nail arts magnifiques !", date: "Il y a 1 semaine", status: "APPROVED" },
    ],
  },

  // ===== RABAT =====
  {
    id: "salon-8",
    name: "Maison de Beauté Aisha",
    slug: "maison-beaute-aisha-rabat",
    category: "MAQUILLAGE",
    description: "Institut de beauté spécialisé en maquillage professionnel et soins esthétiques à Rabat. Makeup événementiel, fiançailles, mariage, et cours de maquillage personnalisés.",
    city: "Rabat",
    address: "34 Avenue des FAR",
    phone: "+212 537 456 123",
    email: "contact@maison-beaute-aisha.ma",
    coverImage: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=1200&h=800&fit=crop",
    photos: [{"id": "mba-1", "url": "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=600&fit=crop", "alt": "Institut", "order": 0}],
    isActive: true,
    isVerified: true,
    averageRating: 4.6,
    reviewCount: 73,
    latitude: 34.0181,
    longitude: -6.8365,
    services: [
      { id: "s8-1", name: "Maquillage soirée", description: "Maquillage complet pour événement", price: 350, duration: 60, isActive: true, isOnlineBookable: true },
      { id: "s8-2", name: "Maquillage mariage", description: "Essai + maquillage jour J", price: 1200, duration: 90, isActive: true, isOnlineBookable: true },
      { id: "s8-3", name: "Cours maquillage", description: "Cours individuel de 2h", price: 400, duration: 120, isActive: true, isOnlineBookable: true },
      { id: "s8-4", name: "Soin visage deluxe", description: "Nettoyage de peau complet", price: 280, duration: 60, isActive: true, isOnlineBookable: true },
    ],
    staff: [
      { id: "st8-1", displayName: "Aisha B.", title: "Maquilleuse professionnelle", color: "#D946EF", avatar: null, isActive: true },
    ],
    openingHours: STANDARD_HOURS,
    reviews: [
      { id: "r8-1", author: "Lina E.", avatar: null, overallRating: 5, comment: "Aisha est une vraie artiste ! Maquillage de mariage parfait.", date: "Il y a 3 jours", status: "APPROVED" },
    ],
  },

  // ===== MARRAKECH =====
  {
    id: "salon-9",
    name: "Epil Club Marrakech",
    slug: "epil-club-marrakech",
    category: "EPILATION",
    description: "Centre d'épilation professionnel à Marrakech. Épilation au fil, cire chaude et froide, laser. Techniques modernes pour une peau lisse et douce dans un cadre hygiénique.",
    city: "Marrakech",
    address: "15 Rue Moulay Ismail, Guéliz",
    phone: "+212 524 678 901",
    email: "info@epil-club.ma",
    coverImage: "https://images.unsplash.com/photo-1570172619644-d678313819e7?w=1200&h=800&fit=crop",
    photos: [{"id": "ec-1", "url": "https://images.unsplash.com/photo-1570172619644-d678313819e7?w=800&h=600&fit=crop", "alt": "Cabine", "order": 0}],
    isActive: true,
    isVerified: true,
    averageRating: 4.3,
    reviewCount: 58,
    latitude: 31.6314,
    longitude: -8.0084,
    services: [
      { id: "s9-1", name: "Épilation jambes complètes", description: "Cire tiède jambes entières", price: 180, duration: 40, isActive: true, isOnlineBookable: true },
      { id: "s9-2", name: "Épilation maillot", description: "Cire maillot intégral", price: 150, duration: 30, isActive: true, isOnlineBookable: true },
      { id: "s9-3", name: "Épilation visage", description: "Fil ou cire sourcils, lèvres, joues", price: 80, duration: 20, isActive: true, isOnlineBookable: true },
      { id: "s9-4", name: "Épilation aisselles", description: "Cire douce aisselles", price: 60, duration: 15, isActive: true, isOnlineBookable: true },
    ],
    staff: [
      { id: "st9-1", displayName: "Samira K.", title: "Spécialiste épilation", color: "#10B981", avatar: null, isActive: true },
      { id: "st9-2", displayName: "Fatima A.", title: "Esthéticienne", color: "#3B82F6", avatar: null, isActive: true },
    ],
    openingHours: STANDARD_HOURS,
    reviews: [
      { id: "r9-1", author: "Zineb T.", avatar: null, overallRating: 4, comment: "Épilation propre et rapide. Je recommande Samira.", date: "Il y a 1 semaine", status: "APPROVED" },
    ],
  },

  // ===== TANGER =====
  {
    id: "salon-10",
    name: "Massage & Bien-Être Tanger",
    slug: "massage-bien-etre-tanger",
    category: "MASSAGE",
    description: "Cabinet de massage professionnel à Tanger. Massages thérapeutiques, sportifs et de relaxation. Techniques suédoises, thaï et traditionnelles marocaines.",
    city: "Tanger",
    address: "9 Boulevard Pasteur",
    phone: "+212 539 567 890",
    email: "contact@massage-bien-etre.ma",
    coverImage: "https://images.unsplash.com/photo-1600334089692-13b28cad0998?w=1200&h=800&fit=crop",
    photos: [{"id": "mbe-1", "url": "https://images.unsplash.com/photo-1600334089692-13b28cad0998?w=800&h=600&fit=crop", "alt": "Massage", "order": 0}],
    isActive: true,
    isVerified: true,
    averageRating: 4.8,
    reviewCount: 112,
    latitude: 35.7847,
    longitude: -5.8129,
    services: [
      { id: "s10-1", name: "Massage suédois", description: "Massage relaxant profond", price: 300, duration: 60, isActive: true, isOnlineBookable: true },
      { id: "s10-2", name: "Massage thaï", description: "Massage traditionnel thaï", price: 350, duration: 60, isActive: true, isOnlineBookable: true },
      { id: "s10-3", name: "Massage sportif", description: "Récupération musculaire", price: 280, duration: 45, isActive: true, isOnlineBookable: true },
      { id: "s10-4", name: "Massage aux huiles chaudes", description: "Massage oriental aux huiles essentielles", price: 400, duration: 75, isActive: true, isOnlineBookable: true },
    ],
    staff: [
      { id: "st10-1", displayName: "Rachid A.", title: "Masseur diplômé", color: "#F59E0B", avatar: null, isActive: true },
      { id: "st10-2", displayName: "Nadia F.", title: "Praticienne thaï", color: "#EC4899", avatar: null, isActive: true },
    ],
    openingHours: SPA_HOURS,
    reviews: [
      { id: "r10-1", author: "Paul M.", avatar: null, overallRating: 5, comment: "Meilleur massage de ma vie. Rachid a des mains magiques.", date: "Il y a 2 jours", status: "APPROVED" },
      { id: "r10-2", author: "Amina T.", avatar: null, overallRating: 5, comment: "Le massage aux huiles chaudes est une expérience unique. Je reviendrai !", date: "Il y a 1 semaine", status: "APPROVED" },
    ],
  },

  // ===== CASABLANCA BARBIER =====
  {
    id: "salon-11",
    name: "Le Gentleman Barber",
    slug: "le-gentleman-barber-casablanca",
    category: "BARBIER",
    description: "Barbier premium au cœur du Maarif, Casablanca. Coupe tendance, taille de barbe experte et rasage traditionnel dans un élégant setting vintage.",
    city: "Casablanca",
    address: "202 Boulevard Moulay Rachid, Maarif",
    phone: "+212 522 890 123",
    email: "booking@le-gentleman.ma",
    coverImage: "https://images.unsplash.com/photo-1585747860013-005058014110?w=1200&h=800&fit=crop",
    photos: [{"id": "gb-1", "url": "https://images.unsplash.com/photo-1585747860013-005058014110?w=800&h=600&fit=crop", "alt": "Barbier", "order": 0}, {"id": "gb-2", "url": "https://images.unsplash.com/photo-1503951914875-452162b0fe14?w=800&h=600&fit=crop", "alt": "Fauteuil", "order": 1}],
    isActive: true,
    isVerified: true,
    averageRating: 4.7,
    reviewCount: 134,
    latitude: 33.5831,
    longitude: -7.6338,
    services: [
      { id: "s11-1", name: "Coupe signature", description: "Coupe + lavage + coiffage", price: 100, duration: 35, isActive: true, isOnlineBookable: true },
      { id: "s11-2", name: "Barbe taillée", description: "Taille et sculpt barbe", price: 60, duration: 20, isActive: true, isOnlineBookable: true },
      { id: "s11-3", name: "Rasage royal", description: "Rasage coupe-chaux + serviette chaude", price: 80, duration: 30, isActive: true, isOnlineBookable: true },
      { id: "s11-4", name: "Forfait complet", description: "Coupe + barbe + rasage", price: 180, duration: 60, isActive: true, isOnlineBookable: true },
    ],
    staff: [
      { id: "st11-1", displayName: "Mehdi A.", title: "Master barber", color: "#1D4ED8", avatar: null, isActive: true },
      { id: "st11-2", displayName: "Oussama K.", title: "Barbier", color: "#DC2626", avatar: null, isActive: true },
    ],
    openingHours: [
      { dayOfWeek: 0, openTime: "09:00", closeTime: "20:00", isClosed: false },
      { dayOfWeek: 1, openTime: "09:00", closeTime: "20:00", isClosed: false },
      { dayOfWeek: 2, openTime: "09:00", closeTime: "20:00", isClosed: false },
      { dayOfWeek: 3, openTime: "09:00", closeTime: "20:00", isClosed: false },
      { dayOfWeek: 4, openTime: "09:00", closeTime: "20:00", isClosed: false },
      { dayOfWeek: 5, openTime: "09:00", closeTime: "21:00", isClosed: false },
      { dayOfWeek: 6, openTime: "00:00", closeTime: "00:00", isClosed: true },
    ],
    reviews: [
      { id: "r11-1", author: "Youssef B.", avatar: null, overallRating: 5, comment: "Le forfait complet est top. Ambiance vintage géniale et coupe parfaite.", date: "Il y a 1 jour", status: "APPROVED" },
      { id: "r11-2", author: "Reda M.", avatar: null, overallRating: 4, comment: "Bon barbier, un peu cher mais la qualité est là.", date: "Il y a 3 semaines", status: "APPROVED" },
    ],
  },

  // ===== FÈS INSTITUT =====
  {
    id: "salon-12",
    name: "L'Institut Royal",
    slug: "institut-royal-fes",
    category: "INSTITUT_BEAUTE",
    description: "Institut de beauté haut de gamme à Fès. Soins du visage, du corps, épilation et maquillage dans un cadre raffiné au cœur de la ville impériale.",
    city: "Fès",
    address: "45 Avenue Hassan II, Ville Nouvelle",
    phone: "+212 535 789 012",
    email: "contact@institut-royal.ma",
    coverImage: "https://images.unsplash.com/photo-1595476108010-76e8b5b042d2?w=1200&h=800&fit=crop",
    photos: [{"id": "ir-1", "url": "https://images.unsplash.com/photo-1595476108010-76e8b5b042d2?w=800&h=600&fit=crop", "alt": "Institut", "order": 0}],
    isActive: true,
    isVerified: true,
    averageRating: 4.5,
    reviewCount: 88,
    latitude: 34.0436,
    longitude: -5.0027,
    services: [
      { id: "s12-1", name: "Soin visage anti-âge", description: "Soin liftant et hydratant", price: 350, duration: 60, isActive: true, isOnlineBookable: true },
      { id: "s12-2", name: "Épilation complète", description: "Épilation jambes + maillot + aisselles", price: 300, duration: 60, isActive: true, isOnlineBookable: true },
      { id: "s12-3", name: "Maquillage professionnelle", description: "Maquillage événement ou soirée", price: 250, duration: 45, isActive: true, isOnlineBookable: true },
      { id: "s12-4", name: "Manucure + Pédicure", description: "Soin complet mains et pieds", price: 220, duration: 60, isActive: true, isOnlineBookable: true },
    ],
    staff: [
      { id: "st12-1", displayName: "Latifa M.", title: "Esthéticienne diplômée", color: "#7C3AED", avatar: null, isActive: true },
      { id: "st12-2", displayName: "Soukaina R.", title: "Maquilleuse", color: "#F59E0B", avatar: null, isActive: true },
    ],
    openingHours: STANDARD_HOURS,
    reviews: [
      { id: "r12-1", author: "Khadija A.", avatar: null, overallRating: 5, comment: "L'institut le plus propre de Fès. Latifa est très douée.", date: "Il y a 5 jours", status: "APPROVED" },
    ],
  },
];

/**
 * Helper to find a salon by slug
 */
export function getMockSalon(slug: string): MockSalon | undefined {
  return MOCK_SALONS.find((s) => s.slug === slug);
}

/**
 * Check if a salon is currently open based on its opening hours.
 */
export function isSalonCurrentlyOpen(hours: MockOpeningHour[]): boolean {
  const now = new Date();
  const jsDay = now.getDay(); // 0=Sunday
  const schemaDay = (jsDay + 6) % 7; // Convert to 0=Monday for schema
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const todayHours = hours.find((h) => h.dayOfWeek === schemaDay);
  if (!todayHours || todayHours.isClosed) return false;
  return currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime;
}

/**
 * Helper to search/filter salons
 */
export function searchMockSalons(params: {
  query?: string;
  city?: string;
  category?: string;
  minRating?: number;
  minPrice?: number;
  maxPrice?: number;
  isVerified?: boolean;
  isOpen?: boolean;
  sortBy?: string;
  page?: number;
  limit?: number;
}) {
  const {
    query = "",
    city = "",
    category = "",
    minRating = 0,
    minPrice = 0,
    maxPrice = 0,
    isVerified = false,
    isOpen = false,
    sortBy = "relevance",
    page = 1,
    limit = 20,
  } = params;

  let results = [...MOCK_SALONS];

  if (city) {
    const normalizeCity = (c: string) => c.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normalizedCity = normalizeCity(city);
    results = results.filter((s) => normalizeCity(s.city) === normalizedCity);
  }

  if (category) {
    const cats = category
      .split(",")
      .map((c) => c.toUpperCase().replace(/-/g, "_").trim())
      .filter(Boolean);
    results = results.filter((s) => cats.includes(s.category));
  }

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q)
    );
  }

  if (minRating > 0) {
    results = results.filter((s) => s.averageRating >= minRating);
  }

  if (isVerified) {
    results = results.filter((s) => s.isVerified);
  }

  if (minPrice > 0 || maxPrice > 0) {
    results = results.filter((s) => {
      const activeServices = s.services.filter((svc) => svc.isActive);
      return activeServices.some((svc) => {
        if (minPrice > 0 && maxPrice > 0) {
          return svc.price >= minPrice && svc.price <= maxPrice;
        } else if (minPrice > 0) {
          return svc.price >= minPrice;
        } else if (maxPrice > 0) {
          return svc.price <= maxPrice;
        }
        return true;
      });
    });
  }

  if (isOpen) {
    results = results.filter((s) => isSalonCurrentlyOpen(s.openingHours));
  }

  switch (sortBy) {
    case "rating":
      results.sort((a, b) => b.averageRating - a.averageRating);
      break;
    case "reviews":
      results.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
    case "name":
      results.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "price_asc":
      results.sort((a, b) => {
        const aMin = Math.min(...a.services.filter(s => s.isOnlineBookable).map(s => s.price));
        const bMin = Math.min(...b.services.filter(s => s.isOnlineBookable).map(s => s.price));
        return (aMin || 0) - (bMin || 0);
      });
      break;
    case "price_desc":
      results.sort((a, b) => {
        const aMin = Math.min(...a.services.filter(s => s.isOnlineBookable).map(s => s.price));
        const bMin = Math.min(...b.services.filter(s => s.isOnlineBookable).map(s => s.price));
        return (bMin || 0) - (aMin || 0);
      });
      break;
    default:
      results.sort((a, b) => b.reviewCount - a.reviewCount);
  }

  const total = results.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const paginated = results.slice(start, start + limit);

  return { salons: paginated, total, page, totalPages };
}