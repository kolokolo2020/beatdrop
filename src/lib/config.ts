/** Shown at the top of every pack page and in link previews. Optional. */
export const PRODUCER = process.env.PRODUCER_NAME?.trim() || "";

/** True when files go to Vercel Blob; false means local dev storage in .data/. */
export const USE_BLOB = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

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
