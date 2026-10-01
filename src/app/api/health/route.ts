import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  let db: { status: string; latencyMs?: number } = { status: "unknown" };
  try {
    const client = await getDb();
    await client.$queryRaw(Prisma.sql`SELECT 1`);
    db = { status: "ok", latencyMs: Date.now() - started };
  } catch {
    db = { status: "error" };
  }
  return NextResponse.json({
    ok: db.status === "ok",
    service: "sanidev-weblog",
    database: "postgresql",
    db,
    time: new Date().toISOString(),
  });
}
