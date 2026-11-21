import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { PRODUCER } from "@/lib/config";
import { getPack } from "@/lib/packs";
import Player from "./Player";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pack = await getPack((await params).id);
  if (!pack) return { title: "Not found" };
  const title = PRODUCER ? `${pack.title} · ${PRODUCER}` : pack.title;
  const description = `${pack.tracks.length} ${pack.tracks.length === 1 ? "beat" : "beats"} to listen to and download.`;
  return { title, description, openGraph: { title, description }, twitter: { card: "summary_large_image", title, description } };
}

export default async function PackPage({ params }: Props) {
  const pack = await getPack((await params).id);
  if (!pack) notFound();
  const inApp = /Instagram|FBAN|FBAV/i.test((await headers()).get("user-agent") ?? "");
  return (
    <main className="wrap">
      {PRODUCER && <p className="eyebrow">{PRODUCER}</p>}
      <h1>{pack.title}</h1>
      {pack.note && <p className="muted" style={{ whiteSpace: "pre-line", margin: "0 0 8px" }}>{pack.note}</p>}
      <Player tracks={pack.tracks.map(({ name, url, downloadUrl, size }) => ({ name, url, downloadUrl, size }))} inApp={inApp} />
    </main>
  );
}
