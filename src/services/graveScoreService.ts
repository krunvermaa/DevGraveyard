import { Grave } from '../types';

export const GITHUB_REPO_REGEX = /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/?$/;

/**
 * Validates whether a given string is a valid GitHub repository URL.
 * Matches formats like:
 * - https://github.com/username/repository
 * - https://www.github.com/username/repository/
 * - http://github.com/username/repository
 */
export const isValidGithubRepoUrl = (url?: string | null): boolean => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  return GITHUB_REPO_REGEX.test(trimmed);
};

export interface GraveScoreBreakdown {
  lessonsWisdom: number;       // 0 - 300 pts
  mourningTributes: number;    // 15 pts per Respect, 35 pts per Eulogy
  lifespanEndurance: number;   // 10 - 150 pts
  openSourceSanctity: number;  // +75 pts for valid verified GitHub repo
  techComplexity: number;      // +10 pts per unique technology, up to +50
  totalScore: number;
}

export type GraveTierName =
  | 'Humble Headstone'
  | 'Venerable Crypt'
  | 'Monument of the Slain'
  | 'Mythic Mausoleum';

export interface GraveTier {
  name: GraveTierName;
  minScore: number;
  maxScore: number | null;
  badgeColor: string;
  borderColor: string;
  textColor: string;
  bgColor: string;
  glowColor: string;
  icon: string;
  description: string;
}

const TIER_DEFINITIONS: Record<GraveTierName, GraveTier> = {
  'Humble Headstone': {
    name: 'Humble Headstone',
    minScore: 0,
    maxScore: 99,
    badgeColor: 'border-zinc-700 bg-zinc-900/80 text-zinc-400',
    borderColor: 'border-zinc-700',
    textColor: 'text-zinc-400',
    bgColor: 'bg-zinc-900/80',
    glowColor: 'rgba(113, 113, 122, 0.2)',
    icon: '🪦',
    description: 'A modest stone marking a creative spark, resting peacefully in quiet repose.'
  },
  'Venerable Crypt': {
    name: 'Venerable Crypt',
    minScore: 100,
    maxScore: 299,
    badgeColor: 'border-emerald-800/80 bg-emerald-950/60 text-emerald-400',
    borderColor: 'border-emerald-700',
    textColor: 'text-emerald-400',
    bgColor: 'bg-emerald-950/60',
    glowColor: 'rgba(16, 185, 129, 0.25)',
    icon: '🏛️',
    description: 'An honorable resting sanctuary carrying genuine wisdom and community tributes.'
  },
  'Monument of the Slain': {
    name: 'Monument of the Slain',
    minScore: 300,
    maxScore: 699,
    badgeColor: 'border-[#c53030]/70 bg-[#c53030]/15 text-[#f87171]',
    borderColor: 'border-[#c53030]',
    textColor: 'text-[#f87171]',
    bgColor: 'bg-[#c53030]/15',
    glowColor: 'rgba(197, 48, 48, 0.45)',
    icon: '⚔️',
    description: 'A towering stone monolith etched with hard-fought scars, mourned by fellow devs.'
  },
  'Mythic Mausoleum': {
    name: 'Mythic Mausoleum',
    minScore: 700,
    maxScore: null,
    badgeColor: 'border-amber-500/80 bg-amber-950/60 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.25)]',
    borderColor: 'border-amber-500',
    textColor: 'text-amber-300',
    bgColor: 'bg-amber-950/60',
    glowColor: 'rgba(245, 158, 11, 0.5)',
    icon: '👑',
    description: 'An immortal resting temple of legendary code and eternal retrospection.'
  }
};

const WISDOM_KEYWORDS = [
  'learn', 'learnt', 'lesson', 'mistake', 'pivot', 'market', 'user', 'customer',
  'monetiz', 'burnout', 'test', 'mvp', 'overengineer', 'scope', 'tech debt',
  'refactor', 'architect', 'focus', 'feedback', 'fail', 'failure', 'launch',
  'simpl', 'regret', 'instead', 'future', 'hindsight', 'rethink', 'validate',
  'assum', 'priorit', 'traction', 'pricing', 'scale', 'scaling'
];

/**
 * Calculates Lessons Wisdom score (0 - 300 pts)
 * Combines reflection length with wisdom keywords for depth analysis.
 */
export const calculateLessonsWisdom = (lesson?: string): number => {
  if (!lesson || typeof lesson !== 'string') return 0;
  const trimmed = lesson.trim();
  const len = trimmed.length;
  if (len === 0) return 0;

  // Base score from text length (0 to 260)
  let baseScore = 0;
  if (len < 20) {
    baseScore = 15;
  } else if (len <= 50) {
    baseScore = 15 + Math.round(((len - 20) / 30) * 35); // 15 -> 50
  } else if (len <= 120) {
    baseScore = 50 + Math.round(((len - 50) / 70) * 60); // 50 -> 110
  } else if (len <= 250) {
    baseScore = 110 + Math.round(((len - 120) / 130) * 80); // 110 -> 190
  } else if (len <= 500) {
    baseScore = 190 + Math.round(((len - 250) / 250) * 60); // 190 -> 250
  } else {
    // 500+ characters
    baseScore = 250 + Math.min(20, Math.floor((len - 500) / 100) * 5); // up to 270
  }

  // Bonus for reflective depth & wisdom vocabulary (up to +40 pts)
  const lower = trimmed.toLowerCase();
  let keywordMatches = 0;
  for (const kw of WISDOM_KEYWORDS) {
    if (lower.includes(kw)) {
      keywordMatches++;
    }
  }
  const wisdomBonus = Math.min(40, keywordMatches * 8);

  const total = baseScore + wisdomBonus;
  return Math.min(300, Math.max(0, total));
};

/**
 * Calculates Mourning Tributes:
 * 15 pts per Respect (F)
 * 35 pts per Eulogy
 */
export const calculateMourningTributes = (grave: Partial<Grave>): { respectsScore: number; eulogiesScore: number; total: number } => {
  let respectsCount = 0;
  if (typeof grave.respects === 'number' && !isNaN(grave.respects)) {
    respectsCount = Math.max(0, grave.respects);
  } else if (Array.isArray(grave.rips)) {
    respectsCount = grave.rips.length;
  }

  let eulogiesCount = 0;
  if (Array.isArray(grave.eulogies)) {
    eulogiesCount = grave.eulogies.length;
  } else if (grave.eulogies && typeof grave.eulogies === 'object') {
    eulogiesCount = Object.keys(grave.eulogies).length;
  }

  const respectsScore = respectsCount * 15;
  const eulogiesScore = eulogiesCount * 35;
  const total = respectsScore + eulogiesScore;

  return { respectsScore, eulogiesScore, total };
};

/**
 * Calculates Lifespan Endurance (10 - 150 pts)
 * Evaluates the duration the project was actively pursued.
 */
export const calculateLifespanEndurance = (livedFor?: string): number => {
  if (!livedFor || typeof livedFor !== 'string') return 10;
  const text = livedFor.trim().toLowerCase();
  if (!text) return 10;

  // Check for common time units
  const yearMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:year|yr)s?/);
  const monthMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:month|mo)s?/);
  const weekMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:week|wk)s?/);
  const dayMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:day)s?/);
  const hourMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:hour|hr)s?/);

  let estimatedDays: number | null = null;

  if (yearMatch) {
    estimatedDays = parseFloat(yearMatch[1]) * 365;
  } else if (text.includes('decade')) {
    estimatedDays = 3650;
  } else if (text.includes('a year') || text.includes('one year')) {
    estimatedDays = 365;
  } else if (monthMatch) {
    estimatedDays = parseFloat(monthMatch[1]) * 30;
  } else if (text.includes('half a year') || text.includes('half year')) {
    estimatedDays = 180;
  } else if (text.includes('a month') || text.includes('one month')) {
    estimatedDays = 30;
  } else if (weekMatch) {
    estimatedDays = parseFloat(weekMatch[1]) * 7;
  } else if (text.includes('a week') || text.includes('one week')) {
    estimatedDays = 7;
  } else if (text.includes('weekend')) {
    const weekendCountMatch = text.match(/(\d+)\s*weekend/);
    estimatedDays = (weekendCountMatch ? parseInt(weekendCountMatch[1], 10) : 1) * 2.5;
  } else if (text.includes('hackathon')) {
    estimatedDays = 2;
  } else if (text.includes('sprint')) {
    estimatedDays = 14;
  } else if (dayMatch) {
    estimatedDays = parseFloat(dayMatch[1]);
  } else if (hourMatch) {
    estimatedDays = parseFloat(hourMatch[1]) / 24;
  }

  if (estimatedDays === null) {
    // Fallback if textual description cannot be numerically parsed
    if (text.length > 2) return 25;
    return 10;
  }

  // Map estimated days to 10 - 150 points
  if (estimatedDays <= 2) {
    return 15;
  } else if (estimatedDays <= 7) {
    return 25;
  } else if (estimatedDays <= 14) {
    return 40;
  } else if (estimatedDays <= 30) {
    return 55;
  } else if (estimatedDays <= 60) {
    return 75;
  } else if (estimatedDays <= 90) {
    return 90;
  } else if (estimatedDays <= 180) {
    return 110;
  } else if (estimatedDays <= 365) {
    return 130;
  } else if (estimatedDays <= 730) {
    return 145;
  } else {
    return 150;
  }
};

/**
 * Calculates Open Source Sanctity:
 * +75 pts for valid verified GitHub repo URL, 0 otherwise.
 */
export const calculateOpenSourceSanctity = (githubLink?: string): number => {
  return isValidGithubRepoUrl(githubLink) ? 75 : 0;
};

/**
 * Calculates Tech Complexity (+10 pts per unique technology, up to +50 pts)
 */
export const calculateTechComplexity = (techStack?: string): number => {
  if (!techStack || typeof techStack !== 'string') return 0;
  const trimmed = techStack.trim();
  if (!trimmed) return 0;

  // Split by comma, semicolon, slash, bullet, or newline
  const tokens = trimmed
    .split(/[,;/|•\n+]/)
    .map(t => t.trim().toLowerCase())
    .filter(t => t.length > 0);

  const unique = new Set(tokens);
  return Math.min(50, unique.size * 10);
};

/**
 * Returns a comprehensive, transparent breakdown of the GraveScore for any grave.
 */
export const calculateGraveScoreBreakdown = (grave: Partial<Grave>): GraveScoreBreakdown => {
  const lessonsWisdom = calculateLessonsWisdom(grave.lesson_learned);
  const tributes = calculateMourningTributes(grave);
  const lifespanEndurance = calculateLifespanEndurance(grave.lived_for);
  const openSourceSanctity = calculateOpenSourceSanctity(grave.github_link);
  const techComplexity = calculateTechComplexity(grave.tech_stack);

  const totalScore = lessonsWisdom + tributes.total + lifespanEndurance + openSourceSanctity + techComplexity;

  return {
    lessonsWisdom,
    mourningTributes: tributes.total,
    lifespanEndurance,
    openSourceSanctity,
    techComplexity,
    totalScore
  };
};

/**
 * Main score calculator function.
 * Returns integer total score >= 0.
 */
export const calculateGraveScore = (grave: Partial<Grave>): number => {
  return calculateGraveScoreBreakdown(grave).totalScore;
};

/**
 * Returns the Grave Tier assigned to a given score:
 * - 0 - 99: "Humble Headstone"
 * - 100 - 299: "Venerable Crypt"
 * - 300 - 699: "Monument of the Slain"
 * - 700+: "Mythic Mausoleum"
 */
export const getGraveTier = (score: number): GraveTier => {
  if (score >= 700) {
    return TIER_DEFINITIONS['Mythic Mausoleum'];
  }
  if (score >= 300) {
    return TIER_DEFINITIONS['Monument of the Slain'];
  }
  if (score >= 100) {
    return TIER_DEFINITIONS['Venerable Crypt'];
  }
  return TIER_DEFINITIONS['Humble Headstone'];
};

/**
 * Calculates the total cumulative GraveScore for a user across all their laid to rest projects.
 */
export const calculateUserTotalScore = (graves: Partial<Grave>[]): number => {
  if (!Array.isArray(graves) || graves.length === 0) return 0;
  return graves.reduce((sum, grave) => sum + calculateGraveScore(grave), 0);
};
