import * as argon2 from "argon2";
import { prisma } from "../lib/prisma";
import type { Prisma } from "../generated/client";
import { AuthenticationError, DuplicateEmailError, isUniqueViolation } from "../lib/errors";
import { LoginInput, RegisterInput } from "../validation/auth.validation";

export const authUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  teamId: true,
  isActive: true,
  createdAt: true,
  team: { select: { id: true, name: true } },
} satisfies Prisma.UserSelect;

export async function verifyCredentials({ email, password }: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { ...authUserSelect, passwordHash: true },
  });

  if (!user || !user.isActive) {
    throw new AuthenticationError("Invalid email or password");
  }

  const { passwordHash, ...publicUser } = user;

  const isValid = await argon2.verify(passwordHash, password);
  if (!isValid) {
    throw new AuthenticationError("Invalid email or password");
  }

  return publicUser;
}

export async function register(data: RegisterInput) {
  const passwordHash = await argon2.hash(data.password);

  try {
    return await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        passwordHash,
      },
      select: authUserSelect,
    });
  } catch (err: unknown) {
    if (isUniqueViolation(err)) {
      throw new DuplicateEmailError();
    }

    throw err;
  }
}
