"use client";

import { useRef, useState } from "react";

type Track = { name: string; url: string; downloadUrl: string; size: number };

const display = (name: string) => name.replace(/\.[a-z0-9]{2,4}$/i, "");
const ext = (name: string) => (name.match(/\.([a-z0-9]{2,4})$/i)?.[1] ?? "").toUpperCase();
const size = (b: number) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
const time = (s: number) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00");
const isPlayable = (name: string) => !/\.zip$/i.test(name);

function PlayIcon({ playing }: { playing: boolean }) {
  return playing ? (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="2" width="3.5" height="12" rx="1" fill="currentColor" /><rect x="9.5" y="2" width="3.5" height="12" rx="1" fill="currentColor" /></svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11a.7.7 0 0 0 1.05.6l9-5.5a.7.7 0 0 0 0-1.2l-9-5.5A.7.7 0 0 0 4 2.5z" fill="currentColor" /></svg>
  );
}

function DownloadIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v8m0 0L4.5 6.5M8 10l3.5-3.5M3 13.5h10" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function Player({ tracks, inApp }: { tracks: Track[]; inApp: boolean }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [current, setCurrent] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const [dur, setDur] = useState(0);

  function toggle(i: number) {
    const el = audio.current;
    if (!el) return;
    if (current === i) {
      if (el.paused) void el.play(); else el.pause();
      return;
    }
    setCurrent(i);
    setPos(0);
    setDur(0);
    el.src = tracks[i].url;
    void el.play();
  }

  function next() {
    if (current === null) return;
    for (let i = current + 1; i < tracks.length; i++) {
      if (isPlayable(tracks[i].name)) return toggle(i);
    }
    setPlaying(false);
  }

  function downloadAll() {
    tracks.forEach((t, i) => {
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = t.downloadUrl;
        a.download = t.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }, i * 700);
    });
  }

  return (
    <>
      {inApp && (
        <p className="panel small" style={{ margin: "16px 0 0" }}>
          Downloads don’t work inside Instagram. Tap <strong>⋯</strong> at the top right and choose <strong>Open in external browser</strong>.
        </p>
      )}
      <div className="row" style={{ margin: "20px 0 16px" }}>
        {tracks.length > 1 && (
          <button type="button" className="btn primary" onClick={downloadAll}>
            <DownloadIcon /> Download all ({tracks.length})
          </button>
        )}
        <span className="muted small">{tracks.length} {tracks.length === 1 ? "file" : "files"} · {size(tracks.reduce((s, t) => s + t.size, 0))}</span>
      </div>

      <ol className="tracks" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {tracks.map((t, i) => {
          const active = current === i;
          const playable = isPlayable(t.name);
          return (
            <li key={t.url} className="panel" style={{ marginBottom: 8, borderColor: active ? "var(--muted)" : undefined }}>
              <div className="spread">
                <div className="row" style={{ minWidth: 0, flexWrap: "nowrap" }}>
                  {playable ? (
                    <button
                      type="button"
                      className="btn"
                      style={{ width: 44, padding: 0, flex: "none", ...(active && playing ? { background: "var(--accent)", color: "var(--accent-text)", borderColor: "var(--accent)" } : {}) }}
                      aria-label={`${active && playing ? "Pause" : "Play"} ${display(t.name)}`}
                      aria-pressed={active && playing}
                      onClick={() => toggle(i)}
                    >
                      <PlayIcon playing={active && playing} />
                    </button>
                  ) : (
                    <span className="mono small muted" style={{ width: 44, textAlign: "center", flex: "none" }}>ZIP</span>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, overflowWrap: "anywhere" }}>{display(t.name)}</div>
                    <div className="muted small mono">{ext(t.name)} · {size(t.size)}</div>
                  </div>
                </div>
                <a className="btn small" href={t.downloadUrl} download={t.name} aria-label={`Download ${display(t.name)}`}>
                  <DownloadIcon /> <span className="dl-label">Download</span>
                </a>
              </div>
              {active && (
                <div style={{ marginTop: 12 }}>
                  <input
                    type="range"
                    min={0}
                    max={dur || 0}
                    step={0.1}
                    value={pos}
                    onChange={(e) => { const v = Number(e.target.value); setPos(v); if (audio.current) audio.current.currentTime = v; }}
                    aria-label={`Seek in ${display(t.name)}`}
                    className="seek"
                    style={{ ["--p" as string]: `${dur ? (pos / dur) * 100 : 0}%` }}
                  />
                  <div className="spread muted small mono"><span>{time(pos)}</span><span>{time(dur)}</span></div>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <audio
        ref={audio}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setPos(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
        onEnded={next}
      />
    </>
  );
}
