export type ScoreRating = 'EXCELLENT' | 'GOOD' | 'NEEDS_IMPROVEMENT' | 'POOR';
export type MatchStatus = 'MATCHED' | 'MISSING' | 'PARTIAL';
export type ImpactLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type AuditStatus = 'PASSED' | 'WARNING' | 'FAILED';

export interface CategoryScores {
  keywordScore: number;
  skillScore: number;
  experienceScore: number;
  educationScore: number;
  formattingScore: number;
  structureScore: number;
}

export interface KeywordItem {
  word: string;
  category: 'Technical' | 'Soft Skill' | 'Domain' | 'Tool' | 'Certification';
  status: MatchStatus;
  importance: ImpactLevel;
  countInResume: number;
  countInJD: number;
}

export interface SkillCategoryComparison {
  category: 'Technical' | 'Tools' | 'Soft Skills' | 'Domain Knowledge';
  requiredCount: number;
  matchedCount: number;
  missingCount: number;
  matchedSkills: string[];
  missingSkills: string[];
}

export interface SectionAudit {
  name: string;
  score: number;
  status: AuditStatus;
  issues: string[];
  suggestions: string[];
}

export interface Recommendation {
  id: string;
  problem: string;
  recommendation: string;
  impact: ImpactLevel;
  section: string;
}

export interface BulletSuggestion {
  id: string;
  section: string;
  original: string;
  suggested: string;
  explanation: string;
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export interface ATSAnalysis {
  id: string;
  createdAt: string;
  resumeName: string;
  resumeFileSize?: string;
  jobTitle: string;
  targetCompany?: string;
  jobDescriptionText?: string;
  overallScore: number;
  scoreRating: ScoreRating;
  categoryScores: CategoryScores;
  matchedKeywords: string[];
  missingKeywords: string[];
  partialKeywords: string[];
  keywordDetails: KeywordItem[];
  skillComparison: SkillCategoryComparison[];
  sectionAudits: SectionAudit[];
  recommendations: Recommendation[];
  bulletSuggestions: BulletSuggestion[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  targetRoles: string[];
  totalScans: number;
  avgScore: number;
}
