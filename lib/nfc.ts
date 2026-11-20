import { STATIONS, STATION_IDS } from "./constants";
import { findByTag, MAYA_TAG } from "./data/seed";
import { isExpected, isExperienced } from "./gap";
import type { ConsentLevel, DimensionId, Intern, StationType, TapEvent } from "./types";

export interface TapBody {
  tagId: string;
  stationType?: StationType;
  partnerTagId?: string;
  /** Optional client generated id so optimistic updates and retries stay idempotent. */
  id?: string;
  synthetic?: boolean;
}

export type TapValidation =
  | { ok: true; body: TapBody }
  | { ok: false; status: number; error: string };

const TAG_RE = /^[a-z]+-[0-9a-f]{4}$/;

export function validateTapBody(raw: unknown): TapValidation {
  if (!raw || typeof raw !== "object") return { ok: false, status: 400, error: "Body must be JSON" };
  const b = raw as Record<string, unknown>;
  if (typeof b.tagId !== "string" || !TAG_RE.test(b.tagId)) {
    return { ok: false, status: 400, error: "tagId must look like name-1a2b" };
  }
  if (!findByTag(b.tagId)) return { ok: false, status: 404, error: "Unknown tag" };
  if (b.stationType !== undefined && !STATION_IDS.includes(b.stationType as StationType)) {
    return { ok: false, status: 400, error: "Unknown stationType" };
  }
  if (b.partnerTagId !== undefined) {
    if (typeof b.partnerTagId !== "string" || !findByTag(b.partnerTagId)) {
      return { ok: false, status: 404, error: "Unknown partner tag" };
    }
    if (b.partnerTagId === b.tagId) return { ok: false, status: 400, error: "Cannot connect with yourself" };
  }
  if (!b.stationType && !b.partnerTagId) {
    return { ok: false, status: 400, error: "Provide stationType or partnerTagId" };
  }
  return {
    ok: true,
    body: {
      tagId: b.tagId,
      stationType: b.stationType as StationType | undefined,
      partnerTagId: b.partnerTagId as string | undefined,
      id: typeof b.id === "string" ? b.id.slice(0, 64) : undefined,
      synthetic: b.synthetic === true,
    },
  };
}

export function dimensionsForStation(type: StationType): DimensionId[] {
  return STATIONS[type].dims;
}

/** Connecting with someone always feeds network. It feeds cross_team only if teams differ. */
export function dimensionsForConnection(tagA: string, tagB: string): { dims: DimensionId[]; crossTeam: boolean } {
  const a = findByTag(tagA)!;
  const b = findByTag(tagB)!;
  const crossTeam = a.team !== b.team;
  return { dims: crossTeam ? ["network", "cross_team"] : ["network"], crossTeam };
}

/**
 * Other attendees at the same station (synthetic, demo console only). Picks interns in the same
 * cohort who expected this experience and have not had it yet, so the demo shows a realistic event.
 */
export function pickCrowd(interns: Intern[], stationType: StationType, count: number, cohort = "Toronto"): Intern[] {
  const dim = STATIONS[stationType].dims[0];
  return interns
    .filter(
      (i) =>
        i.tagId !== MAYA_TAG &&
        i.cohort === cohort &&
        i.consentLevel >= 2 &&
        isExpected(i, dim) &&
        !isExperienced(i.experience[dim]),
    )
    .slice(0, count);
}

export function newId(prefix = "ev") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface PendingApproval {
  from: string;
  to: string;
  at: number;
}

export const CONNECT_WINDOW_MS = 10 * 60 * 1000;

/**
 * Pure tap pipeline shared by the API route. Consent rules:
 * - Station taps are always logged for the intern. If their Vault level is 1 they are not aggregated.
 * - Connections need both sides to approve within 10 minutes. Until then nothing is recorded.
 */
export function buildTap(
  body: TapBody,
  ctx: {
    consentOf: (internId: string) => ConsentLevel;
    pending: PendingApproval[];
    now?: number;
  },
): { events: TapEvent[]; pending?: PendingApproval; status: TapEvent["status"] } {
  const now = ctx.now ?? Date.now();
  const me = findByTag(body.tagId)!;

  if (body.stationType) {
    const ev: TapEvent = {
      id: body.id ?? newId(),
      kind: "station",
      tagId: me.tagId,
      internId: me.id,
      internName: me.name,
      stationType: body.stationType,
      status: "logged",
      dimensions: dimensionsForStation(body.stationType),
      aggregated: ctx.consentOf(me.id) >= 2,
      at: now,
      synthetic: body.synthetic,
    };
    return { events: [ev], status: "logged" };
  }

  const partner = findByTag(body.partnerTagId!)!;
  const reverse = ctx.pending.find(
    (p) => p.from === partner.tagId && p.to === me.tagId && now - p.at < CONNECT_WINDOW_MS,
  );
  if (!reverse) {
    return { events: [], pending: { from: me.tagId, to: partner.tagId, at: now }, status: "pending" };
  }
  const { dims } = dimensionsForConnection(me.tagId, partner.tagId);
  const mk = (a: typeof me, b: typeof me, suffix: string): TapEvent => ({
    id: `${body.id ?? newId()}-${suffix}`,
    kind: "connect",
    tagId: a.tagId,
    internId: a.id,
    internName: a.name,
    partnerTagId: b.tagId,
    partnerName: b.name,
    status: "connected",
    dimensions: dims,
    aggregated: ctx.consentOf(a.id) >= 2,
    at: now,
  });
  return { events: [mk(me, partner, "a"), mk(partner, me, "b")], status: "connected" };
}
