import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding 12 Moroccan salons...");

  // Clean existing data (order matters for FK constraints)
  await prisma.bookingItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.staffService.deleteMany();
  await prisma.staffSchedule.deleteMany();
  await prisma.staffMember.deleteMany();
  await prisma.service.deleteMany();
  await prisma.openingHours.deleteMany();
  await prisma.salon.deleteMany();
  await prisma.user.deleteMany({ where: { role: { in: ["PRO_OWNER", "CONSUMER"] } } });

  const passwordHash = "$2a$12$LKxHBD8ruXIBvUEO8r2YLu1xDE4i0zMaED3wsZJqx2PrLE6VLyOfG2e"; // password123

  // Create pro owners
  const owners: Record<string, string> = {};
  
  owners["sara"] = (await prisma.user.create({
    data: { email: "sara@salon-elegance.ma", name: "Sara Mansouri", passwordHash, role: "PRO_OWNER", phone: "+212 661 123 456" },
  })).id;
  
  owners["karim"] = (await prisma.user.create({
    data: { email: "karim@barber-house.ma", name: "Karim Bennani", passwordHash, role: "PRO_OWNER", phone: "+212 662 789 012" },
  })).id;

  owners["amina"] = (await prisma.user.create({
    data: { email: "amina@spa-zenith.ma", name: "Amina Khalidi", passwordHash, role: "PRO_OWNER", phone: "+212 663 345 678" },
  })).id;

  owners["imane"] = (await prisma.user.create({
    data: { email: "imane@beauty-lounge.ma", name: "Imane Fassi", passwordHash, role: "PRO_OWNER", phone: "+212 664 901 234" },
  })).id;

  owners["fatima_fz"] = (await prisma.user.create({
    data: { email: "fatima@coiffure-fz.ma", name: "Fatima Zahra Benali", passwordHash, role: "PRO_OWNER", phone: "+212 665 234 567" },
  })).id;

  owners["khadija_sp"] = (await prisma.user.create({
    data: { email: "khadija@oceanе-spa.ma", name: "Khadija Rahmouni", passwordHash, role: "PRO_OWNER", phone: "+212 666 567 890" },
  })).id;

  owners["yasmine"] = (await prisma.user.create({
    data: { email: "yasmine@nail-palace.ma", name: "Yasmine Kabbaj", passwordHash, role: "PRO_OWNER", phone: "+212 667 890 123" },
  })).id;

  owners["aisha"] = (await prisma.user.create({
    data: { email: "aisha@maison-beaute.ma", name: "Aisha Benmoussa", passwordHash, role: "PRO_OWNER", phone: "+212 668 123 456" },
  })).id;

  owners["samira"] = (await prisma.user.create({
    data: { email: "samira@epil-club.ma", name: "Samira Khalil", passwordHash, role: "PRO_OWNER", phone: "+212 669 456 789" },
  })).id;

  owners["rachid"] = (await prisma.user.create({
    data: { email: "rachid@massage-bien-etre.ma", name: "Rachid Alaoui", passwordHash, role: "PRO_OWNER", phone: "+212 670 789 012" },
  })).id;

  owners["mehdi"] = (await prisma.user.create({
    data: { email: "mehdi@le-gentleman.ma", name: "Mehdi Amrani", passwordHash, role: "PRO_OWNER", phone: "+212 671 234 567" },
  })).id;

  owners["latifa"] = (await prisma.user.create({
    data: { email: "latifa@institut-royal.ma", name: "Latifa Mansouri", passwordHash, role: "PRO_OWNER", phone: "+212 672 567 890" },
  })).id;

  // Create salons
  const salons = [
    {
      name: "Salon Élégance", slug: "salon-elegance-casablanca", category: "COIFFEUR" as const,
      address: "123 Boulevard Mohammed V", city: "Casablanca", phone: "+212 522 123 456",
      email: "contact@salon-elegance.ma", description: "Salon de coiffure haut de gamme au cœur de Casablanca. Notre équipe de professionnels vous accueille dans un cadre chaleureux et moderne pour sublimer votre beauté.",
      averageRating: 4.8, reviewCount: 124, latitude: 33.5731, longitude: -7.5898,
      ownerId: owners["sara"],
    },
    {
      name: "Barber House", slug: "barber-house-rabat", category: "BARBIER" as const,
      address: "45 Rue Hassan II", city: "Rabat", phone: "+212 537 789 012",
      email: "contact@barber-house.ma", description: "Barbier professionnel à Rabat. Coupes modernes et classiques, taille de barbe, rasage traditionnel.",
      averageRating: 4.9, reviewCount: 89, latitude: 34.0209, longitude: -6.8417,
      ownerId: owners["karim"],
    },
    {
      name: "Spa Zénith", slug: "spa-zenith-marrakech", category: "SPA" as const,
      address: "78 Avenue Moulay Ismail", city: "Marrakech", phone: "+212 524 456 789",
      email: "reservations@spa-zenith.ma", description: "Spa et hammam de luxe à Marrakech. Détente absolue dans un cadre oriental authentique.",
      averageRating: 4.7, reviewCount: 201, latitude: 31.6295, longitude: -7.9811,
      ownerId: owners["amina"],
    },
    {
      name: "Beauty Lounge", slug: "beauty-lounge-tanger", category: "INSTITUT_BEAUTE" as const,
      address: "12 Rue Ibn Battouta", city: "Tanger", phone: "+212 539 234 567",
      email: "info@beauty-lounge.ma", description: "Institut de beauté complet à Tanger. Manucure, pédicure, maquillage, soins du visage et épilation.",
      averageRating: 4.6, reviewCount: 156, latitude: 35.7595, longitude: -5.8340,
      ownerId: owners["imane"],
    },
    {
      name: "Coiffure Fatima Zahra", slug: "coiffure-fatima-zahra-fes", category: "COIFFEUR" as const,
      address: "23 Derb El Miter, Médina", city: "Fès", phone: "+212 535 678 901",
      email: "contact@coiffure-fz.ma", description: "Salon de coiffure pour femmes au cœur de la médina de Fès. Spécialiste des coupes modernes et coiffures traditionnelles marocaines.",
      averageRating: 4.5, reviewCount: 67, latitude: 34.0331, longitude: -5.0003,
      ownerId: owners["fatima_fz"],
    },
    {
      name: "Océane Spa & Beauté", slug: "oceanе-spa-beaute-agadir", category: "SPA" as const,
      address: "56 Boulevard de la Corniche", city: "Agadir", phone: "+212 528 345 678",
      email: "reservation@oceanе-spa.ma", description: "Spa et institut de beauté face à la mer à Agadir. Massages, soins du corps et du visage.",
      averageRating: 4.9, reviewCount: 143, latitude: 30.4278, longitude: -9.5981,
      ownerId: owners["khadija_sp"],
    },
    {
      name: "Nail Palace", slug: "nail-palace-casablanca", category: "ONGLES" as const,
      address: "87 Rue Allal Ben Abdellah", city: "Casablanca", phone: "+212 522 567 890",
      email: "hello@nail-palace.ma", description: "Studio de manucure et pédicure chic à Casablanca. Pose de vernis, gel, résine, nail art.",
      averageRating: 4.4, reviewCount: 92, latitude: 33.5883, longitude: -7.6114,
      ownerId: owners["yasmine"],
    },
    {
      name: "Maison de Beauté Aisha", slug: "maison-beaute-aisha-rabat", category: "MAQUILLAGE" as const,
      address: "34 Avenue des FAR", city: "Rabat", phone: "+212 537 456 123",
      email: "contact@maison-beaute-aisha.ma", description: "Institut de beauté spécialisé en maquillage professionnel et soins esthétiques à Rabat.",
      averageRating: 4.6, reviewCount: 73, latitude: 34.0181, longitude: -6.8365,
      ownerId: owners["aisha"],
    },
    {
      name: "Épil Club Marrakech", slug: "epil-club-marrakech", category: "EPILATION" as const,
      address: "15 Rue Moulay Ismail, Guéliz", city: "Marrakech", phone: "+212 524 678 901",
      email: "info@epil-club.ma", description: "Centre d'épilation professionnel à Marrakech. Épilation au fil, cire chaude et froide, laser.",
      averageRating: 4.3, reviewCount: 58, latitude: 31.6314, longitude: -8.0084,
      ownerId: owners["samira"],
    },
    {
      name: "Massage & Bien-Être Tanger", slug: "massage-bien-etre-tanger", category: "MASSAGE" as const,
      address: "9 Boulevard Pasteur", city: "Tanger", phone: "+212 539 567 890",
      email: "contact@massage-bien-etre.ma", description: "Cabinet de massage professionnel à Tanger. Massages thérapeutiques, sportifs et de relaxation.",
      averageRating: 4.8, reviewCount: 112, latitude: 35.7847, longitude: -5.8129,
      ownerId: owners["rachid"],
    },
    {
      name: "Le Gentleman Barber", slug: "le-gentleman-barber-casablanca", category: "BARBIER" as const,
      address: "202 Boulevard Moulay Rachid, Maarif", city: "Casablanca", phone: "+212 522 890 123",
      email: "booking@le-gentleman.ma", description: "Barbier premium au cœur du Maarif. Coupe tendance, taille de barbe experte et rasage traditionnel.",
      averageRating: 4.7, reviewCount: 134, latitude: 33.5831, longitude: -7.6338,
      ownerId: owners["mehdi"],
    },
    {
      name: "L'Institut Royal", slug: "institut-royal-fes", category: "INSTITUT_BEAUTE" as const,
      address: "45 Avenue Hassan II, Ville Nouvelle", city: "Fès", phone: "+212 535 789 012",
      email: "contact@institut-royal.ma", description: "Institut de beauté haut de gamme à Fès. Soins du visage, du corps, épilation et maquillage.",
      averageRating: 4.5, reviewCount: 88, latitude: 34.0436, longitude: -5.0027,
      ownerId: owners["latifa"],
    },
  ];

  for (const salonData of salons) {
    const salon = await prisma.salon.create({ data: salonData });
    const salonId = salon.id;

    // Create opening hours (Mon-Sat 9-19, Sat 9-20, Sun closed)
    const hours = salonData.category === "SPA"
      ? [
          ...[0,1,2,3,4].map(d => ({ salonId, dayOfWeek: d, openTime: "10:00", closeTime: "21:00", isClosed: false })),
          { salonId, dayOfWeek: 5, openTime: "09:00", closeTime: "22:00", isClosed: false },
          { salonId, dayOfWeek: 6, openTime: "10:00", closeTime: "18:00", isClosed: false },
        ]
      : salonData.slug === "le-gentleman-barber-casablanca"
      ? [
          ...[0,1,2,3,4].map(d => ({ salonId, dayOfWeek: d, openTime: "09:00", closeTime: "20:00", isClosed: false })),
          { salonId, dayOfWeek: 5, openTime: "09:00", closeTime: "21:00", isClosed: false },
          { salonId, dayOfWeek: 6, openTime: "00:00", closeTime: "00:00", isClosed: true },
        ]
      : [
          ...[0,1,2,3,4].map(d => ({ salonId, dayOfWeek: d, openTime: "09:00", closeTime: "19:00", isClosed: false })),
          { salonId, dayOfWeek: 5, openTime: "09:00", closeTime: "20:00", isClosed: false },
          { salonId, dayOfWeek: 6, openTime: "00:00", closeTime: "00:00", isClosed: true },
        ];
    await prisma.openingHours.createMany({ data: hours });

    // Create services
    const servicesData: Record<string, { name: string; price: number; duration: number; description: string }[]> = {
      "salon-elegance-casablanca": [
        { name: "Coupe femme", price: 150, duration: 45, description: "Coupe et coiffure personnalisée" },
        { name: "Coloration", price: 300, duration: 90, description: "Coloration complète ou mèches" },
        { name: "Brushing", price: 100, duration: 30, description: "Brushing et coiffage" },
        { name: "Mèches & Balayage", price: 450, duration: 120, description: "Mèches ombrées et balayage soleil" },
        { name: "Soin capillaire", price: 200, duration: 60, description: "Soin profond kératine" },
        { name: "Lissage brésilien", price: 800, duration: 180, description: "Lissage longue durée" },
      ],
      "barber-house-rabat": [
        { name: "Coupe homme", price: 80, duration: 30, description: "Coupe classique ou moderne" },
        { name: "Barbe & Moustache", price: 50, duration: 20, description: "Taille et soin de la barbe" },
        { name: "Rasage traditionnel", price: 60, duration: 30, description: "Rasage au coupe-chaux" },
        { name: "Coupe + Barbe", price: 120, duration: 50, description: "Forfait coupe et barbe" },
      ],
      "spa-zenith-marrakech": [
        { name: "Hammam traditionnel", price: 200, duration: 60, description: "Hammam complet avec gommage" },
        { name: "Massage relaxant", price: 350, duration: 60, description: "Massage aux huiles essentielles" },
        { name: "Soin du visage", price: 250, duration: 45, description: "Soin visage hydratant" },
        { name: "Enveloppement argile", price: 280, duration: 45, description: "Enveloppement au rhassoul" },
        { name: "Forfait détente", price: 550, duration: 120, description: "Hammam + massage + thé" },
      ],
      "beauty-lounge-tanger": [
        { name: "Manucure classique", price: 120, duration: 45, description: "Soin des mains et vernis" },
        { name: "Pédicure soin", price: 150, duration: 50, description: "Soin complet des pieds" },
        { name: "Maquillage soirée", price: 300, duration: 60, description: "Maquillage professionnel" },
        { name: "Épilation jambes", price: 200, duration: 40, description: "Épilation complète jambes" },
        { name: "Soin visage éclat", price: 250, duration: 60, description: "Nettoyage de peau" },
      ],
      "coiffure-fatima-zahra-fes": [
        { name: "Coupe femme", price: 100, duration: 40, description: "Coupe tendance personnalisée" },
        { name: "Coiffure événement", price: 500, duration: 120, description: "Coiffure pour mariage ou fête" },
        { name: "Mèches & Balayage", price: 350, duration: 90, description: "Éclaircissement et effets soleil" },
        { name: "Soin kératine", price: 600, duration: 150, description: "Lissage et soin kératine" },
      ],
      "oceanе-spa-beaute-agadir": [
        { name: "Massage balnéaire", price: 400, duration: 60, description: "Massage aux coquillages chauffés" },
        { name: "Hammam & gommage", price: 250, duration: 60, description: "Hammam rituel avec gommage" },
        { name: "Soin hydratant corps", price: 300, duration: 50, description: "Enveloppement algues" },
        { name: "Forfait mer & détente", price: 700, duration: 150, description: "Hammam + massage + soin visage" },
      ],
      "nail-palace-casablanca": [
        { name: "Manucure gel", price: 180, duration: 60, description: "Pose complète gel" },
        { name: "Pédicure soin", price: 200, duration: 60, description: "Soin complet des pieds" },
        { name: "Nail art", price: 120, duration: 45, description: "Décoration créative" },
        { name: "Résine remplissage", price: 150, duration: 45, description: "Remplissage résine" },
      ],
      "maison-beaute-aisha-rabat": [
        { name: "Maquillage soirée", price: 350, duration: 60, description: "Maquillage complet événement" },
        { name: "Maquillage mariage", price: 1200, duration: 90, description: "Essai + maquillage jour J" },
        { name: "Cours maquillage", price: 400, duration: 120, description: "Cours individuel de 2h" },
        { name: "Soin visage deluxe", price: 280, duration: 60, description: "Nettoyage de peau complet" },
      ],
      "epil-club-marrakech": [
        { name: "Épilation jambes", price: 180, duration: 40, description: "Cire tiède jambes entières" },
        { name: "Épilation maillot", price: 150, duration: 30, description: "Cire maillot intégral" },
        { name: "Épilation visage", price: 80, duration: 20, description: "Fil ou cire sourcils, lèvres" },
        { name: "Épilation aisselles", price: 60, duration: 15, description: "Cire douce aisselles" },
      ],
      "massage-bien-etre-tanger": [
        { name: "Massage suédois", price: 300, duration: 60, description: "Massage relaxant profond" },
        { name: "Massage thaï", price: 350, duration: 60, description: "Massage traditionnel thaï" },
        { name: "Massage sportif", price: 280, duration: 45, description: "Récupération musculaire" },
        { name: "Massage huiles chaudes", price: 400, duration: 75, description: "Massage oriental aux huiles essentielles" },
      ],
      "le-gentleman-barber-casablanca": [
        { name: "Coupe signature", price: 100, duration: 35, description: "Coupe + lavage + coiffage" },
        { name: "Barbe taillée", price: 60, duration: 20, description: "Taille et sculpt barbe" },
        { name: "Rasage royal", price: 80, duration: 30, description: "Rasage coupe-chaux + serviette chaude" },
        { name: "Forfait complet", price: 180, duration: 60, description: "Coupe + barbe + rasage" },
      ],
      "institut-royal-fes": [
        { name: "Soin visage anti-âge", price: 350, duration: 60, description: "Soin liftant et hydratant" },
        { name: "Épilation complète", price: 300, duration: 60, description: "Jambes + maillot + aisselles" },
        { name: "Maquillage professionnelle", price: 250, duration: 45, description: "Maquillage événement" },
        { name: "Manucure + Pédicure", price: 220, duration: 60, description: "Soin complet mains et pieds" },
      ],
    };

    const svcs = servicesData[salonData.slug] || [];
    const createdServices = [];
    for (const svc of svcs) {
      const s = await prisma.service.create({
        data: { salonId, name: svc.name, price: svc.price, duration: svc.duration, description: svc.description, isActive: true, isOnlineBookable: true },
      });
      createdServices.push(s);
    }

    // Create staff
    const staffData: Record<string, { displayName: string; title: string; color: string }[]> = {
      "salon-elegance-casablanca": [
        { displayName: "Sara M.", title: "Coiffeuse senior", color: "#3B82F6" },
        { displayName: "Karim B.", title: "Coloriste", color: "#10B981" },
        { displayName: "Nadia L.", title: "Coiffeuse", color: "#8B5CF6" },
      ],
      "barber-house-rabat": [
        { displayName: "Karim B.", title: "Barbier senior", color: "#F59E0B" },
        { displayName: "Youssef M.", title: "Barbier", color: "#EF4444" },
      ],
      "spa-zenith-marrakech": [
        { displayName: "Amina K.", title: "Spécialiste hammam", color: "#EC4899" },
        { displayName: "Rachid T.", title: "Masseur certifié", color: "#14B8A6" },
        { displayName: "Halima S.", title: "Esthéticienne", color: "#F97316" },
      ],
      "beauty-lounge-tanger": [
        { displayName: "Imane F.", title: "Esthéticienne senior", color: "#A855F7" },
        { displayName: "Salma B.", title: "Manucieur pro", color: "#06B6D4" },
      ],
      "coiffure-fatima-zahra-fes": [
        { displayName: "Fatima Z.", title: "Coiffeuse & Propriétaire", color: "#D946EF" },
        { displayName: "Hassna O.", title: "Coiffeuse", color: "#22D3EE" },
      ],
      "oceanе-spa-beaute-agadir": [
        { displayName: "Khadija R.", title: "Directrice spa", color: "#0EA5E9" },
        { displayName: "Sara A.", title: "Masseuse", color: "#84CC16" },
      ],
      "nail-palace-casablanca": [
        { displayName: "Yasmine K.", title: "Nail artiste", color: "#F43F5E" },
        { displayName: "Houda M.", title: "Prothésiste ongulaire", color: "#8B5CF6" },
      ],
      "maison-beaute-aisha-rabat": [
        { displayName: "Aisha B.", title: "Maquilleuse professionnelle", color: "#D946EF" },
      ],
      "epil-club-marrakech": [
        { displayName: "Samira K.", title: "Spécialiste épilation", color: "#10B981" },
        { displayName: "Fatima A.", title: "Esthéticienne", color: "#3B82F6" },
      ],
      "massage-bien-etre-tanger": [
        { displayName: "Rachid A.", title: "Masseur diplômé", color: "#F59E0B" },
        { displayName: "Nadia F.", title: "Praticienne thaï", color: "#EC4899" },
      ],
      "le-gentleman-barber-casablanca": [
        { displayName: "Mehdi A.", title: "Master barber", color: "#1D4ED8" },
        { displayName: "Oussama K.", title: "Barbier", color: "#DC2626" },
      ],
      "institut-royal-fes": [
        { displayName: "Latifa M.", title: "Esthéticienne diplômée", color: "#7C3AED" },
        { displayName: "Soukaina R.", title: "Maquilleuse", color: "#F59E0B" },
      ],
    };

    const staff = staffData[salonData.slug] || [];
    const createdStaff = [];
    for (const s of staff) {
      const st = await prisma.staffMember.create({
        data: { salonId, displayName: s.displayName, title: s.title, color: s.color, isActive: true },
      });
      createdStaff.push(st);

      // Staff schedules
      const scheduleDays = salonData.category === "SPA"
        ? [0,1,2,3,4,5,6]
        : [0,1,2,3,4,5];
      for (const day of scheduleDays) {
        await prisma.staffSchedule.create({
          data: {
            staffId: st.id,
            dayOfWeek: day,
            startTime: salonData.category === "SPA" ? "10:00" : "09:00",
            endTime: (day === 5 && salonData.category !== "SPA") ? "20:00" : salonData.category === "SPA" ? (day === 6 ? "18:00" : "21:00") : "19:00",
            isWorking: true,
          },
        });
      }

      // Assign staff to services
      for (const svc of createdServices.slice(0, 3)) {
        await prisma.staffService.create({
          data: { staffId: st.id, serviceId: svc.id },
        });
      }
    }

    console.log(`✅ Created: ${salonData.name}`);
  }

  console.log("✅ All 12 salons seeded successfully!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());