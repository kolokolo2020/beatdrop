import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { AUDIO_TYPES, MAX_FILE_BYTES } from "@/lib/config";

/** Hands the browser a short-lived token so it can send files straight to Blob. */
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!(await isAdmin())) throw new Error("Not signed in.");
        if (!/^audio\/[A-Za-z0-9_-]{6,32}\/[^/]+\/[^/]+$/.test(pathname)) {
          throw new Error("Bad path.");
        }
        return {
          allowedContentTypes: AUDIO_TYPES,
          maximumSizeInBytes: MAX_FILE_BYTES,
          addRandomSuffix: false,
        };
      },
      // Pack metadata is saved by the uploader once every file is in.
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}
