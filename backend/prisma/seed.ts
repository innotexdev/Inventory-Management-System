import * as argon2 from "argon2";
import { prisma } from "../src/lib/prisma";
import { logger } from "../src/lib/logger";
import { requireId } from "../src/utils/required-id";
import { Role } from "../src/generated/enums";

const SEED_PASSWORD = "Start1234";

const CATEGORIES = [
  { name: "Laptop", description: "Portable computers" },
  { name: "Desktop PC", description: "Desktop workstations" },
  { name: "Monitor", description: "Displays" },
  { name: "Phone", description: "Mobile phones" },
  { name: "Keyboard", description: "Keyboards" },
  { name: "Mouse", description: "Mice and trackpads" },
  { name: "Headset", description: "Headsets and audio" },
  { name: "Chair", description: "Office chairs" },
] as const;

const TEAMS = [
  { name: "Frontend", description: "Web UI team" },
  { name: "Backend", description: "APIs and services" },
  { name: "Design", description: "Product design" },
  { name: "QA", description: "Quality assurance" },
] as const;

type SeedUser = {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  team?: string;
  isActive?: boolean;
};

const USERS: SeedUser[] = [
  { firstName: "Ada", lastName: "Admin", email: "admin@company.com", role: "ADMIN" },
  {
    firstName: "Mia",
    lastName: "Frontend",
    email: "mia.frontend@company.com",
    role: "MANAGER",
    team: "Frontend",
  },
  {
    firstName: "Omar",
    lastName: "Backend",
    email: "omar.backend@company.com",
    role: "MANAGER",
    team: "Backend",
  },
  {
    firstName: "Finn",
    lastName: "Fe",
    email: "finn.fe@company.com",
    role: "EMPLOYEE",
    team: "Frontend",
  },
  {
    firstName: "Sara",
    lastName: "Fe",
    email: "sara.fe@company.com",
    role: "EMPLOYEE",
    team: "Frontend",
  },
  {
    firstName: "Leo",
    lastName: "Fe",
    email: "leo.fe@company.com",
    role: "EMPLOYEE",
    team: "Frontend",
  },
  {
    firstName: "Nina",
    lastName: "Be",
    email: "nina.be@company.com",
    role: "EMPLOYEE",
    team: "Backend",
  },
  {
    firstName: "Tom",
    lastName: "Be",
    email: "tom.be@company.com",
    role: "EMPLOYEE",
    team: "Backend",
  },
  {
    firstName: "Ivy",
    lastName: "Design",
    email: "ivy.design@company.com",
    role: "EMPLOYEE",
    team: "Design",
  },
  {
    firstName: "Zoe",
    lastName: "Design",
    email: "zoe.design@company.com",
    role: "EMPLOYEE",
    team: "Design",
    isActive: false,
  },
  { firstName: "Max", lastName: "Noteam", email: "max.noteam@company.com", role: "EMPLOYEE" },
];

type CategoryName = (typeof CATEGORIES)[number]["name"];

const ITEM_NAMES: Record<CategoryName, Array<{ name: string; brand: string; model: string }>> = {
  Laptop: [
    { name: "MacBook Pro 14", brand: "Apple", model: "M4 Pro" },
    { name: "ThinkPad X1 Carbon", brand: "Lenovo", model: "Gen 12" },
    { name: "Dell XPS 13", brand: "Dell", model: "9340" },
    { name: "HP EliteBook 840", brand: "HP", model: "G11" },
    { name: "Lenovo Yoga 7", brand: "Lenovo", model: "14IRL8" },
  ],
  "Desktop PC": [
    { name: "OptiPlex 7010", brand: "Dell", model: "Tower" },
    { name: "ThinkCentre M90", brand: "Lenovo", model: "Gen 5" },
    { name: "ProDesk 400", brand: "HP", model: "G9" },
    { name: "Mac mini", brand: "Apple", model: "M2" },
    { name: "Vostro 3910", brand: "Dell", model: "Tower" },
  ],
  Monitor: [
    { name: 'UltraSharp 27"', brand: "Dell", model: "U2723QE" },
    { name: 'ThinkVision 24"', brand: "Lenovo", model: "T24i" },
    { name: 'ProDisplay 27"', brand: "HP", model: "E27" },
    { name: 'Gigabyte 32" 4K', brand: "Gigabyte", model: "M32U" },
    { name: 'Portable 15.6"', brand: "Asus", model: "MB16AC" },
  ],
  Phone: [
    { name: "iPhone 15", brand: "Apple", model: "A3090" },
    { name: "Galaxy S24", brand: "Samsung", model: "SM-S921" },
    { name: "Pixel 8", brand: "Google", model: "GC3VE" },
    { name: "iPhone 14", brand: "Apple", model: "A2649" },
    { name: "Galaxy A54", brand: "Samsung", model: "SM-A546" },
  ],
  Keyboard: [
    { name: "MX Keys", brand: "Logitech", model: "KX800" },
    { name: "Keychron K2", brand: "Keychron", model: "V2" },
    { name: "Magic Keyboard", brand: "Apple", model: "A2449" },
    { name: "Ergo K860", brand: "Logitech", model: "K860" },
    { name: "ThinkPad TrackPoint II", brand: "Lenovo", model: "4Y37A" },
  ],
  Mouse: [
    { name: "MX Master 3S", brand: "Logitech", model: "MR006" },
    { name: "Magic Mouse", brand: "Apple", model: "A1657" },
    { name: "Pro Click Mini", brand: "Razer", model: "RZ01" },
    { name: "M720 Triathlon", brand: "Logitech", model: "M720" },
    { name: "Precision Mouse", brand: "Lenovo", model: "GY51" },
  ],
  Headset: [
    { name: "WH-1000XM5", brand: "Sony", model: "XM5" },
    { name: "Zone Vibe 100", brand: "Logitech", model: "981" },
    { name: "AirPods Max", brand: "Apple", model: "A2096" },
    { name: "Blackwire 3320", brand: "Poly", model: "BW3320" },
    { name: "Evolve2 65", brand: "Jabra", model: "26599" },
  ],
  Chair: [
    { name: "Aeron Chair", brand: "Herman Miller", model: "Size B" },
    { name: "Embody Chair", brand: "Herman Miller", model: "Std" },
    { name: "Markus Chair", brand: "IKEA", model: "601.031" },
    { name: "Gesture Chair", brand: "Steelcase", model: "442A" },
    { name: "Leap Chair", brand: "Steelcase", model: "V2" },
  ],
};

const OTHER_STATUSES = [
  "AVAILABLE",
  "AVAILABLE",
  "AVAILABLE",
  "AVAILABLE",
  "AVAILABLE",
  "AVAILABLE",
  "AVAILABLE",
  "AVAILABLE",
  "AVAILABLE",
  "AVAILABLE",
  "AVAILABLE",
  "IN_REPAIR",
  "IN_REPAIR",
  "IN_REPAIR",
  "RETIRED",
  "RETIRED",
] as const;

const HOLDER_ORDER = [
  "finn.fe@company.com",
  "finn.fe@company.com",
  "finn.fe@company.com",
  "finn.fe@company.com",
  "finn.fe@company.com",
  "finn.fe@company.com",
  "sara.fe@company.com",
  "sara.fe@company.com",
  "sara.fe@company.com",
  "sara.fe@company.com",
  "leo.fe@company.com",
  "leo.fe@company.com",
  "leo.fe@company.com",
  "nina.be@company.com",
  "nina.be@company.com",
  "nina.be@company.com",
  "tom.be@company.com",
  "tom.be@company.com",
  "ivy.design@company.com",
  "ivy.design@company.com",
  "mia.frontend@company.com",
  "mia.frontend@company.com",
  "omar.backend@company.com",
  "omar.backend@company.com",
];

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  for (const c of CATEGORIES) {
    await prisma.category.upsert({
      where: { name: c.name },
      update: { description: c.description },
      create: { name: c.name, description: c.description },
    });
  }

  for (const t of TEAMS) {
    await prisma.team.upsert({
      where: { name: t.name },
      update: { description: t.description },
      create: { name: t.name, description: t.description },
    });
  }

  const passwordHash = await argon2.hash(SEED_PASSWORD);
  const userByEmail = new Map<string, string>();
  for (const u of USERS) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        team: u.team ? { connect: { name: u.team } } : { disconnect: true },
        isActive: u.isActive ?? true,
      },
      create: {
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        passwordHash,
        role: u.role,
        team: u.team ? { connect: { name: u.team } } : undefined,
        isActive: u.isActive ?? true,
      },
    });
    userByEmail.set(u.email, user.id);
  }

  const seeded = await prisma.$transaction(
    async (tx) => {
      if ((await tx.item.count()) > 0) {
        logger.info("Seed skipped: items already exist");
        return false;
      }

      const adminId = requireId(userByEmail, "admin@company.com");
      const miaId = requireId(userByEmail, "mia.frontend@company.com");
      const omarId = requireId(userByEmail, "omar.backend@company.com");

      const assignerFor = (holderEmail: string) => {
        const team = USERS.find((u) => u.email === holderEmail)?.team;
        return team === "Frontend" ? miaId : team === "Backend" ? omarId : adminId;
      };

      const categoryByName = new Map(
        (await tx.category.findMany()).map((c) => [c.name, c.id] as const),
      );

      let otherIdx = 0;
      let holderIdx = 0;
      let serialIdx = 1;
      const assignedItems: Array<{ id: string }> = [];
      const retiredItems: Array<{ id: string }> = [];
      const repairItems: Array<{ id: string }> = [];

      for (const categoryName of CATEGORIES.map((c) => c.name)) {
        const specs = ITEM_NAMES[categoryName];
        for (let i = 0; i < specs.length; i++) {
          const spec = specs[i];
          const isAssignedSlot = i < 3;

          const status = isAssignedSlot ? "AVAILABLE" : OTHER_STATUSES[otherIdx++];
          const item = await tx.item.create({
            data: {
              name: spec.name,
              categoryId: requireId(categoryByName, categoryName),
              brand: spec.brand,
              model: spec.model,

              serialNumber:
                serialIdx % 2 === 0
                  ? `SN-${categoryName.slice(0, 2).toUpperCase()}-${serialIdx}`
                  : undefined,
              status,
              purchaseDate: status === "RETIRED" ? daysAgo(900) : daysAgo(100 + serialIdx),
              notes: status === "IN_REPAIR" ? "Screen flickers, sent for repair" : undefined,
            },
          });
          serialIdx++;

          if (isAssignedSlot) {
            const holderEmail = HOLDER_ORDER[holderIdx++];
            await tx.assignment.create({
              data: {
                itemId: item.id,
                userId: requireId(userByEmail, holderEmail),
                assignedById: assignerFor(holderEmail),
                assignedAt: daysAgo(3 + holderIdx),
              },
            });
            assignedItems.push(item);
          } else if (status === "RETIRED") {
            retiredItems.push(item);
          } else if (status === "IN_REPAIR") {
            repairItems.push(item);
          }
        }
      }

      const historyItem = assignedItems[0];
      const pastHolders: Array<{ email: string; from: number; to: number }> = [
        { email: "zoe.design@company.com", from: 90, to: 60 },
        { email: "nina.be@company.com", from: 59, to: 30 },
        { email: "omar.backend@company.com", from: 29, to: 5 },
      ];
      for (const h of pastHolders) {
        await tx.assignment.create({
          data: {
            itemId: historyItem.id,
            userId: requireId(userByEmail, h.email),
            assignedById: assignerFor(h.email),
            assignedAt: daysAgo(h.from),
            returnedAt: daysAgo(h.to),
            returnedById: assignerFor(h.email),
            note: "Seeded history",
          },
        });
      }

      const extraPast = [
        "omar.backend@company.com",
        "tom.be@company.com",
        "ivy.design@company.com",
        "mia.frontend@company.com",
        "nina.be@company.com",
        "zoe.design@company.com",
      ];
      for (let i = 0; i < extraPast.length; i++) {
        await tx.assignment.create({
          data: {
            itemId: assignedItems[i + 1].id,
            userId: requireId(userByEmail, extraPast[i]),
            assignedById: adminId,
            assignedAt: daysAgo(50 + i * 5),
            returnedAt: daysAgo(40 + i * 5),
            returnedById: assignerFor(extraPast[i]),
          },
        });
      }

      await tx.assignment.create({
        data: {
          itemId: retiredItems[0].id,
          userId: requireId(userByEmail, "sara.fe@company.com"),
          assignedById: miaId,
          assignedAt: daysAgo(300),
          returnedAt: daysAgo(200),
          returnedById: miaId,
        },
      });
      await tx.assignment.create({
        data: {
          itemId: repairItems[0].id,
          userId: requireId(userByEmail, "nina.be@company.com"),
          assignedById: omarId,
          assignedAt: daysAgo(60),
          returnedAt: daysAgo(20),
          returnedById: omarId,
        },
      });

      return {
        items: await tx.item.count(),
        assignments: await tx.assignment.count(),
      };
    },

    { timeout: 60_000, maxWait: 10_000 },
  );

  if (!seeded) return;

  logger.info("Seed complete", {
    categories: CATEGORIES.length,
    teams: TEAMS.length,
    users: USERS.length,
    items: seeded.items,
    assignments: seeded.assignments,
  });
}

main()
  .catch((e) => {
    logger.error("Seed failed", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
