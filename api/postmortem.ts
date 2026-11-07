/**
 * DevGraveyard - Vercel Serverless Function: AI Post-Mortem Generator
 * Route: POST /api/postmortem
 *
 * Securely calls Google Gemini API server-side using process.env.GEMINI_API_KEY.
 * Never exposes API keys to client bundles.
 * Provides high-fidelity gothic developer fallback post-mortems if API key is missing or call fails.
 */

export interface PostMortemRequestBody {
  projectName: string;
  causeOfDeath?: string;
  techStack?: string;
  lessonLearned?: string;
}

export interface PostMortemResult {
  success: boolean;
  postMortem: string;
  quote: string;
  recommendations: string[];
  source?: 'gemini' | 'heuristic-fallback';
  error?: string;
}

// Intelligent Gothic Post-Mortem Heuristic Generator
export function generateHeuristicPostMortem(data: PostMortemRequestBody): PostMortemResult {
  const name = data.projectName?.trim() || "The Nameless Codebase";
  const cause = data.causeOfDeath?.trim() || "Abandonment into the Void";
  const tech = data.techStack?.trim() || "an ephemeral stack of fleeting dependencies";
  const lesson = data.lessonLearned?.trim() || "Some truths are only learned when the terminal goes dark.";

  // Tailored narrative based on Cause of Death
  let narrativeCause = "";
  let causeAphorism = "";

  switch (cause.toLowerCase()) {
    case "scope creep":
      narrativeCause = `What began as a pure, focused lantern against the darkness metastasized into an ungovernable labyrinth of half-formed features, endless backlogs, and sprawling architecture that collapsed under the weight of its own unbridled ambition.`;
      causeAphorism = `"A ship that attempts to carry every cargo will only find solace at the bottom of the sea."`;
      break;
    case "loss of interest":
      narrativeCause = `The spark that ignited its initial commits slowly waned into ember, then ash. The glowing dopamine of the 'Initial Commit' gave way to the cold, silent grind of maintenance—until the repository was abandoned like an unvisited chapel in the digital wilderness.`;
      causeAphorism = `"Passion is a fickle ghost; without discipline, it leaves behind only half-built cathedrals."`;
      break;
    case "technical roadblocks":
      narrativeCause = `The mortal vessel collided with insurmountable algorithmic abysses, arcane third-party API deprecations, and architectural bottlenecks that refused to yield to late-night refactorings and weary incantations.`;
      causeAphorism = `"Not every mountain can be tunnelled through with sheer stubbornness before the candle burns out."`;
      break;
    case "market fit missing":
      narrativeCause = `A masterpiece crafted in solitary confinement, elegant in its syntax yet unsummoned by the living world. It waited at the gates for pilgrims that never arrived, its landing pages whispering to empty analytics dashboards.`;
      causeAphorism = `"A bridge built over an empty chasm serves only the wind."`;
      break;
    case "lack of time":
      narrativeCause = `Strangled in its infancy by the relentless demands of the daylight world—day jobs, mortal obligations, and the finite march of seconds. The commits grew sparser, separated by weeks, then months, until silence claimed the branch.`;
      causeAphorism = `"Time is the grand executioner of all uncommitted dreams."`;
      break;
    case "co-founder conflict":
      narrativeCause = `A vision torn between discordant architects. Where once existed shared communion and unified pull requests, ideological fractures and divergent trajectories tore the foundation in twain until neither could bear the sight of the codebase.`;
      causeAphorism = `"Two captains at a single helm will steer even the sturdiest vessel directly into the reefs."`;
      break;
    default:
      narrativeCause = `Under the tragic shadow of ${cause}, the architecture succumbed to entropy, leaving behind silent git commits etched like epitaphs on forgotten servers.`;
      causeAphorism = `"In the vast graveyard of software, even the most daring visions eventually surrender to the grave."`;
      break;
  }

  const postMortem = [
    `Here lies "${name}", constructed with ${tech}. In the twilight of its inception, it promised salvation and boundless utility. Yet fate, relentless and unyielding, decreed otherwise: ${narrativeCause}`,
    `Its demise was consecrated with the hard-won epitaph: "${lesson}". Though the repository now lies archived and the build runners stand idle, its lessons remain etched in stone for all wandering developers to heed.`,
    `Rest in peace, ${name}. Your lines of code are buried, but the wisdom distilled in your defeat is immortal.`
  ].join("\n\n");

  const recommendations = [
    `Guard thy scope with iron discipline: carve an MVP that breathes before architecting an empire.`,
    `Honor the mortal hour: commit to codebases that align with your true bandwidth, or let them rest before they torment you.`,
    `Mourn briefly, learn deeply: the death of ${name} is not a failure, but the necessary fertile soil for your next creation.`
  ];

  return {
    success: true,
    postMortem,
    quote: causeAphorism,
    recommendations,
    source: 'heuristic-fallback'
  };
}

// Google Gemini API Caller
async function callGeminiApi(apiKey: string, data: PostMortemRequestBody): Promise<PostMortemResult> {
  const name = data.projectName || "Unknown Project";
  const cause = data.causeOfDeath || "Unspecified";
  const tech = data.techStack || "Unspecified";
  const lesson = data.lessonLearned || "None recorded";

  const systemInstruction = `You are the Grand Cryptkeeper of DevGraveyard, an ancient gothic digital necropolis where abandoned software, fallen startups, and buried side projects rest for eternity.
Your demeanor is gothic, darkly atmospheric, brooding, yet deeply respectful and empathetic toward the fallen developer and their doomed creation.
You dissect the technical and human tragedy of why projects die, extracting philosophical epigraphs and pragmatic architectural post-mortem lessons.`;

  const prompt = `Perform an official DevGraveyard Gothic Post-Mortem on the deceased project:
- Project Name: "${name}"
- Cause of Death: "${cause}"
- Tech Stack / Architecture: "${tech}"
- Lesson Learned: "${lesson}"

Respond ONLY with a valid JSON object matching this exact schema:
{
  "postMortem": "A compelling, 2 to 3 paragraph gothic developer post-mortem analyzing the birth, demise, and solemn rest of the project.",
  "quote": "A single dark, unforgettable gothic aphorism or epigraph summarizing this project's mortality.",
  "recommendations": [
    "A direct, insightful, slightly gothic developer recommendation or architectural lesson 1",
    "A direct, insightful, slightly gothic developer recommendation or architectural lesson 2",
    "A direct, insightful, slightly gothic developer recommendation or architectural lesson 3"
  ]
}`;

  // Try Gemini 1.5 Flash first, with standard API URL
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemInstruction}\n\n${prompt}` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json"
      }
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`Gemini API error (HTTP ${response.status}): ${errorBody}`);
  }

  const result = await response.json();
  const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error("Empty response from Gemini API");
  }

  // Parse JSON from text (handling markdown code fences if present)
  let cleanJson = rawText.trim();
  if (cleanJson.startsWith('```json')) {
    cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleanJson.startsWith('```')) {
    cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  const parsed = JSON.parse(cleanJson);

  return {
    success: true,
    postMortem: typeof parsed.postMortem === 'string' ? parsed.postMortem : String(parsed.postMortem || ''),
    quote: typeof parsed.quote === 'string' ? parsed.quote : String(parsed.quote || ''),
    recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.map(String) : [],
    source: 'gemini'
  };
}

// Universal handler supporting both Vercel Web API (Request/Response) and Node (req/res)
export default async function handler(req: any, res?: any) {
  // CORS Headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  const sendResponse = (status: number, data: any) => {
    if (res && typeof res.status === 'function') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return res.status(status).json(data);
    }
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  };

  const method = req.method || (req as Request).method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    if (res && typeof res.status === 'function') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return res.status(204).end();
    }
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Only allow POST
  if (method !== 'POST') {
    return sendResponse(405, { success: false, error: 'Method Not Allowed. Use POST.' });
  }

  // Extract body
  let body: PostMortemRequestBody = { projectName: '' };
  try {
    if (req.body) {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } else if (typeof req.json === 'function') {
      body = await req.json();
    }
  } catch {
    return sendResponse(400, { success: false, error: 'Invalid JSON request body.' });
  }

  if (!body || !body.projectName || typeof body.projectName !== 'string' || body.projectName.trim().length === 0) {
    return sendResponse(400, { success: false, error: 'Field "projectName" is required.' });
  }

  // Check for server-side Gemini API key
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (apiKey && apiKey.trim().length > 0) {
    try {
      const geminiResult = await callGeminiApi(apiKey.trim(), body);
      return sendResponse(200, geminiResult);
    } catch (err: any) {
      console.warn("Gemini API call failed, falling back to heuristic gothic post-mortem:", err?.message || err);
      // Graceful fallback if Gemini API fails
      const fallbackResult = generateHeuristicPostMortem(body);
      return sendResponse(200, fallbackResult);
    }
  }

  // If no API key configured, use high-fidelity gothic heuristic generator
  const heuristicResult = generateHeuristicPostMortem(body);
  return sendResponse(200, heuristicResult);
}
