import { NextResponse } from "next/server";
import { getStore } from "@/lib/data/store";

export const dynamic = "force-dynamic";

/** GET ?since=<ms>: recent tap events. Clients poll every 1.5s. */
export async function GET(req: Request) {
  const since = Number(new URL(req.url).searchParams.get("since") ?? 0) || 0;
  const store = getStore();
  return NextResponse.json({
    events: store.listEvents(since),
    pending: store.pending(),
    serverTime: Date.now(),
  });
}

/** DELETE: reset the demo. */
export async function DELETE() {
  getStore().clearEvents();
  return NextResponse.json({ ok: true });
}
