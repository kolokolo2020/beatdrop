import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const COOKIE = "beatdrop_admin";

function digest(value: string) {
  return createHash("sha256").update(`beatdrop:${value}`).digest("hex");
}

export function passwordConfigured() {
  return Boolean(process.env.UPLOAD_PASSWORD);
}

export function checkPassword(attempt: string) {
  const real = process.env.UPLOAD_PASSWORD;
  if (!real) return false;
  const a = Buffer.from(digest(attempt));
  const b = Buffer.from(digest(real));
  return a.length === b.length && timingSafeEqual(a, b);
}

/** The cookie value that proves the password was given. */
export function sessionToken() {
  return digest(`session:${process.env.UPLOAD_PASSWORD ?? ""}`);
}

export async function isAdmin() {
  if (!passwordConfigured()) return false;
  const jar = await cookies();
  const value = jar.get(COOKIE)?.value;
  if (!value) return false;
  const a = Buffer.from(value);
  const b = Buffer.from(sessionToken());
  return a.length === b.length && timingSafeEqual(a, b);
}
