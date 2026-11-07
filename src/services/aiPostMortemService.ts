/**
 * DevGraveyard - Client AI Post-Mortem Service
 * Connects to /api/postmortem serverless endpoint to safely query Gemini.
 * Never exposes API keys client-side.
 * Features an intelligent client-side heuristic engine fallback.
 */

import { trackAiPostMortemGenerated } from './analyticsService';

export interface PostMortemInput {
  projectName: string;
  causeOfDeath: string;
  livedFor?: string;
  techStack?: string;
  githubLink?: string;
  lessonLearned?: string;
}

export interface PostMortemDetailedResult {
  success: boolean;
  postMortem: string;
  quote: string;
  recommendations: string[];
  source: 'gemini' | 'heuristic-fallback' | 'client-fallback';
}

interface CausePerspective {
  intros: string[];
  insights: string[];
  lessons: string[];
  quotes: string[];
}

const CAUSE_PERSPECTIVES: Record<string, CausePerspective> = {
  'Scope Creep': {
    intros: [
      'Started as a weekend MVP and quickly mutated into a sprawling distributed architecture.',
      'The initial vision was clean, but feature after feature suffocated the core value proposition.',
      'More time was spent polishing hypothetical edge cases than shipping the core functionality to real users.',
    ],
    insights: [
      'Every added feature seemed essential at 2 AM, but collectively they introduced an unmaintainable surface area.',
      'Premature abstraction and roadmap ambition outpaced actual shipping velocity.',
      'Complexity accumulated faster than user feedback could validate it.',
    ],
    lessons: [
      'Ship the smallest embarrassing version first. Refuse new features until 10 strangers use it.',
      'Kill features before they kill the project. Constraints breed completion.',
      'Ruthless prioritization is not a nice-to-have; it is survival in the crypt.',
    ],
    quotes: [
      'A ship that attempts to carry every cargo will only find solace at the bottom of the sea.',
      'Scope expands to consume every hour of your youth unless walled by iron boundaries.',
    ]
  },
  'Framework Fatigue': {
    intros: [
      'Rewrote the frontend three times across different frameworks before ever writing real business logic.',
      'Seduced by shiny new tech stack paradigms and state management libraries.',
      'More time was spent fighting config files, hydration errors, and bundle sizes than solving the real problem.',
    ],
    insights: [
      'Boring technology gets shipped. Bleeding-edge tooling bled all the initial momentum dry.',
      'A simpler stack would have allowed launching months earlier with half the cognitive load.',
      'Chasing the newest tooling gave a false sensation of progress while the product remained unreleased.',
    ],
    lessons: [
      'Pick the stack you could build in your sleep. Novelty belongs in experiments, not MVPs.',
      'Tech stack choices should be made for users, not developer resume padding.',
      'Choose boring technology. Users care about whether it works, not what compiler built it.',
    ],
    quotes: [
      'The graveyard is full of clean abstractions that never handled a single real request.',
      'Do not trade execution for aesthetic configuration files.',
    ]
  },
  'Burnout': {
    intros: [
      'What began as a labor of deep passion gradually turned into an exhausting second shift.',
      'Solo late-night debugging marathons drained the creative joy until opening the IDE caused genuine dread.',
      'Pushed too hard in the opening weeks without pacing for the marathon of software maintenance.',
    ],
    insights: [
      'Building without community or resting intervals transforms side-project excitement into obligation.',
      'The silent pressure of unfinished GitHub issues took a heavy toll on personal energy.',
      'Creative endurance requires deliberate boundaries between work, creation, and rest.',
    ],
    lessons: [
      'Protect the spark. Work in short, bounded sprints and celebrate micro-milestones.',
      'Walking away to preserve mental clarity is a victory, not a defeat.',
      'Passion is a finite fuel. Pacing and self-care are essential technical skills.',
    ],
    quotes: [
      'Code written under the whip of burnout only produces ghosts that haunt future refactors.',
      'The developer must outlive the project.',
    ]
  },
  'Abandoned Prototypes': {
    intros: [
      'A brilliant proof-of-concept that solved the core algorithmic challenge, then lingered in repo limbo.',
      'The exhilarating spark of creating something from scratch faded the moment routine plumbing was required.',
      'Conceived in a hackathon frenzy, built with speed, but never given the bridge to production.',
    ],
    insights: [
      'Prototyping is intoxicating; productizing is grit and grind. We loved the first 20% and neglected the grueling 80%.',
      'The technical hypothesis was validated, but no distribution plan existed to breathe ongoing life into it.',
      'A repository full of working code means nothing without a commitment to usher it into the light.',
    ],
    lessons: [
      'Treat the prototype as an experiment. If not committing to launch, open-source and archive with pride.',
      'The code did its job by proving the idea. Some projects are meant to be stepping stones.',
      'Finish or release. Let dead prototypes teach you what to build next.',
    ],
    quotes: [
      'A prototype proves possibility; only perseverance proves value.',
      'Not every seedling is destined to become an ancient oak; some exist only to enrich the soil.',
    ]
  },
  'Solitary Maintenance': {
    intros: [
      'Building in a solitary vacuum without peer accountability or co-conspirators made every bug twice as heavy.',
      'Carrying design, backend, frontend, DevOps, and marketing alone became an insurmountable pyramid.',
      'Without collaborators to bounce ideas off of or share the debugging burden, momentum withered.',
    ],
    insights: [
      'Codebases thrive on shared enthusiasm. Isolation magnifies doubts and trivial obstacles.',
      'Single-maintainer syndrome is the most reliable silent killer of promising open-source tools.',
      'A project cannot survive solely on one person’s remaining free hours on Sunday evenings.',
    ],
    lessons: [
      'Find at least one peer or accountability partner before starting a multi-month build.',
      'Share work in public early to invite contributors and feedback before loneliness wins.',
      'Code is collaborative. Share the burden, amplify the joy.',
    ],
    quotes: [
      'He who builds alone in the digital dark must also bury alone.',
      'One pair of eyes creates the bugs; two pairs banish the terror.',
    ]
  },
  'Lack of Time': {
    intros: [
      'Crushed beneath the weight of full-time work, life commitments, and dwindling weekend hours.',
      'The vision demanded hours that reality simply refused to grant.',
      'Squeezed between client deadlines and daily life, the repo slipped further down the git log.',
    ],
    insights: [
      'Without dedicated, protected blocks of focus, a project bleeds to death one postponed evening at a time.',
      'Overestimated available bandwidth and underestimated maintenance overhead.',
      'Time was not lost; it was rightfully allocated to living. But the code paid the price.',
    ],
    lessons: [
      'Scope the project to fit into a single weekend or 5 hours a week max.',
      'If you don’t have time to build the palace, build a sturdy shack.',
      'Time constraints must dictate architecture, not the other way around.',
    ],
    quotes: [
      'Time is the grand executioner of all uncommitted dreams.',
      'Code unfinished is code unremembered.',
    ]
  },
  'Market Fit Missing': {
    intros: [
      'Built a technically immaculate solution for a problem that nobody was actually willing to pay for or use.',
      'Fell in love with the engineering elegance rather than the customer pain point.',
      'Launched into the void only to be met by the deafening silence of zero active users.',
    ],
    insights: [
      'Code is the easiest part of a business. Understanding real human behavior is the hardest.',
      'We wrote thousands of lines of code before having a single honest conversation with a target user.',
      'Elegance cannot compensate for apathy. The market always votes with its attention.',
    ],
    lessons: [
      'Talk to 20 potential users before writing line one of code.',
      'Pre-sell the idea, validate demand, and let customers pull the code out of you.',
      'Solve a bleeding neck problem, not a theoretical curiosity.',
    ],
    quotes: [
      'A bridge built over an empty chasm serves only the wind.',
      'The greatest tragedy of software is perfect execution of the wrong thing.',
    ]
  },
  'Technical Roadblocks': {
    intros: [
      'Hit an unyielding technical wall that shattered the foundational architecture of the project.',
      'Underestimated the sheer complexity of third-party APIs, distributed state, and edge case failures.',
      'The core dependency changed its license or API surface, leaving our roadmap underwater.',
    ],
    insights: [
      'Some technical roadblocks are warning signs from the universe that the underlying approach is flawed.',
      'Relying too heavily on fragile external integrations created vulnerabilities we could not patch.',
      'We spent weeks attempting to bypass limitations that were inherent to the chosen platform.',
    ],
    lessons: [
      'Spike test the riskiest technical unknown on Day 1 before building any UI.',
      'Decouple from volatile third parties and keep the core logic independent.',
      'Fail fast on the hardest technical risk before investing months of effort.',
    ],
    quotes: [
      'Not every mountain can be tunnelled through with sheer stubbornness before the candle burns out.',
      'Architecture without resilience is merely ruin in waiting.',
    ]
  },
  'Loss of Interest': {
    intros: [
      'The initial dopamine of creating something new dissipated once the repetitive architecture work began.',
      'A newer, shinier concept captured imagination, leaving this repository abandoned on branch main.',
      'What seemed groundbreaking on Friday felt irrelevant by the following month.',
    ],
    insights: [
      'Curiosity is erratic; discipline is steady. When curiosity jumped ship, there was no routine to keep it afloat.',
      'Software built solely for dopamine will be abandoned as soon as the dopamine fades.',
      'It is okay to acknowledge that not every curiosity needs to become an eternal commitment.',
    ],
    lessons: [
      'Tie the project to an active personal problem so you remain invested as a daily user.',
      'Finish small cycles to experience the joy of completion.',
      'Release early to let real users sustain your interest when your own begins to wane.',
    ],
    quotes: [
      'Passion is a flickering lantern; discipline is the stone that guards it from the wind.',
      'The graveyard claims that which is started in haste and abandoned in silence.',
    ]
  },
};

/**
 * Generates client-side fallback post-mortem when server is unreachable.
 */
export function getClientPostMortemFallback(input: PostMortemInput): PostMortemDetailedResult {
  const pName = input.projectName?.trim() || 'This project';
  const cause = input.causeOfDeath || 'Scope Creep';
  const perspective = CAUSE_PERSPECTIVES[cause] || CAUSE_PERSPECTIVES['Scope Creep'];

  const intro = perspective.intros[Math.floor(Math.random() * perspective.intros.length)];
  const insight = perspective.insights[Math.floor(Math.random() * perspective.insights.length)];
  const lesson = perspective.lessons[Math.floor(Math.random() * perspective.lessons.length)];
  const quote = perspective.quotes[Math.floor(Math.random() * perspective.quotes.length)];

  let techFlavor = '';
  if (input.techStack && input.techStack.trim().length > 0) {
    const lowerTech = input.techStack.toLowerCase();
    if (lowerTech.includes('rust') || lowerTech.includes('c++')) {
      techFlavor = ' Fighting memory lifetimes and compiler strictness added weeks of friction.';
    } else if (lowerTech.includes('kubernetes') || lowerTech.includes('docker') || lowerTech.includes('microservice')) {
      techFlavor = ' Infrastructure orchestration became heavier than the software it was hosting.';
    } else if (lowerTech.includes('react') || lowerTech.includes('next') || lowerTech.includes('vue')) {
      techFlavor = ' We got bogged down in UI component perfectionism rather than testing the real user loop.';
    } else if (lowerTech.includes('ai') || lowerTech.includes('llm') || lowerTech.includes('openai')) {
      techFlavor = ' Token costs and prompt nondeterminism quickly outpaced the prototype budget.';
    }
  }

  let lifespanNote = '';
  if (input.livedFor && input.livedFor.trim().length > 0) {
    lifespanNote = ` Across ${input.livedFor.trim()} of struggle,`;
  }

  const postMortem = `${intro}${lifespanNote ? ' ' + lifespanNote.trim() : ''} ${insight}${techFlavor}\n\n${lesson}`;

  return {
    success: true,
    postMortem,
    quote: `"${quote}"`,
    recommendations: perspective.lessons,
    source: 'client-fallback',
  };
}

/**
 * Requests a detailed gothic AI post-mortem from the serverless backend.
 */
export async function generateAiPostMortemDetails(input: PostMortemInput): Promise<PostMortemDetailedResult> {
  try {
    const response = await fetch('/api/postmortem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.success && typeof data.postMortem === 'string') {
        trackAiPostMortemGenerated(input.causeOfDeath);
        return {
          success: true,
          postMortem: data.postMortem,
          quote: data.quote || '',
          recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
          source: data.source || 'gemini',
        };
      }
    }
  } catch (err) {
    console.warn('[aiPostMortemService] Serverless call failed, engaging client fallback:', err);
  }

  trackAiPostMortemGenerated(input.causeOfDeath);
  return getClientPostMortemFallback(input);
}

/**
 * Primary interface for form inputs: returns an evocative formatted post-mortem string.
 */
export async function generateAiPostMortem(input: PostMortemInput): Promise<string> {
  const result = await generateAiPostMortemDetails(input);

  const parts = [
    result.quote ? result.quote : '',
    result.postMortem,
  ].filter(Boolean);

  return parts.join('\n\n').trim();
}
