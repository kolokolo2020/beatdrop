import { ImageResponse } from "next/og";
import { PRODUCER } from "@/lib/config";
import { getPack } from "@/lib/packs";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Beats to listen to and download";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const pack = await getPack((await params).id);
  const title = pack?.title ?? "Beats";
  const count = pack?.tracks.length ?? 0;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#0d0d0c", color: "#f2f0ea" }}>
        <div style={{ fontSize: 30, color: "#9a978d", letterSpacing: 2, textTransform: "uppercase" }}>{PRODUCER || "beats"}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 88, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>{title.slice(0, 60)}</div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 28, fontSize: 34 }}>
            <div style={{ display: "flex", background: "#e8ff5a", color: "#0d0d0c", borderRadius: 999, padding: "10px 28px", fontWeight: 700 }}>
              ▶ {count} {count === 1 ? "beat" : "beats"} · listen & download
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
