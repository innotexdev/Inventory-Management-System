import { cookies } from "next/headers";
import { parseSetCookie } from "next/dist/compiled/@edge-runtime/cookies";

export async function applyResponseCookies(res: Response): Promise<void> {
  const headers = res.headers.getSetCookie();
  if (headers.length === 0) {
    return;
  }
  const store = await cookies();
  for (const header of headers) {
    const parsed = parseSetCookie(header);
    if (parsed) {
      store.set(parsed);
    }
  }
}

export async function clearSessionCookie(name: string): Promise<void> {
  const store = await cookies();
  store.delete(name);
}
