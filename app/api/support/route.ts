import { NextResponse } from "next/server";
import { getStore } from "@/lib/data/store";
import type { SupportRequest } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Advisor queue. Only requests an intern explicitly sent, with only the fields they chose. */
export async function GET() {
  return NextResponse.json({ requests: getStore().listSupport() });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as SupportRequest | null;
  if (!body?.id || !body.fields || typeof body.fields !== "object") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const clean: SupportRequest = {
    id: String(body.id).slice(0, 64),
    internName: String(body.internName ?? "").slice(0, 80),
    alias: String(body.alias ?? "Intern").slice(0, 40),
    createdAt: Date.now(),
    topic: String(body.topic ?? "").slice(0, 80),
    fields: Object.fromEntries(
      Object.entries(body.fields)
        .slice(0, 10)
        .map(([k, v]) => [String(k).slice(0, 40), String(v).slice(0, 500)]),
    ),
    status: "new",
  };
  getStore().addSupport(clean);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (id) getStore().removeSupport(id);
  return NextResponse.json({ ok: true });
}
