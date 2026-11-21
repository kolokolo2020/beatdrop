import "server-only";
import { cache } from "react";
import { getPack } from "./packs";

/** "sum-new-beats-k3x9q2ma" → the pack with id "k3x9q2ma". */
export const getPackFromSlug = cache(async (slug: string) => {
  const tail = slug.slice(slug.lastIndexOf("-") + 1);
  return (await getPack(tail)) ?? (await getPack(slug));
});
