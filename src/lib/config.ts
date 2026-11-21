/** The producer the site belongs to. Shown on every page and in link previews. */
export const PRODUCER = process.env.PRODUCER_NAME?.trim() || "saeculo";

/** Real links, from the saeculo site's profile. Shown in the footer. */
export const LINKS = [
  { label: "Instagram", url: "https://www.instagram.com/saeculo/" },
  { label: "Spotify", url: "https://open.spotify.com/artist/20rwZAautzWKkxjkYA9sfg" },
  { label: "SoundCloud", url: "https://soundcloud.com/saeculo" },
  { label: "YouTube", url: "https://www.youtube.com/@saeculo" },
];

/**
 * How files reach Vercel Blob. A store connected the classic way gives the
 * project a BLOB_READ_WRITE_TOKEN; a newer one gives only BLOB_STORE_ID and
 * signs in with the deployment's OIDC token, which needs presigned uploads.
 * Without either, files stay on disk in .data/ (local development).
 */
export type UploadMode = "token" | "presigned" | "local";
export const UPLOAD_MODE: UploadMode = process.env.BLOB_READ_WRITE_TOKEN
  ? "token"
  : process.env.BLOB_STORE_ID
    ? "presigned"
    : "local";

/** True when files go to Vercel Blob; false means local dev storage in .data/. */
export const USE_BLOB = UPLOAD_MODE !== "local";

/** Biggest single file accepted (WAV stems can be large). */
export const MAX_FILE_BYTES = 300 * 1024 * 1024;

export const AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/vnd.wave",
  "audio/aiff",
  "audio/x-aiff",
  "audio/flac",
  "audio/x-flac",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
  "audio/ogg",
  "application/zip",
  "application/x-zip-compressed",
  "application/octet-stream",
];
