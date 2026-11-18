import { prisma } from "../lib/prisma";
import { ConflictError, NotFoundError } from "../lib/errors";

export interface TeamView {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
  heldItemsCount: number;
  members: Array<{
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
    heldItemsCount: number;
  }>;
}

export async function listTeams(): Promise<TeamView[]> {
  const teams = await prisma.team.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      members: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          _count: { select: { assignments: { where: { returnedAt: null } } } },
        },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      },
    },
    orderBy: { name: "asc" },
  });

  return teams.map((team) => ({
    id: team.id,
    name: team.name,
    description: team.description,
    memberCount: team.members.length,
    heldItemsCount: team.members.reduce((total, member) => total + member._count.assignments, 0),
    members: team.members.map((member) => ({
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      role: member.role,
      isActive: member.isActive,
      heldItemsCount: member._count.assignments,
    })),
  }));
}

export async function createTeam(data: { name: string; description?: string | null }) {
  try {
    return await prisma.team.create({ data, select: { id: true, name: true, description: true } });
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "code" in err && err.code === "P2002") {
      throw new ConflictError("Team name is already in use", {
        name: "Team name is already in use",
      });
    }
    throw err;
  }
}

export async function updateTeam(id: string, data: { name?: string; description?: string | null }) {
  try {
    return await prisma.team.update({
      where: { id },
      data,
      select: { id: true, name: true, description: true },
    });
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "code" in err && err.code === "P2002") {
      throw new ConflictError("Team name is already in use", {
        name: "Team name is already in use",
      });
    }
    if (typeof err === "object" && err !== null && "code" in err && err.code === "P2025") {
      throw new NotFoundError("Team not found");
    }
    throw err;
  }
}

export async function deleteTeam(id: string) {
  const team = await prisma.team.findUnique({
    where: { id },
    select: { _count: { select: { members: true } } },
  });
  if (!team) {
    throw new NotFoundError("Team not found");
  }
  if (team._count.members > 0) {
    throw new ConflictError("Team still has members");
  }
  await prisma.team.delete({ where: { id } });
}
