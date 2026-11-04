import { env } from "@/config";

export type Role = "EMPLOYEE" | "MANAGER" | "ADMIN";

export type ItemStatus = "AVAILABLE" | "ASSIGNED" | "IN_REPAIR" | "RETIRED";

export interface CurrentUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  teamId: string | null;
  isActive: boolean;
  createdAt: string;
  team: { id: string; name: string } | null;
}

export interface ItemCategory {
  id: string;
  name: string;
}

export interface HeldItem {
  id: string;
  assetTag: string;
  name: string;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  status: ItemStatus;
  category: ItemCategory;
}

export interface AssignmentPerson {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface UserAssignment {
  id: string;
  assignedAt: string;
  returnedAt: string | null;
  note: string | null;
  item: HeldItem;
  assignedBy: AssignmentPerson;
  returnedBy: AssignmentPerson | null;
}

interface ApiErrorBody {
  error?: {
    code?: string;
    message?: string;
    fields?: Record<string, string>;
  };
}

export interface ApiErrorDetail {
  message: string;
  fields?: Record<string, string>;
}

function apiUrl(path: string): string {
  const base = env.NEXT_PUBLIC_API_URL;
  return `${base}${path}`;
}

export async function apiRequest(path: string, init?: RequestInit): Promise<Response> {
  return fetch(apiUrl(path), {
    ...init,
    cache: "no-store",
    headers: { "content-type": "application/json", ...init?.headers },
  });
}

export async function readApiError(res: Response): Promise<ApiErrorDetail> {
  try {
    const body = (await res.json()) as ApiErrorBody & { message?: string };
    const message =
      (typeof body?.error === "object" ? body?.error?.message : undefined) ??
      (typeof body?.error === "string" ? body.error : undefined) ??
      (typeof body?.message === "string" ? body.message : undefined) ??
      "Request failed";
    const fields = typeof body?.error === "object" ? body?.error?.fields : undefined;
    return {
      message,
      fields,
    };
  } catch {
    return { message: "Request failed" };
  }
}
