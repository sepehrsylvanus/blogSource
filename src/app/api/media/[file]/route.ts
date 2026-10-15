import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  if (!/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}\.webp$/.test(file)) {
    return new Response("Not found", { status: 404 });
  }
  try {
    const dir = process.env.UPLOAD_DIR || ".uploads";
    // Uploads live outside the repository. Do not trace the dynamic directory into .next/standalone.
    const data = await readFile(join(/* turbopackIgnore: true */ dir, file));
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": "image/webp",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
