import { NextResponse } from "next/server";
import { getStore } from "@/lib/data/store";
import { getSeed } from "@/lib/data/seed";

export const dynamic = "force-dynamic";

/** POST { internId, level: 1 | 2 | 3 } */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { internId?: string; level?: number } | null;
  if (!body?.internId || !getSeed().some((i) => i.id === body.internId)) {
    return NextResponse.json({ error: "Unknown intern" }, { status: 404 });
  }
  if (body.level !== 1 && body.level !== 2 && body.level !== 3) {
    return NextResponse.json({ error: "level must be 1, 2 or 3" }, { status: 400 });
  }
  getStore().setConsent(body.internId, body.level);
  return NextResponse.json({ ok: true, level: body.level });
}
