import { NextResponse } from "next/server";
import { incrementView } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  try {
    const views = await incrementView(slug);
    return NextResponse.json({ ok: true, views });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
