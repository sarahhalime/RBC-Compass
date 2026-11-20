import type { ThemeId } from "./types";

const KEYWORDS: Record<ThemeId, string[]> = {
  mentorship: ["mentor", "1:1", "one on one", "coach", "guidance", "check-in", "check in"],
  team_dynamics: ["team", "manager", "standup", "pod", "colleague", "conflict", "meeting"],
  learning: ["learn", "skill", "course", "training", "workshop", "new tool", "figured out"],
  workload: ["workload", "busy", "overtime", "late", "too much", "deadline", "stress", "overwhelm"],
  onboarding: ["onboard", "access", "laptop", "setup", "set up", "permissions", "first week"],
  career_growth: ["career", "return offer", "full time", "full-time", "path", "promotion", "future"],
  belonging: ["belong", "included", "welcome", "lonely", "isolated", "fit in", "remote"],
  leaving_intent: [
    "leave", "leaving", "quit", "other offer", "another offer", "not coming back",
    "won't return", "wont return", "look elsewhere", "looking elsewhere",
  ],
};

const NEGATIVE = [
  "rarely", "haven't", "havent", "never", "cancel", "rescheduled", "no time", "not sure",
  "confused", "lonely", "isolated", "stuck", "frustrat", "hard", "struggl", "don't", "dont",
  "without", "lost", "too much", "overwhelm", "missed",
];
const POSITIVE = ["great", "love", "helpful", "proud", "shipped", "excited", "welcome", "fun", "learned", "thanks"];

export interface ThemeAnalysis {
  themes: { id: ThemeId; hits: string[] }[];
  sentiment: "positive" | "mixed" | "concern";
  mentorshipConcern: boolean;
  leavingIntent: boolean;
  suggestion?: { title: string; body: string; href: string };
}

/**
 * Deterministic keyword theme detection. Runs fully on device in the demo.
 * No model call, no network, same output every time for the same text.
 */
export function detectThemes(text: string, chips: ThemeId[] = []): ThemeAnalysis {
  const lower = text.toLowerCase();
  const themes: ThemeAnalysis["themes"] = [];
  (Object.keys(KEYWORDS) as ThemeId[]).forEach((id) => {
    const hits = KEYWORDS[id].filter((k) => lower.includes(k));
    if (hits.length || chips.includes(id)) themes.push({ id, hits });
  });
  const neg = NEGATIVE.filter((k) => lower.includes(k)).length;
  const pos = POSITIVE.filter((k) => lower.includes(k)).length;
  const sentiment = neg > pos ? "concern" : neg > 0 ? "mixed" : "positive";
  const hasMentor = themes.some((t) => t.id === "mentorship");
  const mentorshipConcern = hasMentor && neg > 0;
  const leavingIntent = themes.some((t) => t.id === "leaving_intent" && t.hits.length > 0);

  let suggestion: ThemeAnalysis["suggestion"];
  if (mentorshipConcern) {
    suggestion = {
      title: "Want a hand with mentor time?",
      body: "Two Mentor Coffee Chat slots are open this week. You can also ask an Early Talent advisor for help, only if you choose to.",
      href: "/intern/support",
    };
  } else if (leavingIntent) {
    suggestion = {
      title: "You are not alone in this",
      body: "If you want, an advisor can talk through options with you. Nothing is shared unless you say so.",
      href: "/intern/support",
    };
  }
  return { themes, sentiment, mentorshipConcern, leavingIntent, suggestion };
}

/**
 * Optional LLM hook. Off by default. Enable with COMPASS_LLM_ENABLED=true and
 * COMPASS_LLM_API_KEY (OpenAI compatible endpoint). Production must use RBC approved AI infrastructure.
 */
export async function analyzeWithOptionalLLM(text: string, chips: ThemeId[]): Promise<ThemeAnalysis & { source: "keywords" | "llm" }> {
  const base = detectThemes(text, chips);
  if (process.env.COMPASS_LLM_ENABLED !== "true" || !process.env.COMPASS_LLM_API_KEY) {
    return { ...base, source: "keywords" };
  }
  try {
    const res = await fetch(process.env.COMPASS_LLM_URL ?? "https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.COMPASS_LLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.COMPASS_LLM_MODEL ?? "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Classify an intern reflection into themes: mentorship, team_dynamics, learning, workload, onboarding, career_growth, belonging, leaving_intent. Reply with JSON {\"themes\": string[]}.",
          },
          { role: "user", content: text },
        ],
        response_format: { type: "json_object" },
      }),
    });
    const json = await res.json();
    const parsed = JSON.parse(json.choices[0].message.content) as { themes: ThemeId[] };
    const extra = parsed.themes
      .filter((t) => !base.themes.some((b) => b.id === t))
      .map((id) => ({ id, hits: [] as string[] }));
    return { ...base, themes: [...base.themes, ...extra], source: "llm" };
  } catch {
    return { ...base, source: "keywords" };
  }
}
