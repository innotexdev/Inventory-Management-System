import { prisma } from "../lib/prisma";
import type { Prisma } from "../generated/client";
import { ItemStatus, Role } from "../generated/enums";
import { isRecordNotFound, isUniqueViolation, NotFoundError, ValidationError } from "../lib/errors";
import { DuplicateSerialNumberError } from "../lib/inventory-errors";
import { assertStatusTransition, effectiveStatus, type ItemStatusView } from "../lib/item-status";
import type {
  ChangeItemStatusInput,
  CreateItemInput,
  ItemQuery,
  UpdateItemInput,
} from "../validation/inventory.validation";
import type {
  AssignmentView,
  CategoryView,
  InventoryStatsView,
  ItemView,
  ListResponse,
  PageMeta,
} from "../types/inventory";

const categorySelect = {
  id: true,
  name: true,
  description: true,
} as const;

const personSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
} as const;

const itemSelect = {
  id: true,
  assetTag: true,
  name: true,
  brand: true,
  model: true,
  serialNumber: true,
  status: true,
  purchaseDate: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  category: { select: categorySelect },
  assignments: {
    where: { returnedAt: null },
    select: {
      user: {
        select: {
          ...personSelect,
          team: { select: { id: true, name: true } },
        },
      },
    },
    take: 1,
  },
} satisfies Prisma.ItemSelect;

type ItemRecord = Prisma.ItemGetPayload<{ select: typeof itemSelect }>;

function toItemView(item: ItemRecord): ItemView {
  const active = item.assignments[0];

  return {
    id: item.id,
    assetTag: item.assetTag,
    name: item.name,
    category: item.category,
    brand: item.brand,
    model: item.model,
    serialNumber: item.serialNumber,
    status: effectiveStatus(item.status, active !== undefined),
    purchaseDate: item.purchaseDate?.toISOString() ?? null,
    notes: item.notes,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    currentHolder: active?.user ?? null,
  };
}

function buildMeta(total: number, page: number, pageSize: number): PageMeta {
  return { page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
}

function buildItemWhere(query: ItemQuery): Prisma.ItemWhereInput {
  const conditions: Prisma.ItemWhereInput[] = [];

  if (query.status === undefined) {
    conditions.push({ status: { not: ItemStatus.RETIRED } });
  } else if (query.status === "ASSIGNED") {
    conditions.push({ assignments: { some: { returnedAt: null } } });
  } else if (query.status === "AVAILABLE") {
    conditions.push({ status: ItemStatus.AVAILABLE, assignments: { none: { returnedAt: null } } });
  } else {
    conditions.push({ status: query.status, assignments: { none: { returnedAt: null } } });
  }

  if (query.categoryId !== undefined) {
    conditions.push({ categoryId: query.categoryId });
  }

  if (query.teamId !== undefined) {
    conditions.push({
      assignments: { some: { returnedAt: null, user: { teamId: query.teamId } } },
    });
  }

  if (query.holderId !== undefined) {
    conditions.push({ assignments: { some: { returnedAt: null, userId: query.holderId } } });
  }

  if (query.search) {
    conditions.push({
      OR: [
        { name: { contains: query.search, mode: "insensitive" } },
        { assetTag: { contains: query.search, mode: "insensitive" } },
        { serialNumber: { contains: query.search, mode: "insensitive" } },
      ],
    });
  }

  return { AND: conditions };
}

function buildOrderBy(query: ItemQuery): Prisma.ItemOrderByWithRelationInput {
  const sort = query.sort ?? "name";
  const order = query.order ?? "asc";

  if (sort === "assetTag") return { assetTag: order };
  if (sort === "createdAt") return { createdAt: order };
  return { name: order };
}

export async function listItems(query: ItemQuery): Promise<ListResponse<ItemView>> {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 20;
  const where = buildItemWhere(query);

  const [items, total] = await prisma.$transaction([
    prisma.item.findMany({
      where,
      select: itemSelect,
      orderBy: buildOrderBy(query),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.item.count({ where }),
  ]);

  return { data: items.map(toItemView), meta: buildMeta(total, page, pageSize) };
}

export async function getItem(id: string): Promise<ItemView> {
  const item = await prisma.item.findUnique({ where: { id }, select: itemSelect });

  if (!item) {
    throw new NotFoundError("Item not found");
  }

  return toItemView(item);
}

async function assertCategoryExists(categoryId: string): Promise<void> {
  const count = await prisma.category.count({ where: { id: categoryId } });

  if (count === 0) {
    throw new ValidationError("Category does not exist", {
      categoryId: "Category does not exist",
    });
  }
}

export async function createItem(data: CreateItemInput): Promise<ItemView> {
  await assertCategoryExists(data.categoryId);

  try {
    const item = await prisma.item.create({
      data: {
        name: data.name,
        categoryId: data.categoryId,
        brand: data.brand,
        model: data.model,
        serialNumber: data.serialNumber,
        purchaseDate: data.purchaseDate,
        notes: data.notes,
      },
      select: itemSelect,
    });

    return toItemView(item);
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new DuplicateSerialNumberError();
    }
    throw err;
  }
}

export async function updateItem(id: string, data: UpdateItemInput): Promise<ItemView> {
  const existing = await prisma.item.findUnique({ where: { id }, select: { id: true } });

  if (!existing) {
    throw new NotFoundError("Item not found");
  }

  if (data.categoryId !== undefined) {
    await assertCategoryExists(data.categoryId);
  }

  try {
    const item = await prisma.item.update({
      where: { id },
      data: {
        name: data.name,
        categoryId: data.categoryId,
        brand: data.brand,
        model: data.model,
        serialNumber: data.serialNumber,
        purchaseDate: data.purchaseDate,
        notes: data.notes,
      },
      select: itemSelect,
    });

    return toItemView(item);
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new DuplicateSerialNumberError();
    }
    if (isRecordNotFound(err)) {
      throw new NotFoundError("Item not found");
    }
    throw err;
  }
}

export async function changeItemStatus(
  id: string,
  data: ChangeItemStatusInput,
  role: Role,
): Promise<ItemView> {
  return prisma.$transaction(async (tx) => {
    const item = await tx.item.findUnique({
      where: { id },
      select: {
        status: true,
        assignments: { where: { returnedAt: null }, select: { id: true }, take: 1 },
      },
    });

    if (!item) {
      throw new NotFoundError("Item not found");
    }

    const current = effectiveStatus(item.status, item.assignments.length > 0);
    assertStatusTransition(current, data.status, role);

    const updated = await tx.item.update({
      where: { id },
      data: { status: data.status },
      select: itemSelect,
    });

    return toItemView(updated);
  });
}

export async function listItemAssignments(id: string): Promise<AssignmentView[]> {
  const item = await prisma.item.findUnique({ where: { id }, select: { id: true } });

  if (!item) {
    throw new NotFoundError("Item not found");
  }

  const rows = await prisma.assignment.findMany({
    where: { itemId: id },
    select: {
      id: true,
      assignedAt: true,
      returnedAt: true,
      note: true,
      item: { select: { id: true, assetTag: true, name: true } },
      assignedBy: { select: personSelect },
      returnedBy: { select: personSelect },
    },
    orderBy: { assignedAt: "desc" },
  });

  return rows.map((row) => ({
    id: row.id,
    assignedAt: row.assignedAt.toISOString(),
    returnedAt: row.returnedAt?.toISOString() ?? null,
    note: row.note,
    item: row.item,
    assignedBy: row.assignedBy,
    returnedBy: row.returnedBy,
  }));
}

export async function listCategories(): Promise<CategoryView[]> {
  return prisma.category.findMany({ select: categorySelect, orderBy: { name: "asc" } });
}

export async function getInventoryStats(): Promise<InventoryStatsView> {
  const [items, categories] = await prisma.$transaction([
    prisma.item.findMany({
      select: {
        status: true,
        categoryId: true,
        assignments: { where: { returnedAt: null }, select: { id: true }, take: 1 },
      },
    }),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const byStatus: Record<ItemStatusView, number> = {
    AVAILABLE: 0,
    ASSIGNED: 0,
    IN_REPAIR: 0,
    RETIRED: 0,
  };

  const perCategory = new Map<string, { total: number; assigned: number; available: number }>();
  for (const category of categories) {
    perCategory.set(category.id, { total: 0, assigned: 0, available: 0 });
  }

  for (const item of items) {
    const status = effectiveStatus(item.status, item.assignments.length > 0);
    byStatus[status] += 1;

    const bucket = perCategory.get(item.categoryId);
    if (!bucket) continue;

    bucket.total += 1;
    if (status === "ASSIGNED") bucket.assigned += 1;
    if (status === "AVAILABLE") bucket.available += 1;
  }

  return {
    total: items.length,
    byStatus,
    byCategory: categories.map((category) => ({
      ...category,
      ...(perCategory.get(category.id) ?? { total: 0, assigned: 0, available: 0 }),
    })),
  };
}
