import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding...");

  // Admin user
  const adminHash = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@firxt.com" },
    update: {},
    create: {
      name: "FiRxt Admin",
      email: "admin@firxt.com",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });
  console.log("Admin created:", admin.email);

  // Demo partner user
  const partnerHash = await bcrypt.hash("partner123", 12);
  const partnerUser = await prisma.user.upsert({
    where: { email: "pharmacy@firxt.com" },
    update: {},
    create: {
      name: "Demo Pharmacy Owner",
      email: "pharmacy@firxt.com",
      passwordHash: partnerHash,
      role: "PARTNER",
    },
  });

  // Demo partner
  const partner = await prisma.partner.upsert({
    where: { slug: "protector-pharmacy" },
    update: {},
    create: {
      userId: partnerUser.id,
      slug: "protector-pharmacy",
      name: "Protector Pharmacy",
      type: "PHARMACY",
      status: "APPROVED",
      description: "Your trusted community pharmacy in Kuala Lumpur.",
      addressLine1: "Jalan Kuchai Lama, Taman Pagar Ruyung",
      city: "Kuala Lumpur",
      state: "Federal Territory of Kuala Lumpur",
      postcode: "58200",
      latitude: 3.1009,
      longitude: 101.6856,
      phone: "+60123456789",
      email: "protector@firxt.com",
      isVerified: true,
      approvedAt: new Date(),
    },
  });
  console.log("Partner created:", partner.name);

  // Demo category
  const category = await prisma.category.upsert({
    where: { slug: "vitamins" },
    update: {},
    create: { name: "Vitamins & Supplements", slug: "vitamins" },
  });

  // Demo product
  await prisma.product.upsert({
    where: { partnerId_slug: { partnerId: partner.id, slug: "vitamin-c-1000mg" } },
    update: {},
    create: {
      partnerId: partner.id,
      categoryId: category.id,
      name: "Vitamin C 1000mg",
      slug: "vitamin-c-1000mg",
      description: "High-strength Vitamin C for daily immune support.",
      price: 1290, // RM 12.90
      comparePrice: 1590,
      stock: 100,
      brand: "Blackmores",
      tags: ["vitamin", "immune", "supplement"],
      isActive: true,
      isFeatured: true,
    },
  });

  // Demo service
  await prisma.service.upsert({
    where: { partnerId_slug: { partnerId: partner.id, slug: "blood-pressure-check" } },
    update: {},
    create: {
      partnerId: partner.id,
      name: "Blood Pressure Check",
      slug: "blood-pressure-check",
      description: "Quick and accurate blood pressure monitoring by our pharmacist.",
      price: 1000, // RM 10.00
      durationMinutes: 15,
      isActive: true,
    },
  });

  // Demo promotion
  await prisma.promotion.upsert({
    where: { code: "HEALTH10" },
    update: {},
    create: {
      title: "10% Off Vitamins",
      description: "Get 10% off all vitamin and supplement purchases.",
      type: "PERCENTAGE",
      status: "ACTIVE",
      discountValue: 10,
      code: "HEALTH10",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("Seeding complete!");
  console.log("");
  console.log("Login credentials:");
  console.log("Admin:   admin@firxt.com / admin123");
  console.log("Partner: pharmacy@firxt.com / partner123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
