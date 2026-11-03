import * as argon2 from "argon2";
import { prisma } from "../lib/prisma";
import { isRecordNotFound, NotFoundError, ValidationError } from "../lib/errors";
import { UpdatePasswordInput, UpdateUserInput } from "../validation/user.validation";

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
