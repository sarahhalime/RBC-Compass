import type { BusinessArea, Cohort, DimensionId, StationType, ThemeId } from "./types";

export const DIMENSIONS: { id: DimensionId; label: string; short: string; want: string }[] = [
  { id: "cross_team", label: "Cross-team exposure", short: "Cross-team", want: "see how other teams work" },
  { id: "mentor_access", label: "Regular mentor time", short: "Mentor time", want: "regular time with my mentor" },
  { id: "meaningful_work", label: "Meaningful, real project work", short: "Real work", want: "work on real projects that matter" },
  { id: "senior_access", label: "Access to senior leaders", short: "Senior access", want: "hear from senior leaders" },
  { id: "feedback", label: "Frequent, useful feedback", short: "Feedback", want: "get frequent, useful feedback" },
  { id: "career_clarity", label: "Clear career paths at RBC", short: "Career clarity", want: "understand career paths at RBC" },
  { id: "learning", label: "Learning and skill growth", short: "Learning", want: "learn new skills fast" },
  { id: "belonging", label: "Sense of belonging", short: "Belonging", want: "feel like I belong here" },
  { id: "network", label: "Peer and professional networking", short: "Network", want: "build my network" },
];

export const DIM_IDS = DIMENSIONS.map((d) => d.id);

export const dimLabel = (id: DimensionId) => DIMENSIONS.find((d) => d.id === id)!.label;
export const dimShort = (id: DimensionId) => DIMENSIONS.find((d) => d.id === id)!.short;

export const COHORTS: Cohort[] = ["Toronto", "Vancouver", "Montreal", "Calgary", "Remote"];

export const AREAS: BusinessArea[] = [
  "Technology",
  "Capital Markets",
  "Wealth Management",
  "Personal Banking",
  "Risk",
  "Corporate Functions",
];

export const CURRENT_WEEK = 6;
export const PROGRAM_WEEKS = 16;

export const STATIONS: Record<
  StationType,
  { label: string; dims: DimensionId[]; blurb: string }
> = {
  mentor_coffee: {
    label: "Mentor Coffee Chat",
    dims: ["mentor_access"],
    blurb: "Logs regular mentor time",
  },
  cross_team_lunch: {
    label: "Cross-Team Lunch",
    dims: ["cross_team", "network"],
    blurb: "Logs cross-team exposure and networking",
  },
  workshop: {
    label: "Workshop",
    dims: ["learning", "career_clarity"],
    blurb: "Logs learning and career clarity",
  },
  senior_ama: {
    label: "Senior Leader AMA",
    dims: ["senior_access"],
    blurb: "Logs access to senior leaders",
  },
};

export const STATION_IDS = Object.keys(STATIONS) as StationType[];

export const THEMES: { id: ThemeId; label: string }[] = [
  { id: "mentorship", label: "Mentorship" },
  { id: "team_dynamics", label: "Team dynamics" },
  { id: "learning", label: "Learning" },
  { id: "workload", label: "Workload" },
  { id: "onboarding", label: "Onboarding" },
  { id: "career_growth", label: "Career growth" },
  { id: "belonging", label: "Belonging" },
];

export const PROGRAM_STATS = {
  enrolled: 281,
  contributors: 250,
  participation: 89,
  engagement: 84,
  supportRequests: 12,
  mentorshipPositive: 64,
  careerClarityPositive: 53,
};

/** Top anonymized theme per dimension, drawn from opt-in reflections (synthetic). */
export const TOP_THEMES: Record<DimensionId, { text: string; share: number }> = {
  cross_team: { text: "I only know people on my own pod", share: 41 },
  mentor_access: { text: "Mentor 1:1s keep getting rescheduled", share: 37 },
  meaningful_work: { text: "My project is shipping to real users", share: 52 },
  senior_access: { text: "Would love to hear how leaders got here", share: 33 },
  feedback: { text: "Feedback mostly happens at code review", share: 29 },
  career_clarity: { text: "Not sure what roles exist after this term", share: 44 },
  learning: { text: "Picking up new tools every week", share: 58 },
  belonging: { text: "My team includes me in rituals", share: 61 },
  network: { text: "Intern socials help, want more structure", share: 35 },
};

export const MIN_GROUP_SIZE = 10;
