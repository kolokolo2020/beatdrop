"use client";

import { useState } from "react";

export default function CopyLink({ path, site, label = "Copy link" }: { path: string; site?: string; label?: string }) {
  const [done, setDone] = useState(false);
  async function copy() {
    const url = new URL(path, site || window.location.origin).toString();
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy this link:", url);
    }
    setDone(true);
    setTimeout(() => setDone(false), 1800);
  }
  return (
    <button type="button" className="btn primary small" onClick={copy} aria-live="polite">
      {done ? "Copied" : label}
    </button>
  );
}
