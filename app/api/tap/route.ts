import { NextResponse } from "next/server";
import { getStore } from "@/lib/data/store";
import { getSeed } from "@/lib/data/seed";
import { buildTap, validateTapBody } from "@/lib/nfc";
import { applyEvents, experienceScore, isExperienced } from "@/lib/gap";
import { DIM_IDS } from "@/lib/constants";

export const dynamic = "force-dynamic";

/** POST { tagId, stationType?, partnerTagId? } */
export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON" }, { status: 400 });
  }
  const v = validateTapBody(raw);
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: v.status });

  const store = getStore();
  const result = buildTap(v.body, { consentOf: (id) => store.consentOf(id), pending: store.pending() });

  if (result.pending) store.addPending(result.pending);
  if (result.status === "connected" && v.body.partnerTagId) store.removePending(v.body.tagId, v.body.partnerTagId);
  if (result.events.length) store.appendEvents(result.events);

  // Recompute the tapping intern's experience scores so the caller can show them immediately.
  const interns = applyEvents(getSeed(), store.listEvents());
  const me = interns.find((i) => i.tagId === v.body.tagId)!;
  const scores = Object.fromEntries(
    DIM_IDS.map((d) => [
      d,
      {
        score: Math.round(experienceScore(me.experience[d]) * 100) / 100,
        experienced: isExperienced(me.experience[d]),
        source: me.experience[d].taps > 0 ? "Tap verified" : "Self-reported",
      },
    ]),
  );

  return NextResponse.json({ status: result.status, events: result.events, scores });
}
