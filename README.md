# beatdrop

Upload a few beats, get a link, send it to an artist. They can play every beat
and download it (one by one or all at once). No account needed on their side.

- `/` — your upload page (password protected): name the pack, add a note,
  drop in MP3/WAV/FLAC/ZIP files, get a link to copy. Lists your packs with
  Copy link and Delete.
- `/<pack-name>-<id>` — the page you send, e.g. `/beats-for-vee-k3x9q2ma`. The
  id is random, so only people with the link find it. Old `/p/<id>` links
  redirect there. Inside Instagram's in-app browser it tells them to open it in their
  real browser, since Instagram blocks downloads.

## Settings (Vercel → Project → Settings → Environment Variables)

| Variable | |
| --- | --- |
| `UPLOAD_PASSWORD` | Required. The password for the upload page. |
| `BLOB_STORE_ID` or `BLOB_READ_WRITE_TOKEN` | Set automatically when a Vercel Blob store is connected to the project (newer stores give only `BLOB_STORE_ID` and sign in with OIDC; uploads then use presigned URLs). |
| `PRODUCER_NAME` | Optional, defaults to `saeculo`. Shown on every page and in link previews. |

Without either (local dev) files are kept in `.data/`.

## Develop

```bash
UPLOAD_PASSWORD=test npm run dev
```

The photo is `public/saeculo.jpg` (avatar and cover), `assets/saeculo-og.jpg`
(link previews) and `src/app/icon.png` / `apple-icon.png` (browser icons).
