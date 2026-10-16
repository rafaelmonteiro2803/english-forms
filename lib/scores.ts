import type { Assessment, CefrLevel } from '@/types/database';

// Scoring model. An assessment scores six skills 0–100; `overall` is their
// average. The 0–1000 performance score shown in the UI is overall × 10.

export const SKILLS = [
  { key: 'fluency', label: 'Fluency', color: '#2dd4d4' },
  { key: 'grammar', label: 'Grammar', color: '#3b82f6' },
  { key: 'pronunciation', label: 'Pronunciation', color: '#e7b35c' },
  { key: 'listening', label: 'Listening', color: '#60a5fa' },
  { key: 'vocabulary', label: 'Vocabulary', color: '#2dd4a7' },
  { key: 'confidence', label: 'Confidence', color: '#9b8cff' },
] as const;

export type SkillKey = (typeof SKILLS)[number]['key'];

export const skillValues = (a: Pick<Assessment, SkillKey>) => SKILLS.map((s) => a[s.key]);

export const score1000 = (a: Pick<Assessment, 'overall'> | undefined | null) => (a?.overall ?? 0) * 10;

/** Minimum performance score for each CEFR level (from the prototype). */
export const CEFR: { level: CefrLevel; min: number }[] = [
  { level: 'A1', min: 180 }, { level: 'A2', min: 320 }, { level: 'B1', min: 480 },
  { level: 'B2', min: 720 }, { level: 'C1', min: 880 }, { level: 'C2', min: 980 },
];

export function levelFor(score: number): CefrLevel {
  return [...CEFR].reverse().find((c) => score >= c.min)?.level ?? 'A1';
}

export function nextLevel(level: CefrLevel) {
  const i = CEFR.findIndex((c) => c.level === level);
  return CEFR[Math.min(i + 1, CEFR.length - 1)]!;
}

// Approximate exam equivalence by score (anchors at CEFR thresholds), interpolated.
const EXAM_ANCHORS: [number, number, number, number][] = [
  // score, TOEFL iBT, IELTS, TOEIC
  [0, 0, 1, 10], [320, 20, 3, 225], [480, 42, 4, 550], [720, 72, 5.5, 785], [880, 95, 7, 945], [980, 114, 8.5, 990], [1000, 120, 9, 990],
];

export function examEquivalents(score: number) {
  const s = Math.max(0, Math.min(1000, score));
  const i = EXAM_ANCHORS.findIndex((a, k) => s <= a[0] && k > 0);
  const hi = EXAM_ANCHORS[i]!;
  const lo = EXAM_ANCHORS[i - 1]!;
  const t = (s - lo[0]) / (hi[0] - lo[0] || 1);
  const at = (col: 1 | 2 | 3) => lo[col] + (hi[col] - lo[col]) * t;
  return [
    { name: 'TOEFL iBT', value: Math.round(at(1)), max: 120 },
    { name: 'IELTS', value: Math.round(at(2) * 2) / 2, max: 9 },
    { name: 'TOEIC', value: Math.round(at(3) / 5) * 5, max: 990 },
  ];
}

/** Least-squares slope of score per month over the given assessments (oldest first). */
export function monthlyTrend(history: Pick<Assessment, 'overall' | 'created_at'>[]) {
  if (history.length < 2) return 0;
  const t0 = Date.parse(history[0]!.created_at);
  const xs = history.map((a) => (Date.parse(a.created_at) - t0) / (30.44 * 86400000));
  const ys = history.map((a) => (a.overall ?? 0) * 10);
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
  const my = ys.reduce((a, b) => a + b, 0) / ys.length;
  const num = xs.reduce((s, x, i) => s + (x - mx) * (ys[i]! - my), 0);
  const den = xs.reduce((s, x) => s + (x - mx) ** 2, 0);
  return den ? num / den : 0;
}

/** Score expected after `months` at the current pace (never above 1000). */
export const project = (current: number, slope: number, months: number) => Math.min(1000, Math.round(current + slope * months));

/** Months until `target` at the current pace, or null if not improving. */
export function monthsTo(current: number, target: number, slope: number) {
  if (current >= target) return 0;
  return slope > 0 ? Math.ceil((target - current) / slope) : null;
}

/** The latest assessment on or before `daysAgo` days back, for "vs 3 months ago" comparisons. */
export function assessmentBefore<T extends Pick<Assessment, 'created_at'>>(history: T[], daysAgo: number, now = Date.now()) {
  const cutoff = now - daysAgo * 86400000;
  return [...history].reverse().find((a) => Date.parse(a.created_at) <= cutoff) ?? history[0];
}
