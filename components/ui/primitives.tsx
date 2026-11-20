"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Info, Lock } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/hooks";

export function Card({
  children,
  className,
  delay = 0,
  as = "section",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "section" | "div" | "article";
}) {
  const M = motion[as];
  return (
    <M
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn("glass rounded-card p-5 sm:p-6", className)}
    >
      {children}
    </M>
  );
}

export function Tooltip({ content, children, className, wide }: { content: ReactNode; children: ReactNode; className?: string; wide?: boolean }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span aria-describedby={id} className="inline-flex">
        {children}
      </span>
      <AnimatePresence>
        {open && (
          <motion.span
            id={id}
            role="tooltip"
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.16 }}
            className={cn(
              "glass-strong absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded-2xl p-3 text-left text-xs leading-relaxed text-rbc-mist shadow-card",
              wide ? "w-80" : "w-64",
            )}
          >
            {content}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

export function InfoTip({ content, label = "More info", wide }: { content: ReactNode; label?: string; wide?: boolean }) {
  return (
    <Tooltip content={content} wide={wide}>
      <button type="button" aria-label={label} className="rounded-full p-0.5 text-rbc-mist/50 hover:text-rbc-yellow">
        <Info size={15} />
      </button>
    </Tooltip>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  className,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-3", className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition-colors",
          checked ? "border-rbc-yellow/60 bg-rbc-yellow/90" : "border-white/15 bg-white/10",
        )}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
          className={cn(
            "absolute top-0.5 h-[18px] w-[18px] rounded-full shadow",
            checked ? "right-0.5 bg-rbc-ink" : "left-0.5 bg-rbc-mist",
          )}
        />
      </button>
      <span className="text-sm">
        <span className="font-medium text-white">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-rbc-mist/60">{description}</span>}
      </span>
    </label>
  );
}

export function PrivacyLock({ message, compact }: { message?: string; compact?: boolean }) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-white/10", compact ? "p-3" : "p-8")}>
      <div aria-hidden className="absolute inset-0 grid grid-cols-6 gap-2 p-3 opacity-60 blur-[6px]">
        {Array.from({ length: compact ? 6 : 18 }).map((_, i) => (
          <div key={i} className="h-6 rounded-md bg-gradient-to-r from-rbc-blue/50 to-rbc-yellow/30" />
        ))}
      </div>
      <div className="relative flex flex-col items-center justify-center gap-1.5 text-center">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-rbc-ink/80 ring-1 ring-white/15">
          <Lock size={16} className="text-rbc-yellow" />
        </span>
        <p className="text-sm font-semibold text-white">{message ?? "Hidden to protect privacy (n<10)"}</p>
      </div>
    </div>
  );
}

export function PageHeader({ eyebrow, title, children, right }: { eyebrow: string; title: ReactNode; children?: ReactNode; right?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:mb-8 md:flex-row md:items-end md:justify-between">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="h-display mt-2 text-3xl sm:text-4xl md:text-[44px] md:leading-[1.05]">{title}</h1>
        {children && <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-rbc-mist/70">{children}</p>}
      </motion.div>
      {right}
    </header>
  );
}

export function Pill({ children, tone = "default", className }: { children: ReactNode; tone?: "default" | "yellow" | "blue" | "success" | "warning" | "danger"; className?: string }) {
  const tones = {
    default: "bg-white/[0.06] text-rbc-mist/80 border-white/10",
    yellow: "bg-rbc-yellow/10 text-rbc-yellow border-rbc-yellow/30",
    blue: "bg-rbc-sky/10 text-rbc-sky border-rbc-sky/30",
    success: "bg-success/10 text-success border-success/30",
    warning: "bg-warning/10 text-warning border-warning/30",
    danger: "bg-danger/10 text-danger border-danger/30",
  } as const;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", tones[tone], className)}>
      {children}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}
