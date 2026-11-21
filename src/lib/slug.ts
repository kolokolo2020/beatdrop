import { customAlphabet } from "nanoid";

/** Pack ids: 8 lowercase letters and digits, e.g. "k3x9q2ma". */
export const newPackId = customAlphabet("abcdefghijkmnpqrstuvwxyz23456789", 8);

export function slugify(title: string) {
  return title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
}

/** The share link path for a pack: /sum-new-beats-k3x9q2ma */
export function packPath(pack: { id: string; title: string }) {
  const slug = slugify(pack.title);
  return slug ? `/${slug}-${pack.id}` : `/${pack.id}`;
}
