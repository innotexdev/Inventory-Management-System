import { cookies } from "next/headers";

const SESSION_COOKIE = "sid";
const SESSION_COOKIE_PATTERN = new RegExp(`^${SESSION_COOKIE}=([^;]*)`);
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
} as const;

export async function forwardSessionCookie(res: Response): Promise<void> {
  const setCookies =
    typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
  const rawHeader = res.headers.get("set-cookie");
  const headers = setCookies.length > 0 ? setCookies : rawHeader ? [rawHeader] : [];

  for (const header of headers) {
    const value = SESSION_COOKIE_PATTERN.exec(header)?.[1];
    if (value) {
      (await cookies()).set(SESSION_COOKIE, decodeURIComponent(value), {
        ...sessionCookieOptions,
        maxAge: SESSION_MAX_AGE_SECONDS,
      });
      return;
    }
  }
}

export async function deleteSessionCookie(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
