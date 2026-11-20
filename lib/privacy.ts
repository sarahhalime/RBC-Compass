import { AREAS, COHORTS, MIN_GROUP_SIZE } from "./constants";
import type { Filter, Intern } from "./types";

export interface PrivacyResult {
  hidden: boolean;
  n: number;
  reason?: "small_group" | "differencing";
  message?: string;
}

/** Only interns who chose to contribute (Vault level 2 or 3) are ever aggregated. */
export function contributors(interns: Intern[]): Intern[] {
  return interns.filter((i) => i.consentLevel >= 2);
}

export function matchesFilter(intern: Intern, f: Pick<Filter, "cohorts" | "areas">): boolean {
  const cohortOk = f.cohorts.length === 0 || f.cohorts.includes(intern.cohort);
  const areaOk = f.areas.length === 0 || f.areas.includes(intern.area);
  return cohortOk && areaOk;
}

export function sliceOf(interns: Intern[], f: Pick<Filter, "cohorts" | "areas">): Intern[] {
  return contributors(interns).filter((i) => matchesFilter(i, f));
}

function isAll<T>(selected: T[], all: T[]) {
  return selected.length === 0 || selected.length === all.length;
}

/**
 * Decides whether a slice may be shown to a program leader.
 * 1. Fewer than MIN_GROUP_SIZE unique contributors: hidden.
 * 2. Differencing check: if widening any one filter back to "all" adds fewer than
 *    MIN_GROUP_SIZE people, comparing the two views would expose that small group. Hidden.
 */
export function applyPrivacy(
  interns: Intern[],
  f: Pick<Filter, "cohorts" | "areas">,
): PrivacyResult {
  const n = sliceOf(interns, f).length;
  if (n < MIN_GROUP_SIZE) {
    return {
      hidden: true,
      n,
      reason: "small_group",
      message: `Hidden to protect privacy (n<${MIN_GROUP_SIZE})`,
    };
  }

  const parents: Pick<Filter, "cohorts" | "areas">[] = [];
  if (!isAll(f.cohorts, COHORTS)) parents.push({ cohorts: [], areas: f.areas });
  if (!isAll(f.areas, AREAS)) parents.push({ cohorts: f.cohorts, areas: [] });

  for (const parent of parents) {
    const diff = sliceOf(interns, parent).length - n;
    if (diff > 0 && diff < MIN_GROUP_SIZE) {
      return {
        hidden: true,
        n,
        reason: "differencing",
        message: `Blocked: compared with a broader view, this would isolate ${diff < 5 ? "a very small" : "a"} group under ${MIN_GROUP_SIZE}`,
      };
    }
  }
  return { hidden: false, n };
}

/** Rounds a small count up into a band so even locked tiles do not leak exact sizes. */
export function bandedCount(n: number): string {
  if (n >= MIN_GROUP_SIZE) return String(n);
  return `<${MIN_GROUP_SIZE}`;
}
