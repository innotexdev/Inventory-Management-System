import { prisma } from "../lib/prisma";

export async function listTeams(): Promise<Array<{ id: string; name: string }>> {
  return prisma.team.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
}
