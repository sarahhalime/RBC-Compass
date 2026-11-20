import { NextResponse } from "next/server";
import { analyzeWithOptionalLLM } from "@/lib/themes";
import { THEMES } from "@/lib/constants";
import type { ThemeId } from "@/lib/types";

export const dynamic = "force-dynamic";

/** POST { text, chips }: theme analysis. Keyword based unless the optional LLM hook is enabled. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { text?: string; chips?: string[] } | null;
  const text = (body?.text ?? "").slice(0, 2000);
  const valid = new Set(THEMES.map((t) => t.id));
  const chips = (body?.chips ?? []).filter((c): c is ThemeId => valid.has(c as ThemeId));
  const analysis = await analyzeWithOptionalLLM(text, chips);
  return NextResponse.json(analysis);
}
