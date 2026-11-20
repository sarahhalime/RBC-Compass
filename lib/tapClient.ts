"use client";

import { MAYA_TAG } from "./data/seed";
import { buildTap, newId, type PendingApproval } from "./nfc";
import { useCompass } from "./store/compass";
import type { StationType, TapEvent } from "./types";

function post(body: object) {
  return fetch("/api/tap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function consentFor(tagId: string) {
  return tagId === MAYA_TAG ? useCompass.getState().consent : 2;
}

/** Optimistic station tap: the UI updates immediately, then the API records it. */
export function tapStation(tagId: string, stationType: StationType, synthetic = false): TapEvent {
  const id = newId();
  const { events } = buildTap(
    { tagId, stationType, id, synthetic },
    { consentOf: () => consentFor(tagId), pending: [] },
  );
  useCompass.getState().mergeEvents(events);
  post({ tagId, stationType, id, synthetic }).catch(() => undefined);
  return events[0];
}

export { pickCrowd as crowdFor } from "./nfc";

const localPending: PendingApproval[] = [];

/** Each side calls this when they approve. Status is "connected" only after both approve. */
export async function approveConnection(tagId: string, partnerTagId: string): Promise<"pending" | "connected"> {
  const id = newId("cx");
  try {
    const res = await post({ tagId, partnerTagId, id });
    if (!res.ok) throw new Error(String(res.status));
    const json = (await res.json()) as { status: "pending" | "connected"; events: TapEvent[] };
    if (json.events?.length) useCompass.getState().mergeEvents(json.events);
    return json.status;
  } catch {
    // Offline fallback so the demo still works without the API.
    const r = buildTap({ tagId, partnerTagId, id }, { consentOf: consentFor, pending: localPending });
    if (r.pending) localPending.push(r.pending);
    if (r.events.length) useCompass.getState().mergeEvents(r.events);
    return r.status === "connected" ? "connected" : "pending";
  }
}

export async function resetDemoEverywhere() {
  useCompass.getState().resetDemo();
  await fetch("/api/tap/events", { method: "DELETE" }).catch(() => undefined);
}
