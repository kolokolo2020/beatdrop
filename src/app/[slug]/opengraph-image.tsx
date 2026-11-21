import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PRODUCER } from "@/lib/config";
import { getPackFromSlug } from "@/lib/getPackFromSlug";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Beats to listen to and download";

const photo = readFile(join(process.cwd(), "assets/saeculo-og.jpg"), "base64");

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const pack = await getPackFromSlug((await params).slug);
  const title = pack?.title ?? "Beats";
  const n = pack?.tracks.length ?? 0;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f4efe4", color: "#1b1916" }}>
        <img src={`data:image/jpeg;base64,${await photo}`} width={630} height={630} alt="" />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, flex: 1 }}>
          <div style={{ fontSize: 30, letterSpacing: 4, textTransform: "uppercase", color: "#6b6357" }}>{PRODUCER}</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: title.length > 24 ? 56 : 72, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>{title.slice(0, 60)}</div>
            <div style={{ display: "flex", marginTop: 28, fontSize: 30, color: "#6b6357" }}>
              {n} {n === 1 ? "beat" : "beats"} · listen & download
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 44 }}>
            {[18, 34, 26, 44, 14, 30, 40, 22, 36, 16, 28, 42].map((h, i) => (
              <div key={i} style={{ width: 10, height: h, background: i < 5 ? "#d9452b" : "#c9bfae", borderRadius: 2 }} />
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
