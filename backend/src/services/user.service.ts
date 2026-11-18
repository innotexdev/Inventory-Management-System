import * as argon2 from "argon2";
import { prisma } from "../lib/prisma";
import type { Prisma } from "../generated/client";
import { isRecordNotFound, NotFoundError, ValidationError } from "../lib/errors";
import {
  AdminUpdateUserInput,
  UpdatePasswordInput,
  UpdateUserInput,
  UserQuery,
} from "../validation/user.validation";
import { ConflictError } from "../lib/errors";
import type { ListResponse, PageMeta, UserView } from "../types/inventory";

export const userPublicSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  teamId: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

const heldItemSelect = {
  id: true,
  assetTag: true,
  name: true,
  brand: true,
  model: true,
  serialNumber: true,
  status: true,
  category: { select: { id: true, name: true } },
} as const;

const personSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
} as const;

const userViewSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  teamId: true,
  team: { select: { id: true, name: true } },
  isActive: true,
  createdAt: true,
  _count: { select: { assignments: { where: { returnedAt: null } } } },
} as const satisfies Prisma.UserSelect;

type UserViewRecord = Prisma.UserGetPayload<{ select: typeof userViewSelect }>;

function buildMeta(total: number, page: number, pageSize: number): PageMeta {
  return { page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
}

function toUserView(row: UserViewRecord): UserView {
  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    role: row.role,
    teamId: row.teamId,
    team: row.team,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    heldItemsCount: row._count.assignments,
  };
}

export async function listUsers(query: UserQuery): Promise<ListResponse<UserView>> {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 20;
  const conditions: Prisma.UserWhereInput[] = [];

  if (query.search) {
    conditions.push({
      OR: [
        { firstName: { contains: query.search, mode: "insensitive" } },
        { lastName: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } },
      ],
    });
  }

  if (query.teamId !== undefined) {
    conditions.push({ teamId: query.teamId });
  }

  if (query.role !== undefined) {
    conditions.push({ role: query.role });
  }

  if (query.isActive !== undefined) {
    conditions.push({ isActive: query.isActive });
  }

  const where: Prisma.UserWhereInput = { AND: conditions };
  const [rows, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: userViewSelect,
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return { data: rows.map(toUserView), meta: buildMeta(total, page, pageSize) };
}

export async function getUser(id: string): Promise<UserView> {
  const row = await prisma.user.findUnique({ where: { id }, select: userViewSelect });

  if (!row) {
    throw new NotFoundError("User not found");
  }
  return toUserView(row);
}

export async function adminUpdateUser(
  actorId: string,
  targetId: string,
  data: AdminUpdateUserInput,
): Promise<UserView> {
  const target = await prisma.user.findUnique({
    where: { id: targetId },
    select: { id: true, role: true, isActive: true },
  });
  if (!target) {
    throw new NotFoundError("User not found");
  }

  if (actorId === targetId && data.role !== undefined && data.role !== target.role) {
    throw new ConflictError("You cannot change your own role");
  }
  if (actorId === targetId && data.isActive === false) {
    throw new ConflictError("You cannot deactivate yourself");
  }

  if (target.role === "ADMIN" && target.isActive) {
    const nextRole = data.role ?? target.role;
    const nextActive = data.isActive ?? target.isActive;
    if (nextRole !== "ADMIN" || !nextActive) {
      const activeAdminCount = await prisma.user.count({
        where: { role: "ADMIN", isActive: true },
      });
      if (activeAdminCount <= 1) {
        throw new ConflictError("The last active Admin cannot be demoted or deactivated");
      }
    }
  }

  if (data.isActive === false) {
    const heldCount = await prisma.assignment.count({
      where: { userId: targetId, returnedAt: null },
    });
    if (heldCount > 0) {
      throw new ConflictError("User still holds items");
    }
  }

  if (data.teamId !== undefined && data.teamId !== null) {
    const team = await prisma.team.findUnique({ where: { id: data.teamId }, select: { id: true } });
    if (!team) {
      throw new NotFoundError("Team not found");
    }
  }

  const updated = await prisma.user.update({
    where: { id: targetId },
    data,
    select: { id: true },
  });
  return getUser(updated.id);
}

export async function updateUser(userId: string, data: UpdateUserInput) {
  try {
    return await prisma.user.update({
      where: { id: userId },
      data: data,
      select: userPublicSelect,
    });
  } catch (err: unknown) {
    if (isRecordNotFound(err)) {
      throw new NotFoundError("User not found");
    }
    throw err;
  }
}

export async function changePassword(userId: string, data: UpdatePasswordInput) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, passwordHash: true },
  });

  if (!user) {
    throw new ValidationError("Invalid credentials");
  }

  const { passwordHash } = user;
  const { oldPassword, newPassword } = data;

  const isMatch = await argon2.verify(passwordHash, oldPassword);

  if (!isMatch) {
    throw new ValidationError("Invalid credentials");
  }

  const newPasswordHash = await argon2.hash(newPassword);

  return await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash },
    select: userPublicSelect,
  });
}

export async function listCurrentItemsForUser(userId: string) {
  return prisma.item.findMany({
    where: { assignments: { some: { userId, returnedAt: null } } },
    select: heldItemSelect,
    orderBy: { name: "asc" },
  });
}

export async function listAssignmentsForUser(userId: string) {
  return prisma.assignment.findMany({
    where: { userId },
    select: {
      id: true,
      assignedAt: true,
      returnedAt: true,
      note: true,
      item: { select: heldItemSelect },
      assignedBy: { select: personSelect },
      returnedBy: { select: personSelect },
    },
    orderBy: { assignedAt: "desc" },
  });
}
