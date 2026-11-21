import {
  handleUpload,
  handleUploadPresigned,
  type HandleUploadBody,
  type HandleUploadPresignedBody,
} from "@vercel/blob/client";
import { issueSignedToken } from "@vercel/blob";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { AUDIO_TYPES, MAX_FILE_BYTES, UPLOAD_MODE } from "@/lib/config";

const PATH = /^audio\/[A-Za-z0-9_-]{6,32}\/[^/]+\/[^/]+$/;

async function check(pathname: string) {
  if (!(await isAdmin())) throw new Error("Not signed in.");
  if (!PATH.test(pathname)) throw new Error("Bad path.");
}

/**
 * Lets the browser send a file straight to Vercel Blob (files never pass
 * through this function, so there's no size limit from it).
 */
export async function POST(request: Request) {
  try {
    if (UPLOAD_MODE === "presigned") {
      const body = (await request.json()) as HandleUploadPresignedBody;
      const result = await handleUploadPresigned({
        body,
        request,
        getSignedToken: async (pathname) => {
          await check(pathname);
          const token = await issueSignedToken({
            pathname,
            operations: ["put"],
            allowedContentTypes: AUDIO_TYPES,
            maximumSizeInBytes: MAX_FILE_BYTES,
            validUntil: Date.now() + 60 * 60 * 1000,
          });
          return {
            token,
            urlOptions: {
              allowedContentTypes: AUDIO_TYPES,
              maximumSizeInBytes: MAX_FILE_BYTES,
              addRandomSuffix: false,
            },
          };
        },
      });
      return NextResponse.json(result);
    }

    const body = (await request.json()) as HandleUploadBody;
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        await check(pathname);
        return {
          allowedContentTypes: AUDIO_TYPES,
          maximumSizeInBytes: MAX_FILE_BYTES,
          addRandomSuffix: false,
        };
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
