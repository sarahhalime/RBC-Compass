"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, PlayCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { DEMO_STEPS } from "@/lib/demo";
import { useCompass } from "@/lib/store/compass";
import { useHydrated } from "@/lib/hooks";

export function GuidedDemo() {
  const demo = useCompass((s) => s.demo);
  const setDemo = useCompass((s) => s.setDemo);
  const setRole = useCompass((s) => s.setRole);
  const router = useRouter();
  const hydrated = useHydrated();

  const go = useCallback(
    (step: number) => {
      const s = DEMO_STEPS[step];
      if (!s) return;
      setRole(s.role);
      setDemo({ active: true, step });
      router.push(s.path);
    },
    [router, setDemo, setRole],
  );

  useEffect(() => {
    if (!demo.active) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight") go(Math.min(DEMO_STEPS.length - 1, demo.step + 1));
      if (e.key === "ArrowLeft") go(Math.max(0, demo.step - 1));
      if (e.key === "Escape") setDemo({ active: false });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [demo, go, setDemo]);

  if (!hydrated) return null;
  const step = DEMO_STEPS[demo.step];
  const last = demo.step === DEMO_STEPS.length - 1;

  return (
    <>
      <AnimatePresence>
        {!demo.active && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => go(0)}
            className="btn-primary fixed bottom-5 right-5 z-[60] py-3"
          >
            <PlayCircle size={18} /> Guided demo
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {demo.active && step && (
          <motion.div
            key="narrator"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-xl sm:bottom-5"
            role="dialog"
            aria-label="Guided demo narrator"
          >
            <div className="glass-strong rounded-3xl border-rbc-yellow/30 p-4 shadow-glow sm:p-5">
              <div className="mb-3 flex items-center gap-1.5">
                {DEMO_STEPS.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Go to step ${i + 1}`}
                    onClick={() => go(i)}
                    className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"
                  >
                    <motion.span
                      className="block h-full rounded-full bg-rbc-yellow"
                      initial={false}
                      animate={{ width: i <= demo.step ? "100%" : "0%" }}
                      transition={{ duration: 0.4 }}
                    />
                  </button>
                ))}
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={demo.step}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.25 }}
                >
                  <p className="font-display text-base font-bold text-white">{step.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-rbc-mist/75">{step.text}</p>
                </motion.div>
              </AnimatePresence>
              <div className="mt-4 flex items-center justify-between gap-2">
                <button className="btn-ghost px-3 py-2" onClick={() => setDemo({ active: false })}>
                  <X size={16} /> Exit
                </button>
                <span className="hidden text-xs text-rbc-mist/50 sm:inline">Use arrow keys</span>
                <div className="flex gap-2">
                  <button
                    className="btn-ghost px-3 py-2"
                    disabled={demo.step === 0}
                    onClick={() => go(demo.step - 1)}
                    aria-label="Previous step"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    className="btn-primary px-4 py-2"
                    onClick={() => (last ? setDemo({ active: false, step: 0 }) : go(demo.step + 1))}
                  >
                    {last ? "Finish" : "Next"} {!last && <ChevronRight size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
