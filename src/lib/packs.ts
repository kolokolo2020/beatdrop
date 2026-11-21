import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { del, list, put } from "@vercel/blob";
import { USE_BLOB } from "./config";

export type Track = {
  name: string;
  /** Streamable URL. */
  url: string;
  /** URL that makes the browser save the file. */
  downloadUrl: string;
  size: number;
  /** Storage path, used to delete it. */
  pathname: string;
};

export type Pack = {
  id: string;
  title: string;
  note?: string;
  createdAt: string;
  tracks: Track[];
};

const LOCAL_ROOT = path.join(process.cwd(), ".data");

export const isValidId = (id: string) => /^[A-Za-z0-9_-]{6,32}$/.test(id);

const jsonPath = (id: string) => `packs/${id}.json`;

export async function savePack(pack: Pack) {
  const body = JSON.stringify(pack);
  if (USE_BLOB) {
    await put(jsonPath(pack.id), body, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: 60,
    });
    return;
  }
  const file = path.join(LOCAL_ROOT, jsonPath(pack.id));
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, body);
}

export async function getPack(id: string): Promise<Pack | null> {
  if (!isValidId(id)) return null;
  if (USE_BLOB) {
    const { blobs } = await list({ prefix: jsonPath(id), limit: 1 });
    const blob = blobs.find((b) => b.pathname === jsonPath(id));
    if (!blob) return null;
    const res = await fetch(`${blob.url}?v=${blob.uploadedAt.getTime()}`, {
      cache: "no-store",
    });
    return res.ok ? ((await res.json()) as Pack) : null;
  }
  try {
    const raw = await fs.readFile(path.join(LOCAL_ROOT, jsonPath(id)), "utf8");
    return JSON.parse(raw) as Pack;
  } catch {
    return null;
  }
}

export async function listPacks(): Promise<Pack[]> {
  let ids: string[] = [];
  if (USE_BLOB) {
    let cursor: string | undefined;
    do {
      const page = await list({ prefix: "packs/", cursor, limit: 1000 });
      ids.push(...page.blobs.map((b) => b.pathname.slice(6, -5)));
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
  } else {
    try {
      const files = await fs.readdir(path.join(LOCAL_ROOT, "packs"));
      ids = files.filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5));
    } catch {
      ids = [];
    }
  }
  const packs = await Promise.all(ids.filter(isValidId).map(getPack));
  return packs
    .filter((p): p is Pack => p !== null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function deletePack(id: string) {
  const pack = await getPack(id);
  if (!pack) return;
  if (USE_BLOB) {
    const { blobs } = await list({ prefix: `audio/${id}/` });
    const urls = blobs.map((b) => b.url);
    if (urls.length) await del(urls);
    const { blobs: meta } = await list({ prefix: jsonPath(id), limit: 1 });
    if (meta.length) await del(meta.map((b) => b.url));
    return;
  }
  await fs.rm(path.join(LOCAL_ROOT, "audio", id), { recursive: true, force: true });
  await fs.rm(path.join(LOCAL_ROOT, jsonPath(id)), { force: true });
}

/** Local dev only: where an uploaded file lives on disk. */
export function localFile(pathname: string) {
  const file = path.normalize(path.join(LOCAL_ROOT, pathname));
  if (!file.startsWith(path.join(LOCAL_ROOT, "audio") + path.sep)) return null;
  return file;
}
