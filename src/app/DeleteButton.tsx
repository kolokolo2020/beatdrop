"use client";

import { useTransition } from "react";
import { removePack } from "./actions";

export default function DeleteButton({ id, title }: { id: string; title: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className="btn danger small"
      disabled={pending}
      onClick={() => {
        if (confirm(`Delete “${title}” and its files? The link will stop working.`)) {
          start(() => removePack(id));
        }
      }}
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
