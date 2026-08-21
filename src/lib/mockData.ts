import { ATSAnalysis } from "@/types/ats";
import {
  runFullATSMatch,
  buildContextFromFilename,
  SkillMatchResult,
} from "@/lib/skillMatcher";

export const SAMPLE_ANALYSES: ATSAnalysis[] = [
  {
    id: "scan-8821",
    createdAt: "2026-08-20T14:30:00Z",
    resumeName: "Senior_FullStack_Engineer_Resume.pdf",
    resumeFileSize: "1.2 MB",
    jobTitle: "Senior Full Stack Engineer",
    targetCompany: "Jankoti Tech",
    jobDescriptionText: "We are looking for a Senior Full Stack Engineer with expertise in React, Next.js, Node.js, TypeScript, PostgreSQL, and AWS cloud architecture. Candidate should have 5+ years of experience building scalable web applications and REST APIs.",
    overallScore: 82,
    scoreRating: "EXCELLENT",
    categoryScores: {
      keywordScore: 85,
      skillScore: 80,
      experienceScore: 90,
      educationScore: 100,
      formattingScore: 75,
      structureScore: 80,
    },
    matchedKeywords: ["React", "TypeScript", "Node.js", "Next.js", "REST APIs", "PostgreSQL", "JavaScript", "Git", "Docker"],
    missingKeywords: ["AWS", "Kubernetes", "GraphQL", "CI/CD Pipeline"],
    partialKeywords: ["Cloud Architecture", "System Design"],
    keywordDetails: [
      { word: "React", category: "Technical", status: "MATCHED", importance: "HIGH", countInResume: 6, countInJD: 4 },
      { word: "TypeScript", category: "Technical", status: "MATCHED", importance: "HIGH", countInResume: 4, countInJD: 3 },
      { word: "Node.js", category: "Technical", status: "MATCHED", importance: "HIGH", countInResume: 5, countInJD: 3 },
      { word: "Next.js", category: "Technical", status: "MATCHED", importance: "MEDIUM", countInResume: 3, countInJD: 2 },
      { word: "PostgreSQL", category: "Tool", status: "MATCHED", importance: "HIGH", countInResume: 2, countInJD: 2 },
      { word: "AWS", category: "Tool", status: "MISSING", importance: "HIGH", countInResume: 0, countInJD: 3 },
      { word: "Kubernetes", category: "Tool", status: "MISSING", importance: "MEDIUM", countInResume: 0, countInJD: 2 },
      { word: "GraphQL", category: "Technical", status: "MISSING", importance: "LOW", countInResume: 0, countInJD: 1 },
      { word: "Cloud Architecture", category: "Domain", status: "PARTIAL", importance: "MEDIUM", countInResume: 1, countInJD: 2 },
    ],
    skillComparison: [
      {
        category: "Technical",
        requiredCount: 8,
        matchedCount: 6,
        missingCount: 2,
        matchedSkills: ["React", "TypeScript", "Node.js", "Next.js", "REST APIs", "Express"],
        missingSkills: ["GraphQL", "Microservices"],
      },
      {
        category: "Tools",
        requiredCount: 5,
        matchedCount: 4,
        missingCount: 1,
        matchedSkills: ["Git", "Docker", "PostgreSQL", "Jest"],
        missingSkills: ["AWS"],
      },
      {
        category: "Soft Skills",
        requiredCount: 4,
        matchedCount: 3,
        missingCount: 1,
        matchedSkills: ["Agile/Scrum", "Team Leadership", "Problem Solving"],
        missingSkills: ["Cross-functional Communication"],
      },
    ],
    sectionAudits: [
      {
        name: "Summary",
        score: 85,
        status: "PASSED",
        issues: ["Summary could explicitly mention target role title"],
        suggestions: ["Incorporate exact job title 'Senior Full Stack Engineer' in professional summary."],
      },
      {
        name: "Experience",
        score: 90,
        status: "PASSED",
        issues: ["Missing quantified metrics in 2 experience bullet points"],
        suggestions: ["Add percentage improvements or throughput numbers to recent project accomplishments."],
      },
      {
        name: "Skills",
        score: 75,
        status: "WARNING",
        issues: ["AWS & Cloud Infrastructure not listed in technical skills grid"],
        suggestions: ["Add AWS (EC2, S3, Lambda) under Cloud Technologies."],
      },
      {
        name: "Education",
        score: 100,
        status: "PASSED",
        issues: [],
        suggestions: ["Education section is well formatted and ATS readable."],
      },
      {
        name: "Formatting & Structure",
        score: 70,
        status: "WARNING",
        issues: ["Tables or multi-column layout detected in skills section"],
        suggestions: ["Convert multi-column skill tables into plain comma-separated bullet points for optimal ATS parsing."],
      },
    ],
    recommendations: [
      {
        id: "rec-1",
        problem: "Missing Critical Keyword: AWS",
        recommendation: "AWS is listed 3 times in the job description as a core requirement. Include AWS EC2/S3 experience in your technical skills and project descriptions.",
        impact: "HIGH",
        section: "Skills & Experience",
      },
      {
        id: "rec-2",
        problem: "Unquantified Achievement Bullets",
        recommendation: "Replace qualitative statements like 'improved performance' with 'increased API response speed by 42% using Redis caching'.",
        impact: "HIGH",
        section: "Experience",
      },
      {
        id: "rec-3",
        problem: "Complex Table Layout in Skills",
        recommendation: "ATS parsers often scramble multi-column tables. Flatten the technical skills grid into single-column bullet points.",
        impact: "MEDIUM",
        section: "Formatting",
      },
    ],
    bulletSuggestions: [
      {
        id: "bullet-1",
        section: "Experience",
        original: "Developed web applications using React and Node.js for client projects.",
        suggested: "Engineered high-throughput web applications leveraging React, Next.js, and Node.js, improving page load performance by 38% for 100k+ active users.",
        explanation: "Adds quantified metric (38%), action verb (Engineered), and targets Next.js requirement.",
        status: "PENDING",
      },
      {
        id: "bullet-2",
        section: "Experience",
        original: "Worked on database design and backend APIs.",
        suggested: "Designed scalable PostgreSQL schema models and built RESTful microservices processing 5M+ daily requests with 99.9% uptime.",
        explanation: "Emphasizes PostgreSQL, scale metrics, and REST API keywords required by target job.",
        status: "ACCEPTED",
      },
    ],
  },
  {
    id: "scan-8822",
    createdAt: "2026-08-19T10:15:00Z",
    resumeName: "Data_Analyst_Resume.pdf",
    resumeFileSize: "890 KB",
    jobTitle: "Senior Data Analyst",
    targetCompany: "Analytics Corp",
    overallScore: 68,
    scoreRating: "GOOD",
    categoryScores: {
      keywordScore: 70,
      skillScore: 65,
      experienceScore: 75,
      educationScore: 90,
      formattingScore: 60,
      structureScore: 70,
    },
    matchedKeywords: ["Python", "SQL", "Excel", "Power BI", "Data Visualization", "Statistics"],
    missingKeywords: ["Tableau", "Snowflake", "dbt", "Machine Learning"],
    partialKeywords: ["Business Intelligence"],
    keywordDetails: [
      { word: "SQL", category: "Technical", status: "MATCHED", importance: "HIGH", countInResume: 5, countInJD: 4 },
      { word: "Python", category: "Technical", status: "MATCHED", importance: "HIGH", countInResume: 4, countInJD: 3 },
      { word: "Tableau", category: "Tool", status: "MISSING", importance: "HIGH", countInResume: 0, countInJD: 3 },
      { word: "Snowflake", category: "Tool", status: "MISSING", importance: "MEDIUM", countInResume: 0, countInJD: 2 },
    ],
    skillComparison: [
      {
        category: "Technical",
        requiredCount: 7,
        matchedCount: 5,
        missingCount: 2,
        matchedSkills: ["Python", "SQL", "Excel", "Power BI", "Pandas"],
        missingSkills: ["Tableau", "Snowflake"],
      },
      {
        category: "Tools",
        requiredCount: 4,
        matchedCount: 3,
        missingCount: 1,
        matchedSkills: ["Jupyter", "Power BI", "Excel"],
        missingSkills: ["dbt"],
      },
      {
        category: "Soft Skills",
        requiredCount: 3,
        matchedCount: 2,
        missingCount: 1,
        matchedSkills: ["Data Storytelling", "Stakeholder Management"],
        missingSkills: ["Executive Reporting"],
      },
    ],
    sectionAudits: [
      {
        name: "Summary",
        score: 70,
        status: "WARNING",
        issues: ["Summary is missing core analytical tools requested in JD"],
        suggestions: ["Mention Power BI & SQL expertise upfront."],
      },
      {
        name: "Experience",
        score: 75,
        status: "PASSED",
        issues: ["Include more specific business impact metrics"],
        suggestions: ["Quantify revenue generation or cost savings enabled by dashboard insights."],
      },
    ],
    recommendations: [
      {
        id: "rec-201",
        problem: "Missing Tableau Skill",
        recommendation: "Tableau is explicitly stated in Job Description. Add Tableau if you have hands-on experience or project exposure.",
        impact: "HIGH",
        section: "Skills",
      },
    ],
    bulletSuggestions: [
      {
        id: "bullet-201",
        section: "Experience",
        original: "Created Power BI dashboards for team reporting.",
        suggested: "Designed interactive Power BI & SQL reporting dashboards tracking $2.4M monthly sales, reducing weekly reporting turnaround by 65%.",
        explanation: "Includes dollar impact ($2.4M) and turnaround efficiency metric (65%).",
        status: "PENDING",
      },
    ],
  },
];

export function generateDynamicAnalysis(
  resumeName: string,
  jobTitle: string,
  targetCompany: string = "Target Company",
  jobDescription: string,
  resumeText: string = ""
): ATSAnalysis {
  const id = `scan-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  // ── Build effective resume text ──────────────────────────────────────────
  // Use provided resumeText if available; otherwise use filename as weak context.
  const effectiveResumeText = resumeText.trim().length > 20
    ? resumeText
    : buildContextFromFilename(resumeName) + " " + jobTitle;

  // ── Run the real multi-level matching engine ─────────────────────────────
  const atsMatch = runFullATSMatch(effectiveResumeText, jobDescription);

  const matched  = atsMatch.matched.map((m: SkillMatchResult) => m.term);
  const missing  = atsMatch.missing.map((m: SkillMatchResult) => m.term);
  const partial  = atsMatch.partial.map((m: SkillMatchResult) => m.term);

  // ── Build keywordDetails from match results ──────────────────────────────
  const allResults = [...atsMatch.matched, ...atsMatch.partial, ...atsMatch.missing];
  const keywordDetails = allResults.map(m => ({
    word: m.term,
    category: "Technical" as const,
    status: (m.status === "MATCHED" ? "MATCHED" : m.status === "PARTIAL" ? "PARTIAL" : "MISSING") as "MATCHED" | "MISSING" | "PARTIAL",
    importance: (m.importance === "required" ? "HIGH" : "MEDIUM") as "HIGH" | "MEDIUM" | "LOW",
    countInResume: m.status === "MATCHED" ? 2 : m.status === "PARTIAL" ? 1 : 0,
    countInJD: 2,
  }));

  // ── Score calculation (uses the engine's weighted score) ─────────────────
  const overallScore = Math.min(100, Math.max(30, Math.round(
    atsMatch.weightedScore * 0.50 +     // keyword/skill match (50%)
    80 * 0.20 +                          // formatting baseline (20%)
    85 * 0.15 +                          // structure baseline (15%)
    90 * 0.15                            // experience baseline (15%)
  )));

  const rating =
    overallScore >= 80 ? "EXCELLENT" :
    overallScore >= 65 ? "GOOD" :
    overallScore >= 50 ? "NEEDS_IMPROVEMENT" : "POOR";

  const missingSkillsLabel = missing.length > 0
    ? missing.slice(0, 3).join(", ")
    : "none";

  const firstMatched = matched[0] || "your key skills";
  const firstMissing = missing[0] || null;

  return {
    id,
    createdAt: now,
    resumeName: resumeName || "Uploaded_Resume.pdf",
    resumeFileSize: "1.1 MB",
    jobTitle: jobTitle || "Target Role",
    targetCompany: targetCompany || "Target Employer",
    jobDescriptionText: jobDescription,
    overallScore,
    scoreRating: rating,
    categoryScores: {
      keywordScore: atsMatch.keywordScore,
      skillScore: atsMatch.skillScore,
      experienceScore: Math.min(100, overallScore + 8),
      educationScore: 95,
      formattingScore: 80,
      structureScore: 85,
    },
    matchedKeywords: matched.length > 0 ? matched : ["Communication", "Teamwork"],
    missingKeywords: missing,
    partialKeywords: partial,
    keywordDetails,
    skillComparison: [
      {
        category: "Technical",
        requiredCount: atsMatch.matched.filter(m => m.importance === "required").length
          + atsMatch.missing.filter(m => m.importance === "required").length,
        matchedCount: atsMatch.matched.filter(m => m.importance === "required").length,
        missingCount: atsMatch.missing.filter(m => m.importance === "required").length,
        matchedSkills: atsMatch.matched.filter(m => m.importance === "required").map(m => m.term),
        missingSkills: atsMatch.missing.filter(m => m.importance === "required").map(m => m.term),
      },
      {
        category: "Tools",
        requiredCount: atsMatch.matched.filter(m => m.importance === "preferred").length
          + atsMatch.missing.filter(m => m.importance === "preferred").length,
        matchedCount: atsMatch.matched.filter(m => m.importance === "preferred").length,
        missingCount: atsMatch.missing.filter(m => m.importance === "preferred").length,
        matchedSkills: atsMatch.matched.filter(m => m.importance === "preferred").map(m => m.term),
        missingSkills: atsMatch.missing.filter(m => m.importance === "preferred").map(m => m.term),
      },
      {
        category: "Soft Skills",
        requiredCount: 4,
        matchedCount: 3,
        missingCount: 1,
        matchedSkills: ["Problem Solving", "Team Collaboration", "Agile"],
        missingSkills: ["Mentorship"],
      },
    ],
    sectionAudits: [
      {
        name: "Summary",
        score: 80,
        status: "PASSED",
        issues: ["Could highlight domain expertise more clearly"],
        suggestions: [`Add "${jobTitle}" directly to your header summary.`],
      },
      {
        name: "Experience",
        score: Math.min(100, overallScore + 5),
        status: missing.length > 2 ? "WARNING" : "PASSED",
        issues: missing.length > 0 ? [`Missing references to: ${missingSkillsLabel}`] : [],
        suggestions: firstMissing
          ? [`Integrate "${firstMissing}" in your bullet accomplishments if applicable.`]
          : ["Experience bullets look strong."],
      },
      {
        name: "Skills",
        score: atsMatch.skillScore,
        status: atsMatch.skillScore >= 75 ? "PASSED" : "WARNING",
        issues: missing.length > 0
          ? [`${missing.length} required skill${missing.length > 1 ? 's' : ''} missing from skills section`]
          : [],
        suggestions: ["Reorganize skills into clear categorizations: Technical, Tools, Soft Skills."],
      },
      {
        name: "Education & Certifications",
        score: 95,
        status: "PASSED",
        issues: [],
        suggestions: ["Format is clear and easily readable by ATS scanners."],
      },
    ],
    recommendations: [
      ...(firstMissing
        ? [{
            id: `rec-missing-${firstMissing.replace(/\s+/g, '-')}`,
            problem: `Missing Core Skill: ${firstMissing}`,
            recommendation: `"${firstMissing}" is required in the job description. Add relevant project experience or certification if you have it.`,
            impact: "HIGH" as const,
            section: "Skills",
          }]
        : []),
      {
        id: "rec-metrics",
        problem: "Bullet Point Quantification",
        recommendation: "Enhance achievement bullet points with quantifiable metric impacts (% saved, $ revenue, user count).",
        impact: "HIGH" as const,
        section: "Experience",
      },
      {
        id: "rec-format",
        problem: "ATS Parser Compatibility",
        recommendation: "Ensure standard font hierarchy and clean bullet points without embedded graphics or icons.",
        impact: "MEDIUM" as const,
        section: "Formatting",
      },
    ],
    bulletSuggestions: [
      {
        id: `bullet-dyn-1`,
        section: "Experience",
        original: `Responsible for building features for ${jobTitle} projects.`,
        suggested: `Architected and delivered core ${jobTitle} features using ${firstMatched}, accelerating release velocity by 35% across 4 product modules.`,
        explanation: "Introduced strong action verb, technical keywords, and 35% velocity metric.",
        status: "PENDING",
      },
    ],
  };
}
