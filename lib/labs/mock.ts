// Mock data for the AI Simulator and Live Class previews. The voice/AI
// integration replaces this in a later phase.
import type { IconName } from '@/components/ui/Icon';

export type Flag = { type: 'grammar' | 'filler' | 'win'; word: string; note: string; fix?: string };

export const SCENARIOS: { id: string; title: string; tag: string; diff: 'Intermediate' | 'Advanced' | 'Expert'; mins: number; icon: IconName; desc: string }[] = [
  { id: 'interview', title: 'Multinational Interview', tag: 'Career', diff: 'Intermediate', mins: 18, icon: 'users', desc: 'Panel interview for a regional director role.' },
  { id: 'board', title: 'Board Meeting', tag: 'Leadership', diff: 'Advanced', mins: 25, icon: 'building', desc: 'Quarterly review with the board of directors.' },
  { id: 'negotiation', title: 'Commercial Negotiation', tag: 'Sales', diff: 'Advanced', mins: 22, icon: 'dollar', desc: 'Closing a multi-year enterprise contract.' },
  { id: 'results', title: 'Earnings Presentation', tag: 'Finance', diff: 'Advanced', mins: 20, icon: 'trending', desc: 'Present Q3 results to analysts and press.' },
  { id: 'budget', title: 'Budget Discussion', tag: 'Finance', diff: 'Intermediate', mins: 16, icon: 'report', desc: 'Defend departmental budget allocations.' },
  { id: 'strategy', title: 'Strategic Planning', tag: 'Leadership', diff: 'Advanced', mins: 24, icon: 'target', desc: 'Three-year roadmap alignment session.' },
  { id: 'crisis', title: 'Crisis Management', tag: 'Comms', diff: 'Expert', mins: 19, icon: 'alert', desc: 'Respond to a public reputational incident.' },
  { id: 'mna', title: 'M&A Discussion', tag: 'Corp Dev', diff: 'Expert', mins: 28, icon: 'layers', desc: 'Due diligence call on a target acquisition.' },
  { id: 'pitch', title: 'Investor Pitch', tag: 'Fundraising', diff: 'Advanced', mins: 15, icon: 'zap', desc: 'Series B pitch to a venture capital panel.' },
];

export const AI_PARTICIPANTS = [
  { name: 'Richard Hale', role: 'CEO', color: '#3b82f6', accent: 'British RP' },
  { name: 'Sofia Lindqvist', role: 'CFO', color: '#2dd4a7', accent: 'Nordic' },
  { name: 'Daniel Okonkwo', role: 'HR Director', color: '#9b8cff', accent: 'American' },
  { name: 'Yuki Tanaka', role: 'VP Sales', color: '#e7b35c', accent: 'Neutral' },
  { name: 'Helena Ross', role: 'Board Member', color: '#2dd4d4', accent: 'Australian' },
];

/** speaker: index into AI_PARTICIPANTS, or 'you' */
export const SIM_SCRIPT: { spk: number | 'you'; txt: string; flags?: Flag[] }[] = [
  { spk: 0, txt: "Thanks for joining. Let's open with your read on the Q3 numbers — what stands out to you?" },
  { spk: 'you', txt: 'Thank you, Richard. The headline is that recurring revenue grew, uh, fourteen percent quarter over quarter, ahead of our internal forecast.', flags: [{ type: 'filler', word: 'uh', note: 'Filler word detected' }] },
  { spk: 1, txt: 'Encouraging. But gross margin compressed slightly. How are you thinking about cost discipline going into Q4?' },
  { spk: 'you', txt: 'We are prioritizing the initiatives that has the highest return, and we will pause two lower-impact projects to protect the margin.', flags: [{ type: 'grammar', word: 'has', fix: 'have', note: 'Subject-verb agreement' }] },
  { spk: 3, txt: "From the sales side, what's the pipeline coverage looking like for the new targets?" },
  { spk: 'you', txt: 'Coverage is roughly three times quota. I am confident we can mitigate the shortfall through the enterprise segment.', flags: [{ type: 'win', word: 'mitigate', note: 'Strong vocabulary' }] },
  { spk: 4, txt: 'And on talent — are we resourced to deliver this plan, or do we need to revisit headcount?' },
  { spk: 'you', txt: 'We have the core team in place. I would like to add two senior hires in Q1 to de-risk the roadmap.', flags: [{ type: 'win', word: 'de-risk', note: 'Confident, precise' }] },
];

export const CLASS_TRANSCRIPT: { self: boolean; t: string; time: string; flag?: Flag }[] = [
  { self: false, t: "Let's practice the conditional. How would you phrase a hypothetical risk to the board?", time: '11:58' },
  { self: true, t: 'If the margin would compress further, we would need to revisit the forecast.', time: '12:04', flag: { type: 'grammar', word: 'would compress', fix: 'were to compress', note: 'Second conditional' } },
  { self: false, t: "Good instinct. In the second conditional we drop 'would' from the if-clause. Try again.", time: '12:11' },
  { self: true, t: 'If the margin compressed further, we would need to revisit the forecast.', time: '12:18', flag: { type: 'win', word: 'compressed', note: 'Corrected — clean second conditional' } },
];

export const CLASS_MARKERS = [
  { at: 8, label: 'Warm-up', color: '#7a87a1' },
  { at: 26, label: 'Grammar focus', color: '#3b82f6' },
  { at: 44, label: 'Filler word flagged', color: '#f5b942' },
  { at: 58, label: 'Vocabulary win', color: '#2dd4a7' },
  { at: 72, label: 'Role-play', color: '#9b8cff' },
];
