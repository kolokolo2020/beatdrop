"use client";

import { useRef, useState } from "react";

type Track = { name: string; url: string; downloadUrl: string; size: number };

const title = (name: string) => name.replace(/\.[a-z0-9]{2,4}$/i, "");
const ext = (name: string) => (name.match(/\.([a-z0-9]{2,4})$/i)?.[1] ?? "").toUpperCase();
const mb = (b: number) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
const clock = (s: number) => (Number.isFinite(s) && s > 0 ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00");
const playable = (t: Track) => !/\.zip$/i.test(t.name);

const Icon = {
  play: <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11a.7.7 0 0 0 1.05.6l9-5.5a.7.7 0 0 0 0-1.2l-9-5.5A.7.7 0 0 0 4 2.5z" fill="currentColor" /></svg>,
  pause: <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="2" width="3.5" height="12" rx="1" fill="currentColor" /><rect x="9.5" y="2" width="3.5" height="12" rx="1" fill="currentColor" /></svg>,
  prev: <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="3" width="2" height="10" rx="1" fill="currentColor" /><path d="M14 3.6v8.8a.6.6 0 0 1-.92.5L6.5 8.5a.6.6 0 0 1 0-1l6.58-4.4a.6.6 0 0 1 .92.5z" fill="currentColor" /></svg>,
  next: <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><rect x="12" y="3" width="2" height="10" rx="1" fill="currentColor" /><path d="M2 3.6v8.8a.6.6 0 0 0 .92.5L9.5 8.5a.6.6 0 0 0 0-1L2.92 3.1a.6.6 0 0 0-.92.5z" fill="currentColor" /></svg>,
  down: <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v8m0 0L4.5 6.5M8 10l3.5-3.5M3 13.5h10" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>,
};

function Bars() {
  return <span className="bars" aria-hidden="true"><i /><i /><i /></span>;
}

export default function Player({ tracks }: { tracks: Track[] }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [current, setCurrent] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const [dur, setDur] = useState(0);

  const order = tracks.map((t, i) => (playable(t) ? i : -1)).filter((i) => i >= 0);

  function start(i: number) {
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

  function step(dir: 1 | -1) {
    if (current === null) return;
    if (dir === -1 && pos > 3 && audio.current) {
      audio.current.currentTime = 0;
      return;
    }
    const at = order.indexOf(current) + dir;
    if (at >= 0 && at < order.length) start(order[at]);
    else if (dir === 1) setPlaying(false);
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

  const now = current !== null ? tracks[current] : null;
  const pct = dur ? (pos / dur) * 100 : 0;

  return (
    <>
      <div className="actions">
        {order.length > 0 && (
          <button type="button" className="btn primary" onClick={() => (current === null ? start(order[0]) : start(current))}>
            {playing ? Icon.pause : Icon.play} {playing ? "Pause" : current === null ? "Play all" : "Resume"}
          </button>
        )}
        <button type="button" className="btn" onClick={downloadAll}>
          {Icon.down} {tracks.length > 1 ? `Download all (${tracks.length})` : "Download"}
        </button>
      </div>

      <ol className="tracks">
        {tracks.map((t, i) => {
          const active = current === i;
          return (
            <li key={t.url} className={`track${active ? " active" : ""}`}>
              {playable(t) ? (
                <button
                  type="button"
                  className="track-main"
                  onClick={() => start(i)}
                  aria-pressed={active && playing}
                >
                  <span className="sr-only">{active && playing ? "Pause" : "Play"} </span>
                  <span className="num mono">
                    {active && playing ? <Bars /> : <><span className="n">{String(i + 1).padStart(2, "0")}</span><span className="p">{Icon.play}</span></>}
                  </span>
                  <span className="track-text">
                    <span className="track-title">{title(t.name)}</span>
                    <span className="track-meta mono">{ext(t.name)} · {mb(t.size)}</span>
                  </span>
                  {active && <span className="track-time mono">{clock(pos)}</span>}
                </button>
              ) : (
                <div className="track-main">
                  <span className="num mono">{String(i + 1).padStart(2, "0")}</span>
                  <span className="track-text">
                    <span className="track-title">{title(t.name)}</span>
                    <span className="track-meta mono">{ext(t.name)} · {mb(t.size)}</span>
                  </span>
                </div>
              )}
              <a className="icon-btn" href={t.downloadUrl} download={t.name} aria-label={`Download ${title(t.name)}`} title="Download">
                {Icon.down}
              </a>
            </li>
          );
        })}
      </ol>

      {now && (
        <div className="dock" role="region" aria-label="Now playing">
          <input
            type="range"
            className="seek"
            min={0}
            max={dur || 0}
            step={0.1}
            value={pos}
            onChange={(e) => { const v = Number(e.target.value); setPos(v); if (audio.current) audio.current.currentTime = v; }}
            aria-label={`Seek in ${title(now.name)}`}
            style={{ ["--p" as string]: `${pct}%` }}
          />
          <div className="dock-row">
            <div className="dock-text">
              <span className="track-title">{title(now.name)}</span>
              <span className="track-meta mono">{clock(pos)} / {clock(dur)}</span>
            </div>
            <div className="dock-controls">
              <button type="button" className="icon-btn" onClick={() => step(-1)} aria-label="Previous">{Icon.prev}</button>
              <button type="button" className="icon-btn big" onClick={() => start(current!)} aria-label={playing ? "Pause" : "Play"}>{playing ? Icon.pause : Icon.play}</button>
              <button type="button" className="icon-btn" onClick={() => step(1)} aria-label="Next">{Icon.next}</button>
            </div>
          </div>
        </div>
      )}

      <audio
        ref={audio}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setPos(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
        onDurationChange={(e) => setDur(e.currentTarget.duration)}
        onEnded={() => step(1)}
      />
    </>
  );
}
