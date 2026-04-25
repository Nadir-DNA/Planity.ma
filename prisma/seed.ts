import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clean existing data
  await prisma.bookingItem.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.review.deleteMany();
  await prisma.staffService.deleteMany();
  await prisma.staffSchedule.deleteMany();
  await prisma.staffMember.deleteMany();
  await prisma.service.deleteMany();
  await prisma.openingHours.deleteMany();
  await prisma.salon.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Cleaned existing data");

  // Create users
  const passwordHash = await bcrypt.hash("password123", 12);

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@planity.ma",
      name: "Admin Planity",
      passwordHash,
      role: "ADMIN",
    },
  });

  const proUser1 = await prisma.user.create({
    data: {
      email: "sara@salon-elegance.ma",
      name: "Sara Mansouri",
      passwordHash,
      role: "PRO_OWNER",
      phone: "+212 661 123 456",
    },
  });

  const proUser2 = await prisma.user.create({
    data: {
      email: "karim@barber-house.ma",
      name: "Karim Bennani",
      passwordHash,
      role: "PRO_OWNER",
      phone: "+212 662 789 012",
    },
  });

  const consumerUser1 = await prisma.user.create({
    data: {
      email: "fatima@email.com",
      name: "Fatima Zahra",
      passwordHash,
      role: "CONSUMER",
      phone: "+212 663 345 678",
    },
  });

  const consumerUser2 = await prisma.user.create({
    data: {
      email: "ahmed@email.com",
      name: "Ahmed Benali",
      passwordHash,
      role: "CONSUMER",
      phone: "+212 664 901 234",
    },
  });

  console.log("👥 Created users");

  // Create salons
  const salon1 = await prisma.salon.create({
    data: {
      name: "Salon Elegance",
      slug: "salon-elegance-casablanca",
      category: "COIFFEUR",
      address: "123 Boulevard Mohammed V",
      city: "Casablanca",
      phone: "+212 522 123 456",
      email: "contact@salon-elegance.ma",
      description: "Salon de coiffure haut de gamme au coeur de Casablanca",
      ownerId: proUser1.id,
      isActive: true,
      isVerified: true,
      averageRating: 4.8,
      reviewCount: 124,
    },
  });

  const salon2 = await prisma.salon.create({
    data: {
      name: "Barber House",
      slug: "barber-house-rabat",
      category: "BARBIER",
      address: "45 Rue Hassan II",
      city: "Rabat",
      phone: "+212 537 789 012",
      email: "contact@barber-house.ma",
      description: "Barbier professionnel à Rabat",
      ownerId: proUser2.id,
      isActive: true,
      isVerified: true,
      averageRating: 4.9,
      reviewCount: 89,
    },
  });

  console.log("🏢 Created salons");

  // Create opening hours
  await prisma.openingHours.createMany({
    data: [
      // Salon 1
      { salonId: salon1.id, dayOfWeek: 0, openTime: "09:00", closeTime: "19:00", isClosed: false },
      { salonId: salon1.id, dayOfWeek: 1, openTime: "09:00", closeTime: "19:00", isClosed: false },
      { salonId: salon1.id, dayOfWeek: 2, openTime: "09:00", closeTime: "19:00", isClosed: false },
      { salonId: salon1.id, dayOfWeek: 3, openTime: "09:00", closeTime: "19:00", isClosed: false },
      { salonId: salon1.id, dayOfWeek: 4, openTime: "09:00", closeTime: "19:00", isClosed: false },
      { salonId: salon1.id, dayOfWeek: 5, openTime: "09:00", closeTime: "20:00", isClosed: false },
      // Salon 2
      { salonId: salon2.id, dayOfWeek: 0, openTime: "09:00", closeTime: "19:00", isClosed: false },
      { salonId: salon2.id, dayOfWeek: 1, openTime: "09:00", closeTime: "19:00", isClosed: false },
      { salonId: salon2.id, dayOfWeek: 2, openTime: "09:00", closeTime: "19:00", isClosed: false },
      { salonId: salon2.id, dayOfWeek: 3, openTime: "09:00", closeTime: "19:00", isClosed: false },
      { salonId: salon2.id, dayOfWeek: 4, openTime: "09:00", closeTime: "19:00", isClosed: false },
      { salonId: salon2.id, dayOfWeek: 5, openTime: "09:00", closeTime: "20:00", isClosed: false },
    ],
  });

  console.log("🕐 Created opening hours");

  // Create services
  const service1 = await prisma.service.create({
    data: {
      salonId: salon1.id,
      name: "Coupe femme",
      price: 150,
      duration: 45,
      description: "Coupe et coiffure pour femme",
      isActive: true,
      isOnlineBookable: true,
    },
  });

  const service2 = await prisma.service.create({
    data: {
      salonId: salon1.id,
      name: "Coloration",
      price: 300,
      duration: 90,
      description: "Coloration complète ou mèches",
      isActive: true,
      isOnlineBookable: true,
    },
  });

  const service3 = await prisma.service.create({
    data: {
      salonId: salon1.id,
      name: "Brushing",
      price: 100,
      duration: 30,
      description: "Brushing et coiffage",
      isActive: true,
      isOnlineBookable: true,
    },
  });

  const service4 = await prisma.service.create({
    data: {
      salonId: salon2.id,
      name: "Coupe homme",
      price: 80,
      duration: 30,
      description: "Coupe classique ou moderne",
      isActive: true,
      isOnlineBookable: true,
    },
  });

  const service5 = await prisma.service.create({
    data: {
      salonId: salon2.id,
      name: "Barbe",
      price: 50,
      duration: 20,
      description: "Taille et soin de la barbe",
      isActive: true,
      isOnlineBookable: true,
    },
  });

  console.log("✂️ Created services");

  // Create staff members
  const staff1 = await prisma.staffMember.create({
    data: {
      salonId: salon1.id,
      displayName: "Sara M.",
      title: "Coiffeuse senior",
      color: "#3B82F6",
      isActive: true,
    },
  });

  const staff2 = await prisma.staffMember.create({
    data: {
      salonId: salon1.id,
      displayName: "Karim B.",
      title: "Coloriste",
      color: "#10B981",
      isActive: true,
    },
  });

  const staff3 = await prisma.staffMember.create({
    data: {
      salonId: salon2.id,
      displayName: "Karim B.",
      title: "Barbier",
      color: "#F59E0B",
      isActive: true,
    },
  });

  console.log("👥 Created staff members");

  // Create staff schedules
  for (let i = 0; i < 6; i++) {
    await prisma.staffSchedule.create({
      data: {
        staffId: staff1.id,
        dayOfWeek: i,
        startTime: "09:00",
        endTime: "19:00",
        isWorking: true,
      },
    });
    await prisma.staffSchedule.create({
      data: {
        staffId: staff2.id,
        dayOfWeek: i,
        startTime: "09:00",
        endTime: "19:00",
        isWorking: true,
      },
    });
    await prisma.staffSchedule.create({
      data: {
        staffId: staff3.id,
        dayOfWeek: i,
        startTime: "09:00",
        endTime: "19:00",
        isWorking: true,
      },
    });
  }

  console.log("📅 Created staff schedules");

  // Assign staff to services
  await prisma.staffService.createMany({
    data: [
      { staffId: staff1.id, serviceId: service1.id },
      { staffId: staff1.id, serviceId: service2.id },
      { staffId: staff1.id, serviceId: service3.id },
      { staffId: staff2.id, serviceId: service2.id },
      { staffId: staff3.id, serviceId: service4.id },
      { staffId: staff3.id, serviceId: service5.id },
    ],
  });

  console.log("🔗 Assigned staff to services");

  // Create bookings
  const booking1 = await prisma.booking.create({
    data: {
      reference: "PLM-A3K7N",
      userId: consumerUser1.id,
      salonId: salon1.id,
      status: "CONFIRMED",
      startTime: new Date("2024-03-20T14:00:00"),
      endTime: new Date("2024-03-20T15:15:00"),
      totalPrice: 250,
      source: "ONLINE",
      items: {
        create: [
          {
            serviceId: service1.id,
            staffId: staff1.id,
            startTime: new Date("2024-03-20T14:00:00"),
            endTime: new Date("2024-03-20T14:45:00"),
            price: 150,
          },
          {
            serviceId: service3.id,
            staffId: staff1.id,
            startTime: new Date("2024-03-20T14:45:00"),
            endTime: new Date("2024-03-20T15:15:00"),
            price: 100,
          },
        ],
      },
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      reference: "PLM-B8M2P",
      userId: consumerUser2.id,
      salonId: salon2.id,
      status: "COMPLETED",
      startTime: new Date("2024-03-15T10:00:00"),
      endTime: new Date("2024-03-15T10:50:00"),
      totalPrice: 130,
      source: "ONLINE",
      items: {
        create: [
          {
            serviceId: service4.id,
            staffId: staff3.id,
            startTime: new Date("2024-03-15T10:00:00"),
            endTime: new Date("2024-03-15T10:30:00"),
            price: 80,
          },
          {
            serviceId: service5.id,
            staffId: staff3.id,
            startTime: new Date("2024-03-15T10:30:00"),
            endTime: new Date("2024-03-15T10:50:00"),
            price: 50,
          },
        ],
      },
    },
  });

  console.log("📅 Created bookings");

  // Create reviews
  await prisma.review.create({
    data: {
      bookingId: booking2.id,
      userId: consumerUser2.id,
      salonId: salon2.id,
      overallRating: 5,
      qualityRating: 5,
      timingRating: 5,
      receptionRating: 5,
      hygieneRating: 4,
      comment: "Excellent service ! Karim est un vrai professionnel.",
      status: "APPROVED",
    },
  });

  console.log("⭐ Created reviews");

  console.log("✅ Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
