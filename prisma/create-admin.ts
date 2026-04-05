/**
 * Script to create an admin user for demo/development.
 * Run with: bun prisma/create-admin.ts
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

const ADMIN_EMAIL = "admin@compuelite.cl";
const ADMIN_PASSWORD = "compuelite2025";
const ADMIN_NAME = "Admin Compuelite";

async function main() {
  console.log("Creating admin user...");

  const passwordHash = await hash(ADMIN_PASSWORD, 12);

  const user = await db.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { passwordHash, role: "ADMIN" },
    create: {
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log(`\n✅ Admin user ready`);
  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log(`   Role:     ${user.role}`);
  console.log(`\n🔑 Login at: /login`);
  console.log(`📊 Admin panel: /admin`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
