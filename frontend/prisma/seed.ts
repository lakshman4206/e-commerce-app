import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  // Clear existing records in safe deletion order
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 1. Seed Users (Admin & Customer)
  const hashedAdminPassword = await bcrypt.hash("AdminPass123!", 10);
  const hashedCustomerPassword = await bcrypt.hash("CustomerPass123!", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Alex Administrator",
      email: "admin@store.com",
      password: hashedAdminPassword,
      role: Role.ADMIN,
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: "Jane Doe",
      email: "customer@gmail.com",
      password: hashedCustomerPassword,
      role: Role.CUSTOMER,
      cart: {
        create: {},
      },
    },
  });

  console.log("Users created:", { adminId: admin.id, customerId: customer.id });

  // 2. Seed Categories
  const electronics = await prisma.category.create({
    data: {
      name: "Electronics",
      slug: "electronics",
      description: "Cutting-edge audio gear, displays, and minimalist workspace peripherals.",
    },
  });

  const apparel = await prisma.category.create({
    data: {
      name: "Apparel",
      slug: "apparel",
      description: "Architectural silhouettes, heavyweight organic cotton, and technical outerwear.",
    },
  });

  const lifestyle = await prisma.category.create({
    data: {
      name: "Lifestyle",
      slug: "lifestyle",
      description: "Curated objects for mindful living and refined daily carrying.",
    },
  });

  // 3. Seed Products
  const products = [
    {
      title: "Apex Wireless ANC Studio Headphones",
      description: "Engineered with 40mm bio-cellulose drivers, 38-hour battery longevity, adaptive active noise cancellation, and lossless USB-C audio streaming.",
      price: 349.0,
      stockQuantity: 24,
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=1000&auto=format&fit=crop",
      ],
      isFeatured: true,
      categoryId: electronics.id,
    },
    {
      title: "Monolith 75% Custom Mechanical Keyboard",
      description: "CNC-machined aluminum chassis, hot-swappable tactile switches, frosted polycarbonate backplate, and programmable QMK/VIA firmware.",
      price: 219.0,
      stockQuantity: 4, // Triggers low-stock alert (< 5)
      images: [
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=1000&auto=format&fit=crop",
      ],
      isFeatured: true,
      categoryId: electronics.id,
    },
    {
      title: "Precision Ultrawide 4K Studio Monitor",
      description: "Color-calibrated IPS Black panel with 98% DCI-P3 coverage, integrated 90W Thunderbolt 4 hub, and anti-reflective nanotech glass.",
      price: 899.99,
      stockQuantity: 12,
      images: [
        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1000&auto=format&fit=crop",
      ],
      isFeatured: true,
      categoryId: electronics.id,
    },
    {
      title: "Heavyweight Boxy Fleece Hoodie",
      description: "500 GSM luxury French Terry cotton, drop-shoulder relaxed cut, double-layered hood without drawstrings, garment-dyed in charcoal obsidian.",
      price: 110.0,
      stockQuantity: 50,
      images: [
        "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop",
      ],
      isFeatured: false,
      categoryId: apparel.id,
    },
    {
      title: "Waterproof Cordura Commuter Backpack",
      description: "24L ergonomic carry pack with dedicated magnetic laptop suspension sleeve, YKK Aquaguard zippers, and Fidlock magnetic buckles.",
      price: 185.0,
      stockQuantity: 15,
      images: [
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop",
      ],
      isFeatured: true,
      categoryId: lifestyle.id,
    },
    {
      title: "Insulated Double-Wall Titanium Flask",
      description: "Ultralight aerospace-grade titanium vacuum bottle that preserves temperature for up to 24 hours without metallic aftertaste.",
      price: 78.0,
      stockQuantity: 2, // Triggers low-stock alert (< 5)
      images: [
        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=1000&auto=format&fit=crop",
      ],
      isFeatured: false,
      categoryId: lifestyle.id,
    },
  ];

  for (const item of products) {
    await prisma.product.create({
      data: item,
    });
  }

  // 4. Seed a Sample Completed Order
  const sampleProduct = await prisma.product.findFirst({
    where: { title: { contains: "Apex Wireless" } },
  });

  if (sampleProduct) {
    await prisma.order.create({
      data: {
        userId: customer.id,
        totalAmount: 349.0,
        status: "PAID",
        stripePaymentIntentId: "pi_test_sample_intent_123456",
        address: "742 Evergreen Terrace, Springfield, OR 97477",
        phone: "+1 (555) 019-2834",
        items: {
          create: {
            productId: sampleProduct.id,
            quantity: 1,
            priceAtPurchase: 349.0,
          },
        },
      },
    });
  }

  console.log("Database seeded successfully!");
  console.log("--- Default Credentials ---");
  console.log("Admin:    admin@store.com     | Password: AdminPass123!");
  console.log("Customer: customer@gmail.com  | Password: CustomerPass123!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
