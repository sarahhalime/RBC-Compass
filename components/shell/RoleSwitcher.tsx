"use client";

import { motion } from "framer-motion";
import { Briefcase, GraduationCap, HeartHandshake } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useCompass } from "@/lib/store/compass";
import { useHydrated, cn } from "@/lib/hooks";
import type { Role } from "@/lib/types";

const ROLES: { id: Role; label: string; icon: typeof Briefcase; home: string }[] = [
  { id: "intern", label: "Intern", icon: GraduationCap, home: "/intern" },
  { id: "advisor", label: "Advisor", icon: HeartHandshake, home: "/advisor" },
  { id: "leader", label: "Program Leader", icon: Briefcase, home: "/insights" },
];

export function RoleSwitcher() {
  const role = useCompass((s) => s.role);
  const setRole = useCompass((s) => s.setRole);
  const hydrated = useHydrated();
  const router = useRouter();
  const pathname = usePathname();

  const choose = (r: (typeof ROLES)[number]) => {
    setRole(r.id);
    const onRolePage =
      pathname.startsWith("/intern") || pathname.startsWith("/insights") || pathname.startsWith("/advisor");
    if (onRolePage) router.push(r.home);
  };

  return (
    <div role="radiogroup" aria-label="Demo role" className="glass flex items-center rounded-full p-1">
      {ROLES.map((r) => {
        const active = hydrated && role === r.id;
        const Icon = r.icon;
        return (
          <button
            key={r.id}
            role="radio"
            aria-checked={active}
            onClick={() => choose(r)}
            className={cn(
              "relative flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold transition-colors sm:px-3",
              active ? "text-rbc-ink" : "text-rbc-mist/70 hover:text-white",
            )}
          >
            {active && (
              <motion.span
                layoutId="role-pill"
                className="absolute inset-0 rounded-full bg-rbc-yellow"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <Icon size={14} className="relative" />
            <span className="relative hidden sm:inline lg:hidden xl:inline">{r.label}</span>
          </button>
        );
      })}
    </div>
  );
}
