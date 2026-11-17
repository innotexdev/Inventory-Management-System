import { cookies } from "next/headers";
import { apiRequest, type TeamView } from "@/lib/api";

export async function getTeams(): Promise<TeamView[]> {
  const cookieHeader = (await cookies()).toString();
  const res = await apiRequest("/api/teams", { headers: { cookie: cookieHeader } });
  if (!res.ok) {
    throw new Error(`GET /api/teams failed with ${res.status}`);
  }
  const { data } = (await res.json()) as { data: TeamView[] };
  return data;
}
