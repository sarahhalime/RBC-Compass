import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { ConsentLevel, SupportRequest, TapEvent } from "../types";
import type { PendingApproval } from "../nfc";
import { getSeed } from "./seed";

/** Data access boundary. Swap MemoryJsonStore for a real database without touching routes. */
export interface DataStore {
  listEvents(since?: number): TapEvent[];
  appendEvents(events: TapEvent[]): void;
  clearEvents(): void;
  pending(): PendingApproval[];
  addPending(p: PendingApproval): void;
  removePending(from: string, to: string): void;
  consentOf(internId: string): ConsentLevel;
  setConsent(internId: string, level: ConsentLevel): void;
  listSupport(): SupportRequest[];
  addSupport(r: SupportRequest): void;
  removeSupport(id: string): void;
}

interface Snapshot {
  events: TapEvent[];
  pending: PendingApproval[];
  consent: Record<string, ConsentLevel>;
  support: SupportRequest[];
}

const MAX_EVENTS = 2000;

class MemoryJsonStore implements DataStore {
  private data: Snapshot = { events: [], pending: [], consent: {}, support: [] };
  private file: string;

  constructor() {
    // Vercel has a read-only filesystem except /tmp. Locally we persist under .data/.
    const dir = process.env.VERCEL ? path.join(os.tmpdir(), "compass") : path.join(process.cwd(), ".data");
    this.file = path.join(dir, "store.json");
    try {
      if (fs.existsSync(this.file)) {
        this.data = { ...this.data, ...JSON.parse(fs.readFileSync(this.file, "utf8")) };
      }
    } catch {
      // Corrupt or unreadable file: start fresh from the seed.
    }
  }

  private persist() {
    try {
      fs.mkdirSync(path.dirname(this.file), { recursive: true });
      fs.writeFileSync(this.file, JSON.stringify(this.data));
    } catch {
      // Persistence is best effort. The in-memory copy stays authoritative.
    }
  }

  listEvents(since = 0) {
    return this.data.events.filter((e) => e.at > since);
  }
  appendEvents(events: TapEvent[]) {
    const ids = new Set(this.data.events.map((e) => e.id));
    for (const e of events) if (!ids.has(e.id)) this.data.events.push(e);
    if (this.data.events.length > MAX_EVENTS) this.data.events = this.data.events.slice(-MAX_EVENTS);
    this.persist();
  }
  clearEvents() {
    this.data.events = [];
    this.data.pending = [];
    this.persist();
  }
  pending() {
    return this.data.pending;
  }
  addPending(p: PendingApproval) {
    this.data.pending = this.data.pending.filter((x) => !(x.from === p.from && x.to === p.to));
    this.data.pending.push(p);
    this.persist();
  }
  removePending(from: string, to: string) {
    this.data.pending = this.data.pending.filter(
      (x) => !((x.from === from && x.to === to) || (x.from === to && x.to === from)),
    );
    this.persist();
  }
  consentOf(internId: string): ConsentLevel {
    return this.data.consent[internId] ?? getSeed().find((i) => i.id === internId)?.consentLevel ?? 1;
  }
  setConsent(internId: string, level: ConsentLevel) {
    this.data.consent[internId] = level;
    this.persist();
  }
  listSupport() {
    return this.data.support;
  }
  addSupport(r: SupportRequest) {
    this.data.support = [r, ...this.data.support.filter((s) => s.id !== r.id)];
    this.persist();
  }
  removeSupport(id: string) {
    this.data.support = this.data.support.filter((s) => s.id !== id);
    this.persist();
  }
}

const g = globalThis as unknown as { __compassStore?: DataStore };

export function getStore(): DataStore {
  if (!g.__compassStore) g.__compassStore = new MemoryJsonStore();
  return g.__compassStore;
}
