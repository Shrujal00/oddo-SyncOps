import { PrismaClient, RoleName } from "@prisma/client";
import { randomBytes, scrypt } from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, (err, key) => {
      if (err) reject(err);
      else resolve(`${salt}:${key.toString("hex")}`);
    });
  });
}

async function main() {
  // Roles
  const roleData: { name: RoleName; description: string }[] = [
    { name: "ADMIN", description: "Full system access" },
    { name: "SALES_USER", description: "Manage sales orders" },
    { name: "PURCHASE_USER", description: "Manage purchase orders" },
    { name: "MANUFACTURING_USER", description: "Handle manufacturing orders" },
    { name: "INVENTORY_MANAGER", description: "Track stock movement" },
    { name: "BUSINESS_OWNER", description: "Monitor business flow" },
  ];

  for (const r of roleData) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: r,
    });
  }

  console.log("✓ Roles seeded");

  // Admin user
  const adminRole = await prisma.role.findUnique({ where: { name: "ADMIN" } });
  if (!adminRole) throw new Error("Admin role not found");

  const adminHash = await hashPassword("Admin@1234");
  await prisma.user.upsert({
    where: { email: "admin@syncops.dev" },
    update: {},
    create: {
      email: "admin@syncops.dev",
      passwordHash: adminHash,
      firstName: "System",
      lastName: "Admin",
      roleId: adminRole.id,
    },
  });

  console.log("✓ Admin user seeded  →  admin@syncops.dev / Admin@1234");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
