import { PostMortem, CauseOfDeath } from '../types';

interface ProjectInput {
  projectName: string;
  causeOfDeath: string;
  techStack?: string;
  lessonLearned: string;
  livedFor?: string;
}

/**
 * Generates an evidence-grounded post-mortem and prevention checklist.
 * If VITE_GEMINI_API_KEY is configured, it calls Gemini to generate structured output.
 * Otherwise, it uses an intelligent rule-based domain engine that parses submitted details.
 */
export async function generatePostMortem(input: ProjectInput): Promise<PostMortem> {
  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (geminiApiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an expert software engineering post-mortem analyst for DevGraveyard.
Analyze this abandoned project:
- Project Name: ${input.projectName}
- Reported Cause of Death: ${input.causeOfDeath}
- Lived for: ${input.livedFor || 'Unknown'}
- Tech Stack: ${input.techStack || 'Not specified'}
- Author's Stated Lesson: "${input.lessonLearned}"

Requirements:
1. rootCauseHypothesis: 1 concise sentence identifying the primary root cause.
2. contributingFactors: 2-3 bullet factors.
3. warningSigns: 2-3 observable warning signs developer could have caught early.
4. preventionChecklist: 3-4 actionable, concrete steps for next time.
5. evidence: 1-2 exact quotes or grounded snippets directly from the author's input.
6. confidence: "high", "medium", or "low".

Return ONLY a JSON object with this exact schema:
{
  "rootCauseHypothesis": "string",
  "contributingFactors": ["string"],
  "warningSigns": ["string"],
  "preventionChecklist": ["string"],
  "evidence": ["string"],
  "confidence": "high" | "medium" | "low"
}`
                  }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: "application/json"
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text) as PostMortem;
          return {
            ...parsed,
            generatedAt: new Date().toISOString()
          };
        }
      }
    } catch (err) {
      console.warn("Gemini generation failed, falling back to heuristic engine", err);
    }
  }

  // Domain-specific heuristic engine grounded in submitted evidence
  return generateHeuristicPostMortem(input);
}

function generateHeuristicPostMortem(input: {
  projectName: string;
  causeOfDeath: string;
  techStack?: string;
  lessonLearned: string;
  livedFor?: string;
}): PostMortem {
  const cause = input.causeOfDeath;
  const lessons = input.lessonLearned.trim();
  const stack = input.techStack ? input.techStack.trim() : '';

  let rootCause = `${cause} led to project velocity stagnation.`;
  const factors: string[] = [];
  const warnings: string[] = [];
  const checklist: string[] = [];
  const evidence: string[] = [
    `Author reported: "${lessons.length > 90 ? lessons.slice(0, 90) + '...' : lessons}"`
  ];

  if (stack) {
    factors.push(`Technology footprint: [${stack}]`);
  }

  switch (cause) {
    case CauseOfDeath.SCOPE_CREEP:
      rootCause = "Unbounded feature expansion before establishing core user retention.";
      factors.push("Lack of strict MVP boundaries and continuous addition of secondary features.");
      factors.push("Feedback cycle delayed while waiting for a 'complete' version.");
      warnings.push("Backlog grew faster than completed user flows.");
      warnings.push("Initial release date pushed multiple times for non-essential features.");
      checklist.push("Time-box MVP to maximum 3 core features before public testing.");
      checklist.push("Require user validation interviews before adding unproven capabilities.");
      checklist.push("Enforce a freeze on new features until v1.0 is in active hands.");
      break;

    case CauseOfDeath.LACK_OF_TIME:
      rootCause = "Commitment mismatch between project scope and available developer bandwidth.";
      factors.push("Architecture complexity exceeded available maintenance time.");
      factors.push("Context switching between primary responsibilities and side-project sprints.");
      warnings.push("Weeks elapsed between commits with high cognitive re-entry friction.");
      warnings.push("Maintenance tasks (deps, config) overshadowed new feature work.");
      checklist.push("Scope side-projects to manageable 4-8 hour weekly commitments.");
      checklist.push("Prefer serverless or zero-maintenance infrastructure over complex stacks.");
      checklist.push("Automate deployment and linting from day one to minimize ops overhead.");
      break;

    case CauseOfDeath.TECHNICAL_ROADBLOCKS:
      rootCause = "Unresolved architectural friction or dependency constraint.";
      factors.push(`Tooling/library integration challenges with ${stack || 'selected technologies'}.`);
      factors.push("Late discovery of platform limits or unmaintainable complexity.");
      warnings.push("Significant hours spent debugging fundamental infrastructure instead of product logic.");
      warnings.push("Workarounds and monkey-patches compounding technical debt.");
      checklist.push("Spike critical path technical risks in a throwaway prototype first.");
      checklist.push("Choose boring, proven technologies for 80% of the stack.");
      checklist.push("Set a 48-hour timebox for third-party blockers before pivoting architecture.");
      break;

    case CauseOfDeath.MARKET_FIT_MISSING:
      rootCause = "Solution developed without continuous alignment to verified user demand.";
      factors.push("Building in isolation prior to talking with target users.");
      factors.push("Assumptions about customer pain points remained untested.");
      warnings.push("Low engagement on early landing page or demo previews.");
      warnings.push("Difficulty explaining the 10-second value proposition to peers.");
      checklist.push("Interview 5 potential users before writing production code.");
      checklist.push("Set up a landing page with email capture to gauge intent.");
      checklist.push("Define quantitative kill/pivot criteria prior to deep development.");
      break;

    case CauseOfDeath.LOSS_OF_INTEREST:
      rootCause = "Enthusiasm decayed once initial novel problem-solving gave way to grind.";
      factors.push("Long development cycle without intermediary dopamine/feedback loops.");
      factors.push("Solo development fatigue without peer accountability or community.");
      warnings.push("Procrastinating routine tasks in favor of starting newer ideas.");
      warnings.push("Project felt like an obligation rather than an experiment.");
      checklist.push("Ship micro-milestones publicly every 7 days (build in public).");
      checklist.push("Partner with an accountability buddy or co-builder.");
      checklist.push("Embrace shipping rough experiments rather than polished monoliths.");
      break;

    case CauseOfDeath.CO_FOUNDER_CONFLICT:
      rootCause = "Divergent visions and unaligned equity/contribution expectations.";
      factors.push("Lack of documented decision-making framework and ownership split.");
      factors.push("Conflicting priorities on roadmap direction and commercial goals.");
      warnings.push("Unspoken friction during architectural or design choices.");
      warnings.push("Unequal distribution of hours leading to resentment.");
      checklist.push("Draft a lightweight founder vesting & role charter before writing code.");
      checklist.push("Establish a tie-breaker mechanism for architectural disputes.");
      checklist.push("Hold weekly candid retrospectives on team dynamics.");
      break;

    default:
      rootCause = `Project sunset due to ${cause.toLowerCase()}.`;
      factors.push("Multiple shifting priorities and incomplete feedback loops.");
      warnings.push("Declining momentum and slowed iteration cadence.");
      checklist.push("Conduct periodic retrospective to evaluate continuation vs sunset.");
      checklist.push("Document lessons learned immediately while fresh.");
      break;
  }

  return {
    rootCauseHypothesis: rootCause,
    contributingFactors: factors,
    warningSigns: warnings,
    preventionChecklist: checklist,
    evidence,
    confidence: lessons.length > 50 ? 'high' : 'medium',
    generatedAt: new Date().toISOString()
  };
}
