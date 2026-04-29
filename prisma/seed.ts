import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new (PrismaClient as any)({ adapter });

async function main() {
  console.log("Seeding database...");

  const org = await prisma.organization.upsert({
    where: { id: "seed-org-1" },
    update: {},
    create: {
      id: "seed-org-1",
      name: "First Baptist Church",
      contactPerson: "Pastor John Smith",
      email: "info@firstbaptist.org",
      phone: "(555) 123-4567",
      address: "123 Church St, Atlanta, GA 30301",
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@bookletflow.com" },
    update: {},
    create: {
      clerkId: "admin_placeholder_replace_with_real_clerk_id",
      name: "Admin User",
      email: "admin@bookletflow.com",
      role: "admin",
    },
  });

  const event = await prisma.event.upsert({
    where: { id: "seed-event-1" },
    update: {},
    create: {
      id: "seed-event-1",
      organizationId: org.id,
      name: "Annual Gala 2025",
      eventDate: new Date("2025-11-15"),
      location: "Grand Ballroom, Marriott Hotel",
      theme: "An Evening of Excellence",
      totalPages: 24,
      frontSectionPages: 4,
      status: "active",
      createdById: adminUser.id,
    },
  });

  console.log("Seed complete:", { org: org.name, event: event.name });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
