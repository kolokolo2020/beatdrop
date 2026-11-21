import type { Metadata } from "next";
import Image from "next/image";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { LINKS, PRODUCER } from "@/lib/config";
import { getPackFromSlug } from "@/lib/getPackFromSlug";
import { packPath } from "@/lib/slug";
import Brand from "../Brand";
import photo from "../../../public/saeculo.jpg";
import Player from "./Player";

type Props = { params: Promise<{ slug: string }> };

const count = (n: number) => `${n} ${n === 1 ? "beat" : "beats"}`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pack = await getPackFromSlug((await params).slug);
  if (!pack) return { title: "Not found" };
  const title = `${pack.title} — ${PRODUCER}`;
  const description = `${count(pack.tracks.length)} by ${PRODUCER}. Listen and download.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "music.album" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PackPage({ params }: Props) {
  const { slug } = await params;
  const pack = await getPackFromSlug(slug);
  if (!pack) notFound();
  const canonical = packPath(pack);
  if (`/${slug}` !== canonical) redirect(canonical);

  const inApp = /Instagram|FBAN|FBAV/i.test((await headers()).get("user-agent") ?? "");
  const total = pack.tracks.reduce((s, t) => s + t.size, 0);
  const date = new Date(pack.createdAt).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });

  return (
    <main className="wrap pack">
      <Brand right={<a className="quiet-link" href={LINKS[0].url} target="_blank" rel="noreferrer">@{PRODUCER}</a>} />

      <section className="hero">
        <Image src={photo} alt={`${PRODUCER}`} className="cover" sizes="(max-width: 600px) 132px, 200px" priority />
        <div className="hero-text">
          <p className="eyebrow">Beat pack · {count(pack.tracks.length)}</p>
          <h1>{pack.title}</h1>
          <p className="meta mono">{PRODUCER} · {date} · {(total / 1024 / 1024).toFixed(0)} MB</p>
        </div>
      </section>

      {pack.note && <p className="note">{pack.note}</p>}

      {inApp && (
        <p className="notice">
          Instagram blocks downloads. Tap <strong>⋯</strong> at the top right, then <strong>Open in external browser</strong>.
        </p>
      )}

      <Player tracks={pack.tracks.map(({ name, url, downloadUrl, size }) => ({ name, url, downloadUrl, size }))} />

      <footer className="foot">
        <span className="mono">{PRODUCER}</span>
        <nav aria-label={`${PRODUCER} elsewhere`}>
          {LINKS.map((l) => (
            <a key={l.url} href={l.url} target="_blank" rel="noreferrer">{l.label}</a>
          ))}
        </nav>
      </footer>
    </main>
  );
}
