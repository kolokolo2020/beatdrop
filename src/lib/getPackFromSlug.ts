import "server-only";
import { cache } from "react";
import { getPack } from "./packs";

/**
 * "sum-new-beats-k3x9q2ma" → the pack with id "k3x9q2ma". Packs made before
 * clean links have 10-character ids that may contain "-" or "_", so the last
 * 10 characters and the whole slug are tried too.
 */
export const getPackFromSlug = cache(async (slug: string) => {
  const tail = slug.slice(slug.lastIndexOf("-") + 1);
  return (
    (await getPack(tail)) ??
    (slug.length > 10 && slug[slug.length - 11] === "-" ? await getPack(slug.slice(-10)) : null) ??
    (await getPack(slug))
  );
});
