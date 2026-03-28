import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { name: "Coupe", nameAr: "قص", slug: "coupe", icon: "scissors", order: 1 },
  { name: "Coloration", nameAr: "صباغة", slug: "coloration", icon: "palette", order: 2 },
  { name: "Soins capillaires", nameAr: "عناية بالشعر", slug: "soins-capillaires", icon: "sparkles", order: 3 },
  { name: "Coiffure", nameAr: "تسريحات", slug: "coiffure", icon: "crown", order: 4 },
  { name: "Barbe", nameAr: "لحية", slug: "barbe", icon: "scissors", order: 5 },
  { name: "Manucure", nameAr: "مانيكير", slug: "manucure", icon: "hand", order: 6 },
  { name: "Pedicure", nameAr: "باديكير", slug: "pedicure", icon: "footprints", order: 7 },
  { name: "Epilation", nameAr: "إزالة الشعر", slug: "epilation", icon: "zap", order: 8 },
  { name: "Maquillage", nameAr: "مكياج", slug: "maquillage", icon: "palette", order: 9 },
  { name: "Massage", nameAr: "تدليك", slug: "massage", icon: "heart", order: 10 },
  { name: "Hammam", nameAr: "حمام", slug: "hammam", icon: "droplets", order: 11 },
  { name: "Soin visage", nameAr: "عناية بالوجه", slug: "soin-visage", icon: "sparkles", order: 12 },
];

async function main() {
  console.log("Seeding database...");

  // Create service categories
  for (const cat of categories) {
    await prisma.serviceCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  console.log(`Created ${categories.length} service categories`);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@planity.ma" },
    update: {},
    create: {
      email: "admin@planity.ma",
      name: "Admin Planity",
      firstName: "Admin",
      lastName: "Planity",
      role: "ADMIN",
      passwordHash: "$2a$12$LQv3c1yqBo9SkvXS7QTJPOoZdyGZ0bOmFkFSJj5fR3SjG5OJBjMi", // "admin123"
    },
  });

  console.log("Created admin user:", admin.email);

  // Create sample salon owner
  const owner = await prisma.user.upsert({
    where: { email: "pro@salon-elegance.ma" },
    update: {},
    create: {
      email: "pro@salon-elegance.ma",
      name: "Sara Mansouri",
      firstName: "Sara",
      lastName: "Mansouri",
      phone: "+212661123456",
      role: "PRO_OWNER",
      passwordHash: "$2a$12$LQv3c1yqBo9SkvXS7QTJPOoZdyGZ0bOmFkFSJj5fR3SjG5OJBjMi", // "admin123"
    },
  });

  // Create sample salon
  const salon = await prisma.salon.upsert({
    where: { slug: "salon-elegance-casablanca" },
    update: {},
    create: {
      name: "Salon Elegance",
      slug: "salon-elegance-casablanca",
      description:
        "Salon de coiffure haut de gamme au coeur de Casablanca. Notre equipe de professionnels vous accueille dans un cadre chaleureux.",
      category: "COIFFEUR",
      address: "123 Boulevard Mohammed V",
      city: "Casablanca",
      postalCode: "20000",
      latitude: 33.5731,
      longitude: -7.5898,
      phone: "+212522123456",
      email: "contact@salon-elegance.ma",
      isActive: true,
      isVerified: true,
      ownerId: owner.id,
    },
  });

  // Opening hours (Mon-Sat 9-19, Sun closed)
  for (let day = 0; day < 7; day++) {
    await prisma.openingHours.upsert({
      where: { salonId_dayOfWeek: { salonId: salon.id, dayOfWeek: day } },
      update: {},
      create: {
        salonId: salon.id,
        dayOfWeek: day,
        openTime: "09:00",
        closeTime: day === 5 ? "20:00" : "19:00",
        isClosed: day === 6,
      },
    });
  }

  // Services
  const coupeCategory = await prisma.serviceCategory.findUnique({
    where: { slug: "coupe" },
  });
  const colorCategory = await prisma.serviceCategory.findUnique({
    where: { slug: "coloration" },
  });
  const soinCategory = await prisma.serviceCategory.findUnique({
    where: { slug: "soins-capillaires" },
  });

  const servicesData = [
    { name: "Coupe femme", price: 150, duration: 45, categoryId: coupeCategory?.id },
    { name: "Coupe homme", price: 80, duration: 30, categoryId: coupeCategory?.id },
    { name: "Coupe enfant", price: 60, duration: 20, categoryId: coupeCategory?.id },
    { name: "Coloration complete", price: 300, duration: 90, categoryId: colorCategory?.id },
    { name: "Meches", price: 250, duration: 120, categoryId: colorCategory?.id },
    { name: "Balayage", price: 350, duration: 150, categoryId: colorCategory?.id },
    { name: "Brushing", price: 100, duration: 30, categoryId: soinCategory?.id },
    { name: "Soin capillaire", price: 200, duration: 60, categoryId: soinCategory?.id },
  ];

  for (const svc of servicesData) {
    await prisma.service.create({
      data: {
        salonId: salon.id,
        ...svc,
      },
    });
  }

  // Staff members
  const staffData = [
    { displayName: "Sara M.", title: "Coiffeuse senior", color: "#EC4899" },
    { displayName: "Karim B.", title: "Coloriste", color: "#3B82F6" },
    { displayName: "Nadia L.", title: "Coiffeuse", color: "#10B981" },
  ];

  for (const staff of staffData) {
    const created = await prisma.staffMember.create({
      data: {
        salonId: salon.id,
        ...staff,
      },
    });

    // Set schedule (Mon-Sat 9-19)
    for (let day = 0; day < 6; day++) {
      await prisma.staffSchedule.create({
        data: {
          staffId: created.id,
          dayOfWeek: day,
          startTime: "09:00",
          endTime: "19:00",
          isWorking: true,
        },
      });
    }
  }

  // Create sample consumer
  await prisma.user.upsert({
    where: { email: "client@example.com" },
    update: {},
    create: {
      email: "client@example.com",
      name: "Fatima Zahri",
      firstName: "Fatima",
      lastName: "Zahri",
      phone: "+212662789012",
      role: "CONSUMER",
      passwordHash: "$2a$12$LQv3c1yqBo9SkvXS7QTJPOoZdyGZ0bOmFkFSJj5fR3SjG5OJBjMi",
    },
  });

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
