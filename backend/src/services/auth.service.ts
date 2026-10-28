import * as argon2 from "argon2";
import { prisma } from "../lib/prisma";
import { AuthenticationError, DuplicateEmailError, toHttpError } from "../lib/errors";
import { parseLoginInput, parseRegisterInput } from "../validation/auth.validation";

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
} as const;

export async function verifyCredentials(input: unknown) {
  const { email, password } = parseLoginInput(input);

  const user = await prisma.user.findUnique({
    where: { email },
    select: { ...authUserSelect, passwordHash: true },
  });

  if (!user || !user.isActive) {
    throw new AuthenticationError("Invalid email or password");
  }

  const ok = await argon2.verify(user.passwordHash, password);
  if (!ok) {
    throw new AuthenticationError("Invalid email or password");
  }

  const { passwordHash, ...publicUser } = user;
  void passwordHash;
  return publicUser;
}

export async function register(input: unknown) {
  const data = parseRegisterInput(input);

  const existing = await prisma.user.findFirst({
    where: { email: { equals: data.email, mode: "insensitive" } },
    select: { id: true },
  });
  if (existing) {
    throw DuplicateEmailError();
  }

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
    if (toHttpError(err)) {
      throw DuplicateEmailError();
    }
    throw err;
  }
}
