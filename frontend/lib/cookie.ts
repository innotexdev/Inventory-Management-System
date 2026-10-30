import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/constant";

const SESSION_COOKIE_PATTERN = new RegExp(`^${SESSION_COOKIE}=([^;]*)`);

const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
} as const;

export async function forwardSessionCookie(res: Response): Promise<void> {
  for (const header of res.headers.getSetCookie()) {
    const value = SESSION_COOKIE_PATTERN.exec(header)?.[1];
    if (value) {
      (await cookies()).set(SESSION_COOKIE, decodeURIComponent(value), sessionCookieOptions);
      return;
    }
  }
}

export async function clearSessionCookie(name: string): Promise<void> {
  const store = await cookies();
  store.delete(name);
}
