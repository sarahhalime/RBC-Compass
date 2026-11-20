import type { ReactNode } from "react";
import { RoleGate } from "@/components/shell/RoleGate";

export default function InternLayout({ children }: { children: ReactNode }) {
  return <RoleGate allow="intern">{children}</RoleGate>;
}
