"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { upload, uploadPresigned } from "@vercel/blob/client";
import { nanoid } from "nanoid";
import { createPack } from "./actions";
import CopyLink from "./CopyLink";
import { newPackId, packPath } from "@/lib/slug";

type Item = { key: string; file: File; progress: number };
type Uploaded = { name: string; url: string; downloadUrl: string; size: number; pathname: string };

const cleanName = (name: string) =>
  name.replace(/[\\/#?%*:|"<>\u0000-\u001f]/g, "_").trim() || "beat";

export const prettySize = (bytes: number) =>
  bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

function localUpload(file: File, pathname: string, onProgress: (p: number) => void) {
  return new Promise<Uploaded>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/local");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () =>
      xhr.status === 200
        ? resolve({ ...JSON.parse(xhr.responseText), name: file.name, size: file.size })
        : reject(new Error(xhr.responseText || "Upload failed"));
    xhr.onerror = () => reject(new Error("Upload failed"));
    const form = new FormData();
    form.append("file", file);
    form.append("pathname", pathname);
    xhr.send(form);
  });
}

export default function Uploader({ mode }: { mode: "token" | "presigned" | "local" }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ path: string; title: string } | null>(null);

  function add(files: FileList | null) {
    if (!files) return;
    const next = Array.from(files)
      .filter((f) => f.type.startsWith("audio/") || /\.(mp3|wav|aiff?|flac|m4a|ogg|zip)$/i.test(f.name))
      .map((file) => ({ key: nanoid(6), file, progress: 0 }));
    setItems((prev) => [...prev, ...next]);
    setDone(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!items.length || busy) return;
    setBusy(true);
    setError("");
    const id = newPackId();
    const packTitle = title.trim() || "Beats";
    try {
      const uploaded: Uploaded[] = [];
      for (const item of items) {
        const pathname = `audio/${id}/${nanoid(6)}/${cleanName(item.file.name)}`;
        const setProgress = (p: number) =>
          setItems((prev) => prev.map((x) => (x.key === item.key ? { ...x, progress: p } : x)));
        if (mode !== "local") {
          const send = mode === "presigned" ? uploadPresigned : upload;
          const blob = await send(pathname, item.file, {
            access: "public",
            handleUploadUrl: "/api/upload",
            // Presigned uploads go up as one request; token uploads split big files.
            multipart: mode === "token" && item.file.size > 20 * 1024 * 1024,
            contentType: item.file.type || undefined,
            onUploadProgress: ({ percentage }) => setProgress(percentage / 100),
          });
          uploaded.push({
            name: item.file.name,
            url: blob.url,
            downloadUrl: blob.downloadUrl,
            size: item.file.size,
            pathname: blob.pathname,
          });
        } else {
          uploaded.push(await localUpload(item.file, pathname, setProgress));
        }
        setProgress(1);
      }
      await createPack({ id, title: packTitle, note, tracks: uploaded });
      setDone({ path: packPath({ id, title: packTitle }), title: packTitle });
      setItems([]);
      setTitle("");
      setNote("");
      router.refresh();
    } catch (err) {
      setError((err as Error).message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="panel stack" aria-label="New pack">
      <h2>New pack</h2>
      <label className="field">
        <span>Name (the artist sees this)</span>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. sum new beats – november" maxLength={120} />
      </label>
      <label className="field">
        <span>Note (optional)</span>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Tagged versions. Hit me up for the untagged ones." maxLength={1000} />
      </label>
      <label
        className={`drop${over ? " over" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); add(e.dataTransfer.files); }}
      >
        <input ref={input} type="file" multiple accept="audio/*,.mp3,.wav,.aif,.aiff,.flac,.m4a,.zip" onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
        <strong>Drop beats here</strong>
        <span className="muted small" style={{ display: "block" }}>or tap to choose · MP3, WAV, FLAC, ZIP</span>
      </label>
      {items.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }} className="stack">
          {items.map((item) => (
            <li key={item.key}>
              <div className="spread">
                <span style={{ overflowWrap: "anywhere" }}>{item.file.name}</span>
                <span className="row">
                  <span className="muted small mono">{prettySize(item.file.size)}</span>
                  {!busy && (
                    <button type="button" className="btn small" aria-label={`Remove ${item.file.name}`}
                      onClick={() => setItems((prev) => prev.filter((x) => x.key !== item.key))}>×</button>
                  )}
                </span>
              </div>
              {busy && <div className="bar" style={{ marginTop: 6 }}><i style={{ width: `${Math.round(item.progress * 100)}%` }} /></div>}
            </li>
          ))}
        </ul>
      )}
      {error && <p className="error" role="alert">{error}</p>}
      <button className="btn primary" disabled={!items.length || busy}>
        {busy ? "Uploading…" : `Upload ${items.length || ""} ${items.length === 1 ? "beat" : "beats"} and make link`}
      </button>
      {done && (
        <div className="spread" role="status" style={{ borderTop: "1px solid var(--line)", paddingTop: 12 }}>
          <span>“{done.title}” is ready.</span>
          <span className="row">
            <a className="btn small" href={done.path} target="_blank" rel="noreferrer">Open</a>
            <CopyLink path={done.path} />
          </span>
        </div>
      )}
    </form>
  );
}
