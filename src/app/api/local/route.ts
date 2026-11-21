import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { USE_BLOB } from "@/lib/config";
import { localFile } from "@/lib/packs";

/**
 * Local development stand-in for Vercel Blob, used only when
 * BLOB_READ_WRITE_TOKEN isn't set. POST stores a file, GET serves it.
 */
export async function POST(request: Request) {
  if (USE_BLOB) return new NextResponse("Not found", { status: 404 });
  if (!(await isAdmin())) return new NextResponse("Not signed in.", { status: 401 });
  const form = await request.formData();
  const file = form.get("file");
  const pathname = String(form.get("pathname") ?? "");
  const target = localFile(pathname);
  if (!(file instanceof File) || !target) {
    return new NextResponse("Bad upload.", { status: 400 });
  }
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, Buffer.from(await file.arrayBuffer()));
  const url = `/api/local?path=${encodeURIComponent(pathname)}`;
  return NextResponse.json({ url, downloadUrl: `${url}&download=1`, pathname });
}

export async function GET(request: Request) {
  if (USE_BLOB) return new NextResponse("Not found", { status: 404 });
  const params = new URL(request.url).searchParams;
  const pathname = params.get("path") ?? "";
  const target = localFile(pathname);
  if (!target) return new NextResponse("Not found", { status: 404 });
  try {
    const data = await fs.readFile(target);
    const name = path.basename(target);
    const headers: Record<string, string> = {
      "content-type": name.toLowerCase().endsWith(".wav") ? "audio/wav" : "audio/mpeg",
      "accept-ranges": "bytes",
    };
    if (params.has("download")) {
      headers["content-disposition"] = `attachment; filename*=UTF-8''${encodeURIComponent(name)}`;
    }
    return new NextResponse(data, { headers });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
