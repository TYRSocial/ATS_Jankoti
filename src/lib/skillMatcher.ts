/**
 * skillMatcher.ts
 * ---------------
 * Multi-level ATS skill matching engine.
 *
 * Pipeline:
 *   Normalize → Canonicalize → Exact → Alias → Abbreviation → Word-boundary → Score
 *
 * Nothing in this file touches the UI, database, or API contracts.
 */

// ---------------------------------------------------------------------------
// 1. TYPES
// ---------------------------------------------------------------------------

export type MatchType = 'exact' | 'alias' | 'abbreviation' | 'phrase' | 'none';
export type MatchStatus = 'MATCHED' | 'PARTIAL' | 'MISSING';
export type SkillImportance = 'required' | 'preferred';

export interface JDSkill {
  term: string;         // original surface form from JD
  canonical: string;    // canonical key
  importance: SkillImportance;
}

export interface SkillMatchResult {
  term: string;         // original JD surface form
  canonical: string;
  status: MatchStatus;
  matchType: MatchType;
  matchedText: string;  // the text in the resume that triggered the match
  confidence: number;   // 0.0 – 1.0
  importance: SkillImportance;
}

export interface ATSMatchSummary {
  matched: SkillMatchResult[];
  partial: SkillMatchResult[];
  missing: SkillMatchResult[];
  weightedScore: number;        // 0–100
  keywordScore: number;         // 0–100  (raw keyword hit rate)
  skillScore: number;           // 0–100  (weighted by importance)
  debugLog: string[];           // non-empty only when DEBUG_MATCHING=true
}

// ---------------------------------------------------------------------------
// 2. CENTRALIZED SKILL ALIAS DICTIONARY
//
//  Structure:  canonicalKey → string[]  (all known surface forms, lowercase)
//
//  Rules:
//   • Each entry is the SOLE place that defines synonyms for a skill.
//   • Add new skills here; nothing else needs to change.
//   • Entries must NOT create cross-contamination between different skills
//     (e.g. 'js' only maps to javascript, not java).
// ---------------------------------------------------------------------------

export const SKILL_ALIASES: Record<string, string[]> = {
  // ── Languages ─────────────────────────────────────────────────────────────
  python: ['python', 'python programming', 'python language', 'python3', 'python 3'],
  javascript: ['javascript', 'js', 'ecmascript', 'es6', 'es2015', 'vanilla js'],
  typescript: ['typescript', 'ts'],
  java: ['java', 'java programming', 'core java', 'java se', 'java ee', 'j2ee'],
  kotlin: ['kotlin'],
  swift: ['swift', 'swiftui'],
  go: ['go', 'golang', 'go lang'],
  rust: ['rust', 'rust lang'],
  ruby: ['ruby', 'ruby on rails', 'rails'],
  php: ['php', 'php programming'],
  scala: ['scala'],
  perl: ['perl'],
  r_language: ['r', 'r language', 'r programming'],
  c_language: ['c', 'c language', 'c programming'],
  cpp: ['c++', 'cpp', 'c plus plus'],
  csharp: ['c#', 'c sharp', 'csharp', 'dotnet csharp'],
  matlab: ['matlab'],
  shell: ['shell', 'bash', 'shell scripting', 'bash scripting', 'sh'],
  powershell: ['powershell', 'ps1'],

  // ── Web Frameworks / Libraries ────────────────────────────────────────────
  react: ['react', 'reactjs', 'react.js', 'react js'],
  react_native: ['react native', 'reactnative'],
  nextjs: ['next.js', 'nextjs', 'next js'],
  angular: ['angular', 'angularjs', 'angular.js', 'angular js'],
  vuejs: ['vue', 'vuejs', 'vue.js', 'vue js'],
  svelte: ['svelte', 'sveltejs'],
  express: ['express', 'express.js', 'expressjs'],
  fastapi: ['fastapi', 'fast api'],
  flask: ['flask'],
  django: ['django', 'django rest framework', 'drf'],
  spring: ['spring', 'spring boot', 'spring framework', 'spring mvc'],
  laravel: ['laravel'],
  nestjs: ['nestjs', 'nest.js'],

  // ── Data Science / ML ─────────────────────────────────────────────────────
  machine_learning: ['machine learning', 'ml', 'machine-learning', 'ml models'],
  deep_learning: ['deep learning', 'dl', 'deep-learning'],
  artificial_intelligence: ['artificial intelligence', 'ai'],
  nlp: ['natural language processing', 'nlp', 'natural-language-processing'],
  computer_vision: ['computer vision', 'cv', 'image processing'],
  data_science: ['data science', 'data scientist'],
  data_analysis: ['data analysis', 'data analytics', 'data analyst'],
  data_visualization: ['data visualization', 'data viz', 'data visualisation'],
  statistics: ['statistics', 'statistical analysis', 'statistical modeling', 'stats'],
  eda: ['exploratory data analysis', 'eda'],
  feature_engineering: ['feature engineering'],
  time_series: ['time series', 'time-series analysis', 'forecasting'],
  nlg: ['natural language generation', 'nlg'],

  // ── ML Libraries / Frameworks ─────────────────────────────────────────────
  scikit_learn: ['scikit-learn', 'scikit learn', 'sklearn', 'scikit'],
  tensorflow: ['tensorflow', 'tf'],
  pytorch: ['pytorch', 'torch'],
  keras: ['keras'],
  pandas: ['pandas', 'pandas library'],
  numpy: ['numpy', 'numpy library'],
  matplotlib: ['matplotlib', 'matplotlib library'],
  seaborn: ['seaborn'],
  scipy: ['scipy'],
  xgboost: ['xgboost', 'xgb'],
  lightgbm: ['lightgbm', 'lgbm'],
  huggingface: ['hugging face', 'huggingface', 'transformers'],
  langchain: ['langchain', 'lang chain'],
  openai: ['openai', 'open ai', 'gpt', 'chatgpt', 'gpt-4'],

  // ── Databases ─────────────────────────────────────────────────────────────
  sql: ['sql', 'structured query language'],
  mysql: ['mysql', 'my sql'],
  postgresql: ['postgresql', 'postgres', 'pg', 'psql'],
  sqlite: ['sqlite', 'sqlite3'],
  mongodb: ['mongodb', 'mongo', 'mongoose'],
  redis: ['redis', 'redis cache'],
  cassandra: ['cassandra', 'apache cassandra'],
  elasticsearch: ['elasticsearch', 'elastic search', 'opensearch'],
  dynamodb: ['dynamodb', 'amazon dynamodb'],
  oracle: ['oracle', 'oracle db', 'oracle database'],
  sql_server: ['sql server', 'microsoft sql server', 'mssql', 'ms sql'],
  snowflake: ['snowflake'],
  bigquery: ['bigquery', 'google bigquery'],
  neo4j: ['neo4j', 'graph database'],
  influxdb: ['influxdb'],
  supabase: ['supabase'],
  firebase: ['firebase'],

  // ── Cloud Platforms ───────────────────────────────────────────────────────
  aws: ['aws', 'amazon web services', 'amazon cloud'],
  azure: ['azure', 'microsoft azure', 'ms azure'],
  gcp: ['gcp', 'google cloud platform', 'google cloud'],

  // ── Cloud Services (intentionally separate from platform) ────────────────
  aws_lambda: ['aws lambda', 'lambda functions'],
  aws_ec2: ['ec2', 'aws ec2'],
  aws_s3: ['s3', 'aws s3'],
  aws_rds: ['rds', 'aws rds'],
  aws_sagemaker: ['sagemaker', 'aws sagemaker'],

  // ── DevOps / Infrastructure ───────────────────────────────────────────────
  docker: ['docker', 'docker container', 'containerization'],
  kubernetes: ['kubernetes', 'k8s', 'k 8s'],
  terraform: ['terraform', 'hashicorp terraform'],
  ansible: ['ansible'],
  jenkins: ['jenkins', 'jenkins ci'],
  github_actions: ['github actions', 'gh actions'],
  ci_cd: ['ci/cd', 'ci cd', 'continuous integration', 'continuous deployment', 'continuous delivery'],
  linux: ['linux', 'unix', 'ubuntu', 'centos'],
  nginx: ['nginx'],
  apache: ['apache', 'apache http'],

  // ── Version Control ───────────────────────────────────────────────────────
  git: ['git', 'git version control'],
  github: ['github'],
  gitlab: ['gitlab'],
  bitbucket: ['bitbucket'],

  // ── BI / Analytics Tools ──────────────────────────────────────────────────
  power_bi: ['power bi', 'powerbi', 'microsoft power bi', 'ms power bi', 'power-bi'],
  tableau: ['tableau'],
  excel: ['excel', 'microsoft excel', 'ms excel', 'advanced excel'],
  google_sheets: ['google sheets', 'gsheet'],
  looker: ['looker', 'looker studio'],
  qlik: ['qlik', 'qlikview', 'qlik sense'],
  metabase: ['metabase'],

  // ── APIs / Architecture ───────────────────────────────────────────────────
  rest_api: ['rest api', 'restful api', 'rest apis', 'restful', 'rest', 'rest services'],
  graphql: ['graphql', 'graph ql'],
  grpc: ['grpc', 'grpc api'],
  microservices: ['microservices', 'micro services', 'microservice architecture'],
  soap: ['soap', 'soap api', 'soap web service'],

  // ── Mobile ────────────────────────────────────────────────────────────────
  android: ['android', 'android development'],
  ios: ['ios', 'ios development', 'iphone development'],
  flutter: ['flutter'],
  xamarin: ['xamarin'],

  // ── .NET / Microsoft Stack ────────────────────────────────────────────────
  dotnet: ['.net', 'dot net', 'dotnet', '.net framework', '.net core', 'asp.net', 'aspnet'],

  // ── Testing ───────────────────────────────────────────────────────────────
  unit_testing: ['unit testing', 'unit tests'],
  jest: ['jest'],
  pytest: ['pytest'],
  selenium: ['selenium', 'selenium webdriver'],
  cypress: ['cypress'],

  // ── Project / Methodology ─────────────────────────────────────────────────
  agile: ['agile', 'agile methodology', 'agile development'],
  scrum: ['scrum', 'scrum methodology'],
  jira: ['jira', 'atlassian jira'],
  kanban: ['kanban'],
  oop: ['oop', 'object-oriented programming', 'object oriented programming', 'oops'],
  seo: ['seo', 'search engine optimization'],

  // ── Office / Productivity ─────────────────────────────────────────────────
  powerpoint: ['powerpoint', 'microsoft powerpoint', 'ms powerpoint', 'ppt'],
  word: ['word', 'microsoft word', 'ms word'],
};

// ---------------------------------------------------------------------------
// 3. FALSE-POSITIVE GUARD: explicit "do NOT merge" pairs
//    If skill A is found but we're looking for skill B, it is NOT a match.
// ---------------------------------------------------------------------------

const DO_NOT_MERGE: Array<[string, string]> = [
  ['javascript', 'java'],
  ['react', 'react_native'],
  ['c_language', 'cpp'],
  ['c_language', 'csharp'],
  ['cpp', 'csharp'],
  ['sql', 'mysql'],
  ['sql', 'postgresql'],
  ['sql', 'sql_server'],
  ['sql', 'sqlite'],
  ['python', 'r_language'],
  ['aws', 'azure'],
  ['aws', 'gcp'],
  ['azure', 'gcp'],
  ['power_bi', 'powerpoint'],
  ['go', 'golang'],   // go == golang (same canonical, but document for clarity)
  ['typescript', 'javascript'],
  ['angular', 'react'],
  ['vuejs', 'react'],
  ['angular', 'vuejs'],
];

function isDoNotMergePair(canonA: string, canonB: string): boolean {
  for (const [x, y] of DO_NOT_MERGE) {
    if ((x === canonA && y === canonB) || (x === canonB && y === canonA)) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// 4. NOISE WORDS — excluded from JD skill tokenization
// ---------------------------------------------------------------------------

const NOISE_WORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with',
  'is','are','be','been','was','were','will','would','can','could','should',
  'have','has','had','do','does','did','not','no','so','if','as','by',
  'this','that','these','those','it','its','we','you','our','their','your',
  'experience','years','year','strong','good','solid','proven','excellent',
  'ability','skills','skill','knowledge','understanding','working','using',
  'including','following','such','well','able','proficient','familiarity',
  'familiar','required','preferred','plus','bonus','nice','must','need',
  'look','looking','seeking','join','team','work','works','build','develop',
  'design','implement','manage','create','maintain','support','ensure',
  'deliver','provide','collaborate','communicate','help','drive','lead',
  'responsible','role','position','candidate','applicant','company','org',
  'minimum','least','ideally','ideally','ideally','more','other','also',
  'various','related','relevant','both','across','within','while','who',
  'what','where','when','how','why','get','set','run','use','make','take',
  'new','high','key','core','main','major','primary','secondary','junior',
  'senior','mid','entry','level','based','focused','oriented','driven',
  'demonstrated','hands','on','off','up','down','out','over','under','well',
]);

// ---------------------------------------------------------------------------
// 5. TEXT NORMALIZATION
// ---------------------------------------------------------------------------

/**
 * Normalize a string for comparison:
 *  - lowercase
 *  - collapse multiple spaces/tabs
 *  - normalize hyphens and dots between words (react.js → react js)
 *  - strip leading/trailing punctuation per token
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[•·▪▸►●★\-–—]/g, ' ')   // bullets & dashes → space
    .replace(/\./g, ' ')                 // dots → space (handles node.js → node js)
    .replace(/[^\w\s+#]/g, ' ')          // strip non-word chars except + and #
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalize a single skill term (preserves + and # for C++, C#)
 */
export function normalizeTerm(term: string): string {
  return term
    .toLowerCase()
    .replace(/[•·▪▸►●★\-–—]/g, ' ')
    .replace(/[^\w\s+#.]/g, ' ')
    .replace(/\./g, '')  // node.js → nodejs for canonical lookup
    .replace(/\s+/g, ' ')
    .trim();
}

// ---------------------------------------------------------------------------
// 6. BUILD REVERSE LOOKUP: surface form → canonical key
// ---------------------------------------------------------------------------

const SURFACE_TO_CANONICAL: Map<string, string> = new Map();

for (const [canonical, aliases] of Object.entries(SKILL_ALIASES)) {
  for (const alias of aliases) {
    const normalized = normalizeTerm(alias);
    SURFACE_TO_CANONICAL.set(normalized, canonical);
  }
}

export function canonicalize(term: string): string {
  const normalized = normalizeTerm(term);
  return SURFACE_TO_CANONICAL.get(normalized) ?? normalized;
}

// ---------------------------------------------------------------------------
// 7. JD SKILL EXTRACTION
// ---------------------------------------------------------------------------

const REQUIRED_SIGNALS = [
  'required', 'must have', 'must-have', 'mandatory', 'essential',
  'need', 'needs to', 'proficient', 'strong', 'expertise in', 'expert in',
  'minimum', 'at least',
];
const PREFERRED_SIGNALS = [
  'preferred', 'nice to have', 'nice-to-have', 'bonus', 'plus', 'ideally',
  'advantageous', 'desired', 'desirable', 'beneficial',
];

function detectImportance(context: string): SkillImportance {
  const lc = context.toLowerCase();
  if (PREFERRED_SIGNALS.some(s => lc.includes(s))) return 'preferred';
  if (REQUIRED_SIGNALS.some(s => lc.includes(s))) return 'required';
  return 'required'; // default: treat as required
}

/**
 * Extract candidate skill phrases from JD text.
 * Strategy: n-gram (1–4 words) + canonical lookup → deduplicate.
 */
export function extractSkillsFromJD(jdText: string): JDSkill[] {
  const lines = jdText.split(/[\n\r]+/);
  const results: Map<string, JDSkill> = new Map();

  for (const line of lines) {
    const importance = detectImportance(line);
    const normalized = normalizeText(line);
    const tokens = normalized.split(' ').filter(t => t.length > 0);

    // Slide a window of 1–4 tokens
    for (let start = 0; start < tokens.length; start++) {
      for (let len = 1; len <= 4 && start + len <= tokens.length; len++) {
        const phrase = tokens.slice(start, start + len).join(' ');

        // Skip pure noise words
        if (len === 1 && NOISE_WORDS.has(phrase)) continue;
        // Skip very short tokens that aren't known abbreviations
        if (len === 1 && phrase.length <= 1) continue;
        // Skip tokens that are pure numbers
        if (/^\d+$/.test(phrase)) continue;

        const canon = SURFACE_TO_CANONICAL.get(phrase);
        if (canon && !results.has(canon)) {
          results.set(canon, {
            term: phrase,
            canonical: canon,
            importance,
          });
        }
      }
    }
  }

  return Array.from(results.values());
}

// ---------------------------------------------------------------------------
// 8. RESUME SKILL MATCHING
// ---------------------------------------------------------------------------

/**
 * Build a Set of all canonicals present in the resume text.
 * Multi-pass: tokenize into 1–4 word n-grams, canonicalize each.
 */
function buildResumeCanonicalSet(resumeText: string): Set<string> {
  const normalized = normalizeText(resumeText);
  const tokens = normalized.split(' ');
  const found = new Set<string>();

  for (let start = 0; start < tokens.length; start++) {
    for (let len = 1; len <= 4 && start + len <= tokens.length; len++) {
      const phrase = tokens.slice(start, start + len).join(' ');
      const canon = SURFACE_TO_CANONICAL.get(phrase);
      if (canon) found.add(canon);
    }
  }

  return found;
}

/**
 * For a given JD skill, find the actual matched text in the resume.
 * Returns the first alias that appears in the normalized resume text.
 */
function findMatchedText(
  jdCanonical: string,
  normalizedResume: string
): { text: string; type: MatchType } | null {
  const aliases = SKILL_ALIASES[jdCanonical];
  if (!aliases) return null;

  for (const alias of aliases) {
    const normAlias = normalizeTerm(alias);
    if (normAlias.length === 0) continue;

    // Word-boundary check: ensure the alias is a whole-word match
    // Build a pattern that requires space/start/end around the alias
    const escaped = normAlias.replace(/[+#]/g, '\\$&');
    const pattern = new RegExp(`(?:^|\\s)${escaped}(?:$|\\s|,|;|\\.)`);

    if (pattern.test(normalizedResume)) {
      // Determine match type
      const type: MatchType =
        normAlias === normalizeTerm(jdCanonical) ? 'exact' : 'alias';
      return { text: alias, type };
    }
  }

  return null;
}

/**
 * Main matching function.
 *
 * @param resumeText  - Plain text content of the resume (or empty string for fallback)
 * @param jdSkills    - Extracted JD skills from extractSkillsFromJD()
 * @param debug       - Enable debug logging
 */
export function matchSkillsFromResumeText(
  resumeText: string,
  jdSkills: JDSkill[],
  debug = false
): SkillMatchResult[] {
  const debugLog: string[] = [];
  const normalizedResume = normalizeText(resumeText);
  const resumeCanonicals = buildResumeCanonicalSet(resumeText);

  const results: SkillMatchResult[] = [];

  for (const jdSkill of jdSkills) {
    const { term, canonical, importance } = jdSkill;

    // --- Level 1 & 2: Canonical set lookup (covers exact + all aliases) -----
    if (resumeCanonicals.has(canonical)) {
      // Guard: check do-not-merge list
      // (No cross-contamination possible here since we resolved to canonical,
      //  but guard against cases where two canonicals map to the same surface form)

      const matchInfo = findMatchedText(canonical, normalizedResume);
      const matched: SkillMatchResult = {
        term,
        canonical,
        status: 'MATCHED',
        matchType: matchInfo?.type ?? 'alias',
        matchedText: matchInfo?.text ?? term,
        confidence: 1.0,
        importance,
      };
      results.push(matched);
      if (debug) debugLog.push(`✅ MATCHED  "${term}" (canon: ${canonical}) via ${matched.matchType} → "${matched.matchedText}"`);
      continue;
    }

    // --- Level 3: Check if resume contains a synonym of a DIFFERENT canonical
    //     that is NOT the same as jdSkill.canonical (false-positive guard) -----
    let partialMatch: SkillMatchResult | null = null;

    // Check all surface forms of jdSkill.canonical in the normalized resume
    // using word-boundary regex (stricter than simple includes)
    const aliases = SKILL_ALIASES[canonical] ?? [term];
    for (const alias of aliases) {
      const normAlias = normalizeTerm(alias);
      if (!normAlias) continue;
      const escaped = normAlias.replace(/[+#]/g, '\\$&');
      const pattern = new RegExp(`(?:^|\\s)${escaped}(?:$|\\s|,|;|\\.)`);
      if (pattern.test(normalizedResume)) {
        partialMatch = {
          term,
          canonical,
          status: 'PARTIAL',
          matchType: 'phrase',
          matchedText: alias,
          confidence: 0.8,
          importance,
        };
        break;
      }
    }

    if (partialMatch) {
      results.push(partialMatch);
      if (debug) debugLog.push(`🟡 PARTIAL  "${term}" (canon: ${canonical}) via phrase → "${partialMatch.matchedText}"`);
      continue;
    }

    // --- Level 4: MISSING ---------------------------------------------------
    results.push({
      term,
      canonical,
      status: 'MISSING',
      matchType: 'none',
      matchedText: '',
      confidence: 0.0,
      importance,
    });
    if (debug) debugLog.push(`❌ MISSING  "${term}" (canon: ${canonical})`);
  }

  return results;
}

// ---------------------------------------------------------------------------
// 9. ATS SCORE CALCULATION
// ---------------------------------------------------------------------------

const STRONG_REQUIRED_WEIGHT  = 1.00;
const PARTIAL_REQUIRED_WEIGHT = 0.60;
const STRONG_PREFERRED_WEIGHT = 0.50;
const PARTIAL_PREFERRED_WEIGHT= 0.25;
const MISSING_WEIGHT          = 0.00;

export function computeWeightedScore(matches: SkillMatchResult[]): number {
  if (matches.length === 0) return 70;

  let earned = 0;
  let possible = 0;

  for (const m of matches) {
    const isRequired = m.importance === 'required';
    const maxWeight = isRequired ? STRONG_REQUIRED_WEIGHT : STRONG_PREFERRED_WEIGHT;
    possible += maxWeight;

    if (m.status === 'MATCHED') {
      earned += isRequired ? STRONG_REQUIRED_WEIGHT : STRONG_PREFERRED_WEIGHT;
    } else if (m.status === 'PARTIAL') {
      earned += isRequired ? PARTIAL_REQUIRED_WEIGHT : PARTIAL_PREFERRED_WEIGHT;
    } else {
      earned += MISSING_WEIGHT;
    }
  }

  const raw = possible > 0 ? (earned / possible) * 100 : 70;
  // Clamp and round
  return Math.min(100, Math.max(30, Math.round(raw)));
}

// ---------------------------------------------------------------------------
// 10. HIGH-LEVEL ENTRY POINT
// ---------------------------------------------------------------------------

/**
 * Full ATS match pipeline.
 *
 * @param resumeText     Plain text of the resume. Pass empty string if unavailable.
 * @param jobDescription Raw job description text.
 * @param debug          If true, fills debugLog with per-skill trace.
 */
export function runFullATSMatch(
  resumeText: string,
  jobDescription: string,
  debug = false
): ATSMatchSummary {
  const jdSkills = extractSkillsFromJD(jobDescription);
  const matchResults = matchSkillsFromResumeText(resumeText, jdSkills, debug);

  const matched  = matchResults.filter(m => m.status === 'MATCHED');
  const partial  = matchResults.filter(m => m.status === 'PARTIAL');
  const missing  = matchResults.filter(m => m.status === 'MISSING');

  const weightedScore = computeWeightedScore(matchResults);

  // Raw keyword hit rate (matched + partial counted partially)
  const total = matchResults.length;
  const keywordScore = total > 0
    ? Math.round(((matched.length + partial.length * 0.5) / total) * 100)
    : 70;

  // Skill score weights required skills more
  const requiredMatched = matchResults.filter(m => m.importance === 'required' && m.status === 'MATCHED').length;
  const requiredTotal   = matchResults.filter(m => m.importance === 'required').length;
  const skillScore = requiredTotal > 0
    ? Math.round((requiredMatched / requiredTotal) * 100)
    : keywordScore;

  const debugLog: string[] = [];
  if (debug) {
    debugLog.push(`JD Skills extracted: ${jdSkills.length}`);
    debugLog.push(`Matched: ${matched.length}, Partial: ${partial.length}, Missing: ${missing.length}`);
    debugLog.push(`Weighted Score: ${weightedScore}`);
    for (const r of matchResults) {
      const icon = r.status === 'MATCHED' ? '✅' : r.status === 'PARTIAL' ? '🟡' : '❌';
      debugLog.push(`${icon} [${r.importance}] "${r.term}" → ${r.status} (${r.matchType}) confidence=${r.confidence}`);
    }
  }

  return { matched, partial, missing, weightedScore, keywordScore, skillScore, debugLog };
}

// ---------------------------------------------------------------------------
// 11. RESUME TEXT EXTRACTION HINT (filename-based fallback)
//     Used when actual resume text is not available.
//     Extracts role context from filename to avoid completely random results.
// ---------------------------------------------------------------------------

export function buildContextFromFilename(filename: string): string {
  // Normalize filename → treat as weak evidence
  return filename
    .replace(/[_\-\.]/g, ' ')
    .replace(/\.(pdf|docx?|txt)$/i, '')
    .toLowerCase();
}
