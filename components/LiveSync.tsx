"use client";

import { useEffect, useRef } from "react";
import { useCompass } from "@/lib/store/compass";
import type { TapEvent } from "@/lib/types";

/**
 * Keeps every open screen in sync.
 * - Other tabs in this browser: rehydrate from localStorage on the storage event.
 * - Phones tapping a real tag: poll the API and merge new events.
 */
export function LiveSync() {
  const since = useRef(0);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "rbc-compass-demo") useCompass.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);

    let stop = false;
    const poll = async () => {
      try {
        const res = await fetch(`/api/tap/events?since=${since.current}`, { cache: "no-store" });
        if (res.ok) {
          const { events, serverTime } = (await res.json()) as { events: TapEvent[]; serverTime: number };
          if (events.length) useCompass.getState().mergeEvents(events);
          since.current = Math.max(0, serverTime - 60_000);
        }
      } catch {
        // Offline is fine. Local events still drive the demo.
      }
      if (!stop) setTimeout(poll, 1500);
    };
    poll();
    return () => {
      stop = true;
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return null;
}
