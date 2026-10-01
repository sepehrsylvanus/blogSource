import { NextResponse } from "next/server";
import { getDb, dbMode } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  let db: { status: string; latencyMs?: number; mode?: string } = { status: "unknown" };
  try {
    const conn = await getDb();
    await conn.command({ ping: 1 });
    db = { status: "ok", latencyMs: Date.now() - started, mode: dbMode() };
  } catch (err) {
    db = { status: "error" };
  }
  return NextResponse.json({
    ok: true,
    service: "sanidev-weblog",
    database: "mongodb",
    db,
    time: new Date().toISOString(),
  });
}
