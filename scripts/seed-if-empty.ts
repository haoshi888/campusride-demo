import { PrismaClient } from "@prisma/client";
import { closeSeedDatabase, seedDatabase } from "../prisma/seed.ts";

const prisma = new PrismaClient();

async function main() {
  const schools = await prisma.school.count();
  await prisma.$disconnect();
  if (schools > 0) {
    console.log(`Database already has ${schools} schools; skipping demo seed.`);
    return;
  }
  console.log("Empty database detected; seeding CampusRide demo data.");
  await seedDatabase();
  await closeSeedDatabase();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
