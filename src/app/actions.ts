"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { COOKIE, checkPassword, isAdmin, sessionToken } from "@/lib/auth";
import { deletePack, isValidId, savePack, type Track } from "@/lib/packs";

export async function login(_: string | null, form: FormData) {
  const attempt = String(form.get("password") ?? "");
  if (!checkPassword(attempt)) return "Wrong password.";
  const jar = await cookies();
  jar.set(COOKIE, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
  redirect("/");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(COOKIE);
  redirect("/");
}

export async function createPack(input: {
  id: string;
  title: string;
  note: string;
  tracks: Track[];
}) {
  if (!(await isAdmin())) throw new Error("Not signed in.");
  if (!isValidId(input.id)) throw new Error("Bad pack id.");
  const tracks = input.tracks.filter(
    (t) =>
      typeof t.url === "string" &&
      t.pathname.startsWith(`audio/${input.id}/`),
  );
  if (!tracks.length) throw new Error("No files uploaded.");
  await savePack({
    id: input.id,
    title: input.title.trim().slice(0, 120) || "Beats",
    note: input.note.trim().slice(0, 1000) || undefined,
    createdAt: new Date().toISOString(),
    tracks: tracks.map((t) => ({
      name: String(t.name).slice(0, 200),
      url: t.url,
      downloadUrl: t.downloadUrl,
      size: Number(t.size) || 0,
      pathname: t.pathname,
    })),
  });
  revalidatePath("/");
}

export async function removePack(id: string) {
  if (!(await isAdmin())) throw new Error("Not signed in.");
  await deletePack(id);
  revalidatePath("/");
}
