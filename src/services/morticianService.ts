import { Grave } from '../types';

export interface MorticianRank {
  title: string;
  level: string;
  badgeStyle: string;
  glowColor: string;
  description: string;
  nextRankTitle?: string;
  nextRankScore?: number;
  progressPercent: number;
}

export interface MorticianStats {
  totalGraves: number;
  totalRespects: number;
  totalEulogies: number;
  graveScore: number;
  rank: MorticianRank;
}

export interface TechItem {
  name: string;
  count: number;
  percentage: number;
}

export interface CauseItem {
  cause: string;
  count: number;
  percentage: number;
}

export interface TechAutopsyReport {
  techList: TechItem[];
  topTech: TechItem | null;
  totalUniqueTechs: number;
  causeDistribution: CauseItem[];
  topCause: CauseItem | null;
}

export const calculateMorticianStats = (graves: Grave[]): MorticianStats => {
  const totalGraves = graves.length;
  
  const totalRespects = graves.reduce((sum, g) => {
    const directRespects = typeof g.respects === 'number' ? g.respects : 0;
    const ripCount = Array.isArray(g.rips) ? g.rips.length : 0;
    return sum + Math.max(directRespects, ripCount);
  }, 0);

  const totalEulogies = graves.reduce((sum, g) => {
    if (!g.eulogies) return sum;
    if (Array.isArray(g.eulogies)) return sum + g.eulogies.length;
    return sum + Object.keys(g.eulogies).length;
  }, 0);

  // Balanced Mortician Scoring Formula:
  // 25 pts per project laid to rest
  // 5 pts per respect (F / RIP) received
  // 10 pts per eulogy inscribed
  const graveScore = (totalGraves * 25) + (totalRespects * 5) + (totalEulogies * 10);

  let rank: MorticianRank;

  if (graveScore >= 400) {
    rank = {
      title: 'Pantheon Necromancer',
      level: 'Tier V • Arch-Lich',
      badgeStyle: 'border-purple-500/70 text-purple-200 bg-purple-950/60 shadow-[0_0_20px_rgba(168,85,247,0.35)]',
      glowColor: 'rgba(168,85,247,0.4)',
      description: 'Supreme ruler of the crypts. Master of ancient codebase resurrections and eternal code eulogies.',
      progressPercent: 100
    };
  } else if (graveScore >= 200) {
    const progressPercent = Math.min(100, Math.round(((graveScore - 200) / 200) * 100));
    rank = {
      title: 'Grim Undertaker',
      level: 'Tier IV • Senior Mortician',
      badgeStyle: 'border-red-500/70 text-red-200 bg-red-950/60 shadow-[0_0_20px_rgba(239,68,68,0.35)]',
      glowColor: 'rgba(239,68,68,0.4)',
      description: 'Veteran executor of defunct repositories, broken roadmaps, and abandoned pull requests.',
      nextRankTitle: 'Pantheon Necromancer',
      nextRankScore: 400,
      progressPercent
    };
  } else if (graveScore >= 100) {
    const progressPercent = Math.min(100, Math.round(((graveScore - 100) / 100) * 100));
    rank = {
      title: 'Graveyard Architect',
      level: 'Tier III • Crypt Master',
      badgeStyle: 'border-amber-500/70 text-amber-200 bg-amber-950/60 shadow-[0_0_20px_rgba(245,158,11,0.35)]',
      glowColor: 'rgba(245,158,11,0.4)',
      description: 'Erects grand monuments and deep catacombs for visionary projects that met untimely ends.',
      nextRankTitle: 'Grim Undertaker',
      nextRankScore: 200,
      progressPercent
    };
  } else if (graveScore >= 35) {
    const progressPercent = Math.min(100, Math.round(((graveScore - 35) / 65) * 100));
    rank = {
      title: 'Cemetery Watcher',
      level: 'Tier II • Tomb Sentinel',
      badgeStyle: 'border-emerald-500/70 text-emerald-200 bg-emerald-950/60 shadow-[0_0_20px_rgba(16,185,129,0.35)]',
      glowColor: 'rgba(16,185,129,0.4)',
      description: 'Maintains quiet vigil over dormant branches, unmerged features, and silent issues.',
      nextRankTitle: 'Graveyard Architect',
      nextRankScore: 100,
      progressPercent
    };
  } else {
    const progressPercent = Math.min(100, Math.round((graveScore / 35) * 100));
    rank = {
      title: 'Crypt Novice',
      level: 'Tier I • Apprentice Gravedigger',
      badgeStyle: 'border-zinc-700 text-zinc-200 bg-zinc-900/90 shadow-[0_0_15px_rgba(113,113,122,0.25)]',
      glowColor: 'rgba(113,113,122,0.3)',
      description: 'Beginning the dark journey of laying abandoned dreams and stale git repositories to rest.',
      nextRankTitle: 'Cemetery Watcher',
      nextRankScore: 35,
      progressPercent
    };
  }

  return { totalGraves, totalRespects, totalEulogies, graveScore, rank };
};

export const getTechAutopsy = (graves: Grave[]): TechAutopsyReport => {
  const techCounts: Record<string, number> = {};
  const causeCounts: Record<string, number> = {};
  let totalTechMentions = 0;

  graves.forEach(grave => {
    if (grave.tech_stack) {
      const tags = grave.tech_stack
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      tags.forEach(rawTag => {
        // Normalize tag capitalization nicely
        const tag = rawTag.charAt(0).toUpperCase() + rawTag.slice(1);
        techCounts[tag] = (techCounts[tag] || 0) + 1;
        totalTechMentions += 1;
      });
    }

    if (grave.cause_of_death) {
      const cause = grave.cause_of_death.trim();
      causeCounts[cause] = (causeCounts[cause] || 0) + 1;
    }
  });

  const techList: TechItem[] = Object.entries(techCounts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: totalTechMentions > 0 ? Math.round((count / totalTechMentions) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count);

  const causeDistribution: CauseItem[] = Object.entries(causeCounts)
    .map(([cause, count]) => ({
      cause,
      count,
      percentage: graves.length > 0 ? Math.round((count / graves.length) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count);

  return {
    techList,
    topTech: techList.length > 0 ? techList[0] : null,
    totalUniqueTechs: techList.length,
    causeDistribution,
    topCause: causeDistribution.length > 0 ? causeDistribution[0] : null
  };
};
