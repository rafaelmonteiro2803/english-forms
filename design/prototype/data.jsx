/* ============================================================
   English Forms — realistic mock data
   ============================================================ */
const DATA = {
  student: {
    name: 'Marina Albuquerque', role: 'VP of Operations · Banco Atlas',
    level: 'B2', target: 'C1', score: 820, streak: 47,
  },
  scores: [
    { key: 'Business English', value: 86, color: 'var(--brand)', delta: '+4' },
    { key: 'Pronunciation', value: 78, color: 'var(--gold)', delta: '+2' },
    { key: 'Vocabulary', value: 92, color: 'var(--positive)', delta: '+6' },
    { key: 'Fluency', value: 84, color: 'var(--cyan)', delta: '+3' },
    { key: 'Confidence', value: 81, color: 'var(--purple)', delta: '+5' },
    { key: 'Listening', value: 88, color: 'var(--brand-bright)', delta: '+1' },
  ],
  perf12m: [612, 628, 641, 655, 649, 670, 688, 705, 728, 754, 788, 820],
  months: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  radarAxes: ['Fluency', 'Grammar', 'Pronunciation', 'Listening', 'Vocabulary', 'Confidence'],
  radarNow: [84, 79, 78, 88, 92, 81],
  radar3mo: [72, 70, 68, 80, 84, 70],
  scenarios: [
    { id: 'interview', title: 'Multinational Interview', tag: 'Career', diff: 'Intermediate', mins: 18, icon: 'users', desc: 'Panel interview for a regional director role.' },
    { id: 'board', title: 'Board Meeting', tag: 'Leadership', diff: 'Advanced', mins: 25, icon: 'building', desc: 'Quarterly review with the board of directors.' },
    { id: 'negotiation', title: 'Commercial Negotiation', tag: 'Sales', diff: 'Advanced', mins: 22, icon: 'dollar', desc: 'Closing a multi-year enterprise contract.' },
    { id: 'results', title: 'Earnings Presentation', tag: 'Finance', diff: 'Advanced', mins: 20, icon: 'trending', desc: 'Present Q3 results to analysts and press.' },
    { id: 'budget', title: 'Budget Discussion', tag: 'Finance', diff: 'Intermediate', mins: 16, icon: 'report', desc: 'Defend departmental budget allocations.' },
    { id: 'strategy', title: 'Strategic Planning', tag: 'Leadership', diff: 'Advanced', mins: 24, icon: 'target', desc: 'Three-year roadmap alignment session.' },
    { id: 'crisis', title: 'Crisis Management', tag: 'Comms', diff: 'Expert', mins: 19, icon: 'alert', desc: 'Respond to a public reputational incident.' },
    { id: 'mna', title: 'M&A Discussion', tag: 'Corp Dev', diff: 'Expert', mins: 28, icon: 'layers', desc: 'Due diligence call on a target acquisition.' },
    { id: 'pitch', title: 'Investor Pitch', tag: 'Fundraising', diff: 'Advanced', mins: 15, icon: 'zap', desc: 'Series B pitch to a venture capital panel.' },
  ],
  avatars: [
    { name: 'Richard Hale', role: 'CEO', color: '#3b82f6', accent: 'British RP' },
    { name: 'Sofia Lindqvist', role: 'CFO', color: '#2dd4a7', accent: 'Nordic' },
    { name: 'Daniel Okonkwo', role: 'HR Director', color: '#9b8cff', accent: 'American' },
    { name: 'Yuki Tanaka', role: 'VP Sales', color: '#e7b35c', accent: 'Neutral' },
    { name: 'Helena Ross', role: 'Board Member', color: '#2dd4d4', accent: 'Australian' },
  ],
  transcript: [
    { who: 'Richard Hale', role: 'CEO', t: "Marina, thanks for joining. Let's open with your read on the Q3 numbers — what stands out to you?", self: false, time: '00:12' },
    { who: 'You', role: 'Participant', t: "Thank you, Richard. The headline is that recurring revenue grew 14 percent quarter over quarter, which is, uh, ahead of our internal forecast.", self: true, time: '00:21', flags: [{ type: 'filler', word: 'uh' }] },
    { who: 'Sofia Lindqvist', role: 'CFO', t: 'Encouraging. But margins compressed slightly. How are you thinking about cost discipline going into Q4?', self: false, time: '00:38' },
    { who: 'You', role: 'Participant', t: "We are prioritizing the initiatives that has the highest return, and we will pause two lower-impact projects to protect the margin.", self: true, time: '00:47', flags: [{ type: 'grammar', word: 'has', fix: 'have' }] },
  ],
  liveAnalysis: {
    grammar: [{ text: "'initiatives that has' → subject-verb agreement", sev: 'med', fix: "use 'have'" }],
    pronunciation: [{ text: "'margin' — vowel reduction on 2nd syllable", sev: 'low' }, { text: "'forecast' stress on 1st syllable", sev: 'low' }],
    vocabulary: [{ text: "Strong: 'recurring revenue', 'cost discipline'", sev: 'good' }, { text: "Try 'mitigate' instead of 'protect'", sev: 'tip' }],
  },
  subScores: [
    { key: 'Grammar', v: 79 }, { key: 'Vocabulary', v: 92 }, { key: 'Pronunciation', v: 78 },
    { key: 'Listening', v: 88 }, { key: 'Business English', v: 86 }, { key: 'Fluency', v: 84 },
    { key: 'Confidence', v: 81 }, { key: 'Negotiation', v: 74 }, { key: 'Presentation', v: 83 },
  ],
  strengths: [
    { t: 'Executive vocabulary range', d: 'Used 9 advanced finance terms accurately.', v: 92 },
    { t: 'Active listening cues', d: 'Acknowledged each speaker before responding.', v: 90 },
    { t: 'Structured answers', d: 'Clear point-evidence-conclusion flow.', v: 88 },
    { t: 'Composure under pressure', d: 'Steady pace during the margin challenge.', v: 85 },
    { t: 'Data fluency', d: 'Quoted precise figures without hesitation.', v: 84 },
  ],
  improvements: [
    { t: 'Subject-verb agreement', d: '3 slips under cognitive load.', v: 62 },
    { t: 'Filler words', d: "7 instances of 'uh' / 'you know'.", v: 58 },
    { t: 'Hedging language', d: 'Over-used "kind of" and "a little".', v: 64 },
    { t: 'Vowel reduction', d: 'Unstressed syllables too full.', v: 70 },
    { t: 'Closing strength', d: 'Endings trailed off in pitch.', v: 67 },
  ],
  actions: [
    { t: 'Drill: subject-verb under pressure', mins: 15, type: 'Grammar', icon: 'book' },
    { t: 'Shadowing: BBC Business Review', mins: 20, type: 'Pronunciation', icon: 'volume' },
    { t: 'Re-run: Earnings Presentation', mins: 20, type: 'Simulation', icon: 'mic' },
    { t: 'Vocabulary set: hedging → assertive', mins: 10, type: 'Vocabulary', icon: 'layers' },
  ],
  cefr: [
    { l: 'A1', score: 180 }, { l: 'A2', score: 320 }, { l: 'B1', score: 480 },
    { l: 'B2', score: 720 }, { l: 'C1', score: 880 }, { l: 'C2', score: 980 },
  ],
  exams: [
    { name: 'TOEFL iBT', now: 94, max: 120, band: 'B2+' },
    { name: 'IELTS', now: 7.0, max: 9, band: 'B2+' },
    { name: 'TOEIC', now: 855, max: 990, band: 'B2' },
  ],
  students: [
    { name: 'Carlos Menezes', role: 'CFO · Vinci', score: 905, lvl: 'C1', trend: 'up', d: '+18', risk: false, hrs: 64, attn: 96, spark: [840, 855, 870, 880, 905] },
    { name: 'Aline Ferraz', role: 'Director · Itaú', score: 868, lvl: 'C1', trend: 'up', d: '+11', risk: false, hrs: 58, attn: 92, spark: [820, 835, 848, 860, 868] },
    { name: 'Marina Albuquerque', role: 'VP Ops · Atlas', score: 820, lvl: 'B2', trend: 'up', d: '+9', risk: false, hrs: 52, attn: 94, spark: [788, 798, 808, 815, 820] },
    { name: 'Rafael Pinto', role: 'Manager · Localiza', score: 742, lvl: 'B2', trend: 'flat', d: '+1', risk: false, hrs: 40, attn: 78, spark: [738, 742, 740, 741, 742] },
    { name: 'Bruno Caldas', role: 'Lead · Nubank', score: 690, lvl: 'B1', trend: 'down', d: '-6', risk: true, hrs: 22, attn: 61, spark: [712, 705, 700, 696, 690] },
    { name: 'Patrícia Lemos', role: 'Analyst · XP', score: 654, lvl: 'B1', trend: 'flat', d: '0', risk: true, hrs: 18, attn: 55, spark: [656, 654, 655, 653, 654] },
  ],
  recurringErrors: [
    { e: 'Subject-verb agreement', n: 142, pct: 24 },
    { e: 'Article omission (a/the)', n: 118, pct: 20 },
    { e: 'Preposition choice', n: 96, pct: 16 },
    { e: 'Verb tense consistency', n: 81, pct: 14 },
    { e: 'False cognates', n: 67, pct: 11 },
  ],
  admin: {
    kpis: [
      { label: 'Total Students', value: '1,284', delta: '+8.2%', dir: 'up', spark: [1050, 1090, 1140, 1180, 1230, 1284] },
      { label: 'Hours Taught', value: '18.4k', delta: '+12%', dir: 'up', spark: [12, 13.5, 15, 16, 17.2, 18.4] },
      { label: 'Hours Simulated', value: '9,720', delta: '+34%', dir: 'up', spark: [4, 5.2, 6.4, 7.8, 8.9, 9.7] },
      { label: 'Engagement', value: '87%', delta: '+3pt', dir: 'up', spark: [79, 81, 83, 84, 86, 87] },
      { label: 'Retention', value: '94%', delta: '+1pt', dir: 'up', spark: [90, 91, 92, 93, 93, 94] },
      { label: 'Conversion', value: '31%', delta: '+5pt', dir: 'up', spark: [22, 24, 26, 28, 30, 31] },
      { label: 'NPS', value: '72', delta: '+6', dir: 'up', spark: [58, 62, 64, 67, 70, 72] },
      { label: 'Avg Proficiency', value: '748', delta: '+22', dir: 'up', spark: [690, 705, 718, 728, 740, 748] },
    ],
  },
};
window.DATA = DATA;
