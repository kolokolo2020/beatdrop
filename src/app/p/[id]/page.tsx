import { notFound, permanentRedirect } from "next/navigation";
import { getPack } from "@/lib/packs";
import { packPath } from "@/lib/slug";

/** Old /p/<id> links go to the pack's clean address. */
export default async function OldPackLink({ params }: { params: Promise<{ id: string }> }) {
  const pack = await getPack((await params).id);
  if (!pack) notFound();
  permanentRedirect(packPath(pack));
}
