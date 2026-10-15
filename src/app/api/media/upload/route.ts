import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (
    !origin ||
    !process.env.BETTER_AUTH_URL ||
    origin !== new URL(process.env.BETTER_AUTH_URL).origin
  ) {
    return Response.json({ error: "bad origin" }, { status: 403 });
  }
  const session = await auth.api.getSession({ headers: request.headers });
  if (session?.user.role !== "admin")
    return Response.json({ error: "forbidden" }, { status: 403 });
  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_BYTES + 50_000)
    return Response.json({ error: "too large" }, { status: 413 });
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || !file.size || file.size > MAX_BYTES) {
    return Response.json({ error: "invalid size" }, { status: 413 });
  }
  try {
    const input = Buffer.from(await file.arrayBuffer());
    const pipeline = sharp(input, {
      limitInputPixels: 20_000_000,
      failOn: "error",
    });
    const meta = await pipeline.metadata();
    if (!meta.format || !["jpeg", "png", "webp"].includes(meta.format)) {
      return Response.json({ error: "unsupported format" }, { status: 415 });
    }
    const encoded = await pipeline
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    const name = `${randomUUID()}.webp`;
    const dir = process.env.UPLOAD_DIR || ".uploads";
    await mkdir(dir, { recursive: true });
    await writeFile(/* turbopackIgnore: true */ join(dir, name), encoded, {
      flag: "wx",
    });
    return Response.json({ path: `/api/media/${name}` }, { status: 201 });
  } catch (error) {
    console.error("media upload failed", error);
    return Response.json({ error: "decode or write failed" }, { status: 400 });
  }
}
