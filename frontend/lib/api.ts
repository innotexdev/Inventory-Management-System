import { env } from "@/config";

export type Role = "EMPLOYEE" | "MANAGER" | "ADMIN";

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

export interface ApiErrorBody {
  error?: {
    code?: string;
    message?: string;
    fields?: Record<string, string>;
  };
}

export interface ApiErrorDetail {
  message: string;
  code: string;
  fields?: Record<string, string>;
}

export function apiUrl(path: string): string {
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
    const body = (await res.json()) as ApiErrorBody;
    return {
      message: body.error?.message ?? "Request failed",
      code: body.error?.code ?? "UNKNOWN",
      fields: body.error?.fields,
    };
  } catch {
    return { message: "Request failed", code: "UNKNOWN" };
  }
}
