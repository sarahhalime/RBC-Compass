"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { useCompass } from "@/lib/store/compass";

const ICONS = { success: CheckCircle2, info: Info, warning: TriangleAlert };
const COLORS = { success: "text-success", info: "text-rbc-sky", warning: "text-warning" };

export function Toaster() {
  const toasts = useCompass((s) => s.toasts);
  const dismiss = useCompass((s) => s.dismissToast);
  return (
    <div aria-live="polite" className="pointer-events-none fixed right-4 top-20 z-[70] flex w-[min(92vw,360px)] flex-col gap-2">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const tone = t.tone ?? "success";
          const Icon = ICONS[tone];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="glass-strong pointer-events-auto flex items-start gap-3 rounded-2xl p-4 shadow-card"
            >
              <Icon size={20} className={COLORS[tone]} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{t.title}</p>
                {t.body && <p className="mt-0.5 text-xs text-rbc-mist/70">{t.body}</p>}
              </div>
              <button aria-label="Dismiss" onClick={() => dismiss(t.id)} className="text-rbc-mist/50 hover:text-white">
                <X size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
