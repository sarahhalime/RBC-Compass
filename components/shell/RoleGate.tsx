"use client";

import { motion } from "framer-motion";
import { Lock, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { useCompass } from "@/lib/store/compass";
import { useHydrated } from "@/lib/hooks";
import type { Role } from "@/lib/types";
import { Skeleton } from "../ui/primitives";

const COPY: Record<Role, { title: string; body: string; switchLabel: string }> = {
  intern: {
    title: "Private by design",
    body: "This is an intern's private space. Program leaders and advisors cannot open it. Leaders only ever see anonymous groups of 10 or more.",
    switchLabel: "Switch to Intern",
  },
  leader: {
    title: "Program leader view",
    body: "Aggregated insights are for program leaders. Switch roles to see how leaders view anonymous groups of 10 or more.",
    switchLabel: "Switch to Program Leader",
  },
  advisor: {
    title: "Advisor queue is restricted",
    body: "Advisors only see requests an intern chose to send, and only the fields the intern chose to share.",
    switchLabel: "Switch to Advisor",
  },
};

export function RoleGate({ allow, children }: { allow: Role; children: ReactNode }) {
  const role = useCompass((s) => s.role);
  const setRole = useCompass((s) => s.setRole);
  const hydrated = useHydrated();

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (role === allow) return <>{children}</>;

  const c = COPY[allow];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass mx-auto mt-10 max-w-lg rounded-card p-8 text-center"
    >
      <motion.div
        initial={{ rotate: -12, scale: 0.6 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 14 }}
        className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-rbc-yellow/10 ring-1 ring-rbc-yellow/30"
      >
        <Lock className="text-rbc-yellow" />
      </motion.div>
      <h1 className="h-display text-2xl">{c.title}</h1>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-rbc-mist/70">{c.body}</p>
      <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-rbc-mist/50">
        <ShieldCheck size={14} /> Demo role check. Production enforces this server side with RBC SSO and RBAC.
      </p>
      <div className="mt-6">
        <button className="btn-primary" onClick={() => setRole(allow)}>
          {c.switchLabel}
        </button>
      </div>
    </motion.div>
  );
}
