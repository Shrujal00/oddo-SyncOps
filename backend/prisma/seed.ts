import { PrismaClient, type RoleName } from "@prisma/client";
import { randomBytes, scrypt } from "crypto";

const prisma = new PrismaClient();

type DemoUser = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: RoleName;
};

type DemoVendor = {
  name: string;
  email: string;
  phone: string;
};

type DemoCustomer = {
  name: string;
  email: string;
  phone: string;
};

function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, (err, key) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(`${salt}:${key.toString("hex")}`);
    });
  });
}

async function upsertByName<T extends { name: string }>(
  model: {
    findFirst: (args: { where: { name: string; deletedAt: null } }) => Promise<(T & { id: string }) | null>;
    create: (args: { data: T }) => Promise<T & { id: string }>;
    update: (args: { where: { id: string }; data: Partial<T> }) => Promise<T & { id: string }>;
  },
  data: T,
) {
  const existing = await model.findFirst({ where: { name: data.name, deletedAt: null } });
  if (existing) return model.update({ where: { id: existing.id }, data });
  return model.create({ data });
}

async function seedRoles() {
  const roles: { name: RoleName; description: string }[] = [
    { name: "ADMIN", description: "Full system access" },
    { name: "SALES_USER", description: "Manage sales orders" },
    { name: "PURCHASE_USER", description: "Manage purchase orders" },
    { name: "MANUFACTURING_USER", description: "Handle manufacturing orders" },
    { name: "INVENTORY_MANAGER", description: "Track stock movement" },
    { name: "BUSINESS_OWNER", description: "Monitor business flow" },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description, deletedAt: null },
      create: role,
    });
  }
}

async function seedUsers() {
  const users: DemoUser[] = [
    { email: "admin@syncops.dev", password: "Admin@1234", firstName: "System", lastName: "Admin", role: "ADMIN" },
    { email: "sales@syncops.dev", password: "Welcome@123", firstName: "Priya", lastName: "Sharma", role: "SALES_USER" },
    { email: "purchase@syncops.dev", password: "Welcome@123", firstName: "Ravi", lastName: "Kumar", role: "PURCHASE_USER" },
    { email: "mfg@syncops.dev", password: "Welcome@123", firstName: "Arjun", lastName: "Singh", role: "MANUFACTURING_USER" },
    { email: "inventory@syncops.dev", password: "Welcome@123", firstName: "Meena", lastName: "Patel", role: "INVENTORY_MANAGER" },
    { email: "owner@syncops.dev", password: "Welcome@123", firstName: "Shiv", lastName: "Agarwal", role: "BUSINESS_OWNER" },
  ];

  await prisma.user.updateMany({
    where: { email: { notIn: users.map((u) => u.email) } },
    data: { isActive: false, deletedAt: new Date() },
  });

  for (const user of users) {
    const role = await prisma.role.findUnique({ where: { name: user.role } });
    if (!role) throw new Error(`Role not found: ${user.role}`);
    const passwordHash = await hashPassword(user.password);

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        passwordHash,
        firstName: user.firstName,
        lastName: user.lastName,
        roleId: role.id,
        isActive: true,
        deletedAt: null,
      },
      create: {
        email: user.email,
        passwordHash,
        firstName: user.firstName,
        lastName: user.lastName,
        roleId: role.id,
      },
    });
  }
}

async function seedPartners() {
  const vendorData: DemoVendor[] = [
    { name: "Timber World", email: "orders@timberworld.example", phone: "9000010001" },
    { name: "Metal Hub", email: "sales@metalhub.example", phone: "9000010002" },
    { name: "FastPack Supplies", email: "support@fastpack.example", phone: "9000010003" },
  ];

  const customerData: DemoCustomer[] = [
    { name: "Reliance Interiors", email: "buying@relianceinteriors.example", phone: "8000010001" },
    { name: "HomeDecor Co", email: "orders@homedecor.example", phone: "8000010002" },
    { name: "OfficeSpaces Ltd", email: "procurement@officespaces.example", phone: "8000010003" },
  ];

  const vendors = Object.fromEntries(
    await Promise.all(vendorData.map(async (vendor) => [vendor.name, await upsertByName(prisma.vendor, vendor)])),
  );
  const customers = Object.fromEntries(
    await Promise.all(customerData.map(async (customer) => [customer.name, await upsertByName(prisma.customer, customer)])),
  );

  return { vendors, customers };
}

async function seedWorkCenters() {
  const workCenters = [
    { name: "Assembly Line", description: "Primary furniture assembly area" },
    { name: "Paint Floor", description: "Finishing and paint operations" },
    { name: "Packaging Unit", description: "Final packing and dispatch preparation" },
  ];

  return Object.fromEntries(
    await Promise.all(
      workCenters.map(async (workCenter) => [
        workCenter.name,
        await prisma.workCenter.upsert({
          where: { name: workCenter.name },
          update: { description: workCenter.description, deletedAt: null },
          create: workCenter,
        }),
      ]),
    ),
  );
}

async function seedProducts(timberWorldId: string, fastPackId: string) {
  const products = [
    {
      sku: "LEG-WOOD-001",
      name: "Wooden Legs",
      description: "Standard table legs for Shiv Furniture products",
      productType: "RAW_MATERIAL" as const,
      unitOfMeasure: "pcs",
      standardCost: 120,
      sellingPrice: 180,
      reorderPoint: 40,
      procureOnDemand: true,
      procurementMode: "MTS" as const,
      supplyStrategy: "BUY" as const,
      preferredVendorId: timberWorldId,
    },
    {
      sku: "TOP-WOOD-001",
      name: "Wooden Top",
      description: "Finished wooden table top",
      productType: "RAW_MATERIAL" as const,
      unitOfMeasure: "pcs",
      standardCost: 450,
      sellingPrice: 650,
      reorderPoint: 15,
      procureOnDemand: true,
      procurementMode: "MTS" as const,
      supplyStrategy: "BUY" as const,
      preferredVendorId: timberWorldId,
    },
    {
      sku: "SCREW-STD-001",
      name: "Screws",
      description: "Standard furniture screw pack",
      productType: "RAW_MATERIAL" as const,
      unitOfMeasure: "pcs",
      standardCost: 2,
      sellingPrice: 5,
      reorderPoint: 300,
      procureOnDemand: true,
      procurementMode: "MTS" as const,
      supplyStrategy: "BUY" as const,
      preferredVendorId: fastPackId,
    },
    {
      sku: "TABLE-WOOD-001",
      name: "Wooden Table",
      description: "Make-to-order wooden table",
      productType: "FINISHED_PRODUCT" as const,
      unitOfMeasure: "pcs",
      standardCost: 950,
      sellingPrice: 1600,
      reorderPoint: 5,
      procureOnDemand: true,
      procurementMode: "MTO" as const,
      supplyStrategy: "MAKE" as const,
    },
    {
      sku: "CHAIR-WOOD-001",
      name: "Wooden Chair",
      description: "Make-to-stock wooden chair — high volume product",
      productType: "FINISHED_PRODUCT" as const,
      unitOfMeasure: "pcs",
      standardCost: 550,
      sellingPrice: 950,
      reorderPoint: 20,
      procureOnDemand: false,
      procurementMode: "MTS" as const,
      supplyStrategy: "MAKE" as const,
    },
    {
      sku: "CHAIR-OFFICE-001",
      name: "Office Chair",
      description: "Make-to-order office chair",
      productType: "FINISHED_PRODUCT" as const,
      unitOfMeasure: "pcs",
      standardCost: 700,
      sellingPrice: 1250,
      reorderPoint: 4,
      procureOnDemand: true,
      procurementMode: "MTO" as const,
      supplyStrategy: "MAKE" as const,
    },
    {
      sku: "TABLE-DINING-001",
      name: "Dining Table",
      description: "Buy-to-order dining table",
      productType: "FINISHED_PRODUCT" as const,
      unitOfMeasure: "pcs",
      standardCost: 1800,
      sellingPrice: 3000,
      reorderPoint: 2,
      procureOnDemand: true,
      procurementMode: "MTO" as const,
      supplyStrategy: "BUY" as const,
      preferredVendorId: timberWorldId,
    },
  ];

  const seeded = Object.fromEntries(
    await Promise.all(
      products.map(async (product) => [
        product.sku,
        await prisma.product.upsert({
          where: { sku: product.sku },
          update: { ...product, deletedAt: null },
          create: product,
        }),
      ]),
    ),
  );

  return seeded;
}

async function upsertBom(data: {
  productId: string;
  name: string;
  version: string;
  items: Array<{ productId: string; quantity: number; scrapPercentage?: number }>;
}) {
  const bom = await prisma.$transaction(async (tx) => {
    await tx.billOfMaterial.updateMany({
      where: { productId: data.productId, deletedAt: null, isActive: true },
      data: { isActive: false },
    });

    const existing = await tx.billOfMaterial.findUnique({
      where: { productId_version: { productId: data.productId, version: data.version } },
    });

    const billOfMaterial = existing
      ? await tx.billOfMaterial.update({
          where: { id: existing.id },
          data: { name: data.name, isActive: true, deletedAt: null },
        })
      : await tx.billOfMaterial.create({
          data: { productId: data.productId, name: data.name, version: data.version, isActive: true },
        });

    await tx.billOfMaterialItem.deleteMany({ where: { billOfMaterialId: billOfMaterial.id } });
    await tx.billOfMaterialItem.createMany({
      data: data.items.map((item) => ({
        billOfMaterialId: billOfMaterial.id,
        productId: item.productId,
        quantity: item.quantity,
        scrapPercentage: item.scrapPercentage ?? 0,
      })),
    });
    await tx.product.update({ where: { id: data.productId }, data: { activeBomId: billOfMaterial.id } });
    return billOfMaterial;
  });

  return bom;
}

async function seedBoMs(products: Record<string, { id: string }>) {
  await upsertBom({
    productId: products["TABLE-WOOD-001"].id,
    name: "Wooden Table BoM",
    version: "1.0",
    items: [
      { productId: products["LEG-WOOD-001"].id, quantity: 4 },
      { productId: products["TOP-WOOD-001"].id, quantity: 1 },
      { productId: products["SCREW-STD-001"].id, quantity: 12 },
    ],
  });

  await upsertBom({
    productId: products["CHAIR-WOOD-001"].id,
    name: "Wooden Chair BoM",
    version: "1.0",
    items: [
      { productId: products["LEG-WOOD-001"].id, quantity: 4 },
      { productId: products["SCREW-STD-001"].id, quantity: 8 },
    ],
  });

  await upsertBom({
    productId: products["CHAIR-OFFICE-001"].id,
    name: "Office Chair BoM",
    version: "1.0",
    items: [
      { productId: products["LEG-WOOD-001"].id, quantity: 4 },
      { productId: products["TOP-WOOD-001"].id, quantity: 1 },
      { productId: products["SCREW-STD-001"].id, quantity: 8 },
    ],
  });
}

async function seedStock(products: Record<string, { id: string }>) {
  await prisma.inventoryMovement.deleteMany({ where: { referenceType: "Seed" } });

  await prisma.inventoryMovement.createMany({
    data: [
      {
        productId: products["LEG-WOOD-001"].id,
        movementType: "PURCHASE",
        quantity: 120,
        referenceType: "Seed",
        notes: "Initial stock for Shiv Furniture demo",
        occurredAt: new Date(),
      },
      {
        productId: products["TOP-WOOD-001"].id,
        movementType: "PURCHASE",
        quantity: 30,
        referenceType: "Seed",
        notes: "Initial stock for Shiv Furniture demo",
        occurredAt: new Date(),
      },
      {
        productId: products["SCREW-STD-001"].id,
        movementType: "PURCHASE",
        quantity: 600,
        referenceType: "Seed",
        notes: "Initial stock for Shiv Furniture demo",
        occurredAt: new Date(),
      },
      {
        productId: products["CHAIR-WOOD-001"].id,
        movementType: "PRODUCTION",
        quantity: 100,
        referenceType: "Seed",
        notes: "MTS product — high stock for demo",
        occurredAt: new Date(),
      },
      {
        productId: products["TABLE-WOOD-001"].id,
        movementType: "PRODUCTION",
        quantity: 2,
        referenceType: "Seed",
        notes: "MTO product — low stock to trigger auto-procurement demo",
        occurredAt: new Date(),
      },
      {
        productId: products["TABLE-DINING-001"].id,
        movementType: "PURCHASE",
        quantity: 2,
        referenceType: "Seed",
        notes: "Buy-to-order opening stock",
        occurredAt: new Date(),
      },
    ],
  });
}

async function clearBusinessData() {
  await prisma.auditLog.deleteMany();
  await prisma.assistantDocumentChunk.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.manufacturingOrder.deleteMany();
  await prisma.billOfMaterialItem.deleteMany();
  await prisma.billOfMaterial.deleteMany();
  await prisma.salesOrderItem.deleteMany();
  await prisma.salesOrder.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.workCenter.deleteMany();
}

async function main() {
  const includeDemoData = process.argv.includes("--demo");

  await clearBusinessData();
  await seedRoles();
  await seedUsers();

  console.log("Seed complete:");
  console.log("- 6 roles and 1 admin login user");

  if (includeDemoData) {
    const { vendors } = await seedPartners();
    await seedWorkCenters();

    const products = await seedProducts(vendors["Timber World"].id, vendors["FastPack Supplies"].id);
    await seedBoMs(products);
    await seedStock(products);

    console.log("- Shiv Furniture vendors, customers, work centers");
    console.log("- products, BoMs, and baseline inventory for demo flows");
  } else {
    console.log("- no demo products, partners, orders, inventory, or manufacturing data");
  }

  console.log("  admin@syncops.dev / Admin@1234  (ADMIN)");
  console.log("  sales@syncops.dev / Welcome@123  (SALES_USER)");
  console.log("  purchase@syncops.dev / Welcome@123  (PURCHASE_USER)");
  console.log("  mfg@syncops.dev / Welcome@123  (MANUFACTURING_USER)");
  console.log("  inventory@syncops.dev / Welcome@123  (INVENTORY_MANAGER)");
  console.log("  owner@syncops.dev / Welcome@123  (BUSINESS_OWNER)");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
