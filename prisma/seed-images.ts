import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const IMAGES: Record<string, { cover: string; photos: string[] }> = {
  "salon-elegance-casablanca": {
    cover: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=800&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=600&fit=crop",
    ],
  },
  "barber-house-rabat": {
    cover: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=1200&h=800&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1493256338651-d82f7acb2b38?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1585747860019-8e8ef2ae4e5f?w=800&h=600&fit=crop",
    ],
  },
  "spa-zenith-marrakech": {
    cover: "https://images.unsplash.com/photo-1545579133-99bb5ab189bd?w=1200&h=800&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop",
    ],
  },
  "beauty-lounge-tanger": {
    cover: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&h=800&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop",
    ],
  },
  "coiffure-fatima-zahra-fes": {
    cover: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=1200&h=800&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=600&fit=crop",
    ],
  },
  "oceanе-spa-beaute-agadir": {
    cover: "https://images.unsplash.com/photo-1545579133-99bb5ab189bd?w=1200&h=800&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&h=600&fit=crop",
    ],
  },
  "nail-palace-casablanca": {
    cover: "https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=1200&h=800&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&h=600&fit=crop",
    ],
  },
  "maison-beaute-aisha-rabat": {
    cover: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&h=800&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop",
    ],
  },
  "epil-club-marrakech": {
    cover: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&h=800&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop",
    ],
  },
  "massage-bien-etre-tanger": {
    cover: "https://images.unsplash.com/photo-1545579133-99bb5ab189bd?w=1200&h=800&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop",
    ],
  },
  "le-gentleman-barber-casablanca": {
    cover: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=1200&h=800&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1493256338651-d82f7acb2b38?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1585747860019-8e8ef2ae4e5f?w=800&h=600&fit=crop",
    ],
  },
  "institut-royal-fes": {
    cover: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&h=800&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop",
    ],
  },
};

async function main() {
  console.log("🖼️ Adding images and enriching salon data...");

  // 1. Update each salon with coverImage, website, cancellationPolicy, depositPercentage, isActive, isVerified
  const salons = await prisma.salon.findMany({ select: { id: true, slug: true } });
  console.log(`Found ${salons.length} salons`);

  for (const salon of salons) {
    const slug = salon.slug; const imgData = IMAGES[slug];
    if (!imgData) {
      console.log(`⚠️ No images for ${slug}, skipping`);
      continue;
    }

    // Update salon with cover image and additional info
    await prisma.salon.update({
      where: { id: salon.id },
      data: {
        coverImage: imgData.cover,
        isActive: true,
        isVerified: true,
        isPremium: ["spa-zenith-marrakech", "le-gentleman-barber-casablanca", "salon-elegance-casablanca", "oceanе-spa-beaute-agadir"].includes(slug),
      },
    });
    console.log(`✅ Updated cover image for ${slug}`);

    // Add gallery photos
    for (let i = 0; i < imgData.photos.length; i++) {
      await prisma.salonPhoto.create({
        data: {
          salonId: salon.id,
          url: imgData.photos[i],
          alt: `${slug} photo ${i + 1}`,
          order: i,
        },
      });
    }
    console.log(`  📷 Added ${imgData.photos.length} gallery photos`);
  }

  // 2. Add reviews for each salon
  const consumerData = [
    { name: "Fatima B.", rating: 5, comment: "Excellent ! L'équipe est très professionnelle et l'ambiance est top. Je recommande vivement." },
    { name: "Karim M.", rating: 4, comment: "Bon service, personnel qualifié. Un peu cher mais la qualité est au rendez-vous." },
    { name: "Nadia L.", rating: 5, comment: "Mon salon préféré ! Toujours satisfaite du résultat. L'ambiance est chaleureuse et accueillante." },
    { name: "Ahmed R.", rating: 4, comment: "Très bon rapport qualité-prix. Le personnel est à l'écoute et les conseils sont personnalisés." },
    { name: "Salma K.", rating: 5, comment: "Service impeccable ! Réservation facile en ligne et résultat toujours à la hauteur de mes attentes." },
    { name: "Youssef T.", rating: 3, comment: "Service correct dans l'ensemble. L'attente peut être longue le samedi." },
    { name: "Amina Z.", rating: 5, comment: "Un vrai coup de cœur ! L'équipe prend le temps de comprendre ce qu'on veut. Bravo !" },
    { name: "Hassan F.", rating: 4, comment: "Bon salon, environnement propre et moderne. Je reviendrai avec plaisir." },
  ];

  // Create consumer users then reviews
  console.log("\n👥 Creating review authors...");
  const consumers = [];
  for (const c of consumerData) {
    const user = await prisma.user.create({
      data: {
        name: c.name,
        email: `${c.name.toLowerCase().replace(/[. ]/g, '')}${Math.random().toString(36).slice(2, 6)}@example.com`,
        role: "CONSUMER",
        phone: `+212 6${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
      },
    });
    consumers.push({ ...user, rating: c.rating, comment: c.comment });
  }

  console.log("⭐ Adding reviews...");
  for (const salon of salons) {
    // Pick 3-6 random consumers for reviews
    const numReviews = 3 + Math.floor(Math.random() * 4);
    const shuffled = [...consumers].sort(() => Math.random() - 0.5).slice(0, numReviews);

    for (const consumer of shuffled) {
      // Need a booking for each review
      const bookingRef = `PLM-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      const daysAgo = Math.floor(Math.random() * 30) + 1;
      const bookingDate = new Date(Date.now() - daysAgo * 86400000);

      const booking = await prisma.booking.create({
        data: {
          reference: bookingRef,
          userId: consumer.id,
          salonId: salon.id,
          status: "COMPLETED",
          startTime: bookingDate,
          endTime: new Date(bookingDate.getTime() + 3600000),
          totalPrice: Math.floor(Math.random() * 300) + 100,
          source: "ONLINE",
        },
      });

      await prisma.review.create({
        data: {
          bookingId: booking.id,
          userId: consumer.id,
          salonId: salon.id,
          overallRating: consumer.rating,
          qualityRating: Math.max(1, consumer.rating + Math.floor(Math.random() * 2) - 1),
          timingRating: Math.max(1, consumer.rating + Math.floor(Math.random() * 2) - 1),
          receptionRating: Math.max(1, consumer.rating),
          hygieneRating: Math.max(1, consumer.rating + Math.floor(Math.random() * 2)),
          comment: consumer.comment,
          status: "APPROVED",
          createdAt: bookingDate,
        },
      });
    }
    console.log(`  ⭐ ${numReviews} reviews for ${salon.slug}`);
  }

  console.log("\n✅ All images, photos, and reviews added!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
