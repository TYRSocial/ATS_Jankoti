import mongoose, { Document, Schema } from 'mongoose';

export type MatchStatus = 'MATCHED' | 'MISSING' | 'PARTIAL';
export type ImpactLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type AuditStatus = 'PASSED' | 'WARNING' | 'FAILED';
export type ScoreRating = 'EXCELLENT' | 'GOOD' | 'NEEDS_IMPROVEMENT' | 'POOR';

const KeywordItemSchema = new Schema({
  word: { type: String, required: true },
  category: { type: String, enum: ['Technical', 'Soft Skill', 'Domain', 'Tool', 'Certification'] },
  status: { type: String, enum: ['MATCHED', 'MISSING', 'PARTIAL'], required: true },
  importance: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'] },
  countInResume: { type: Number, default: 0 },
  countInJD: { type: Number, default: 0 },
}, { _id: false });

const SkillCategorySchema = new Schema({
  category: { type: String, enum: ['Technical', 'Tools', 'Soft Skills', 'Domain Knowledge'] },
  requiredCount: { type: Number, default: 0 },
  matchedCount: { type: Number, default: 0 },
  missingCount: { type: Number, default: 0 },
  matchedSkills: { type: [String], default: [] },
  missingSkills: { type: [String], default: [] },
}, { _id: false });

const SectionAuditSchema = new Schema({
  name: { type: String, required: true },
  score: { type: Number, default: 0 },
  status: { type: String, enum: ['PASSED', 'WARNING', 'FAILED'], default: 'PASSED' },
  issues: { type: [String], default: [] },
  suggestions: { type: [String], default: [] },
}, { _id: false });

const RecommendationSchema = new Schema({
  id: { type: String, required: true },
  problem: { type: String, required: true },
  recommendation: { type: String, required: true },
  impact: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], default: 'MEDIUM' },
  section: { type: String, default: '' },
}, { _id: false });

const BulletSuggestionSchema = new Schema({
  id: { type: String, required: true },
  section: { type: String, required: true },
  original: { type: String, required: true },
  suggested: { type: String, required: true },
  explanation: { type: String, default: '' },
  status: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED'], default: 'PENDING' },
}, { _id: false });

export interface IAnalysis extends Document {
  userId?: string;
  resumeName: string;
  resumeFileSize?: string;
  jobTitle: string;
  targetCompany?: string;
  jobDescriptionText?: string;
  overallScore: number;
  scoreRating: ScoreRating;
  categoryScores: {
    keywordScore: number;
    skillScore: number;
    experienceScore: number;
    educationScore: number;
    formattingScore: number;
    structureScore: number;
  };
  matchedKeywords: string[];
  missingKeywords: string[];
  partialKeywords: string[];
  keywordDetails: Array<{
    word: string;
    category: string;
    status: MatchStatus;
    importance: ImpactLevel;
    countInResume: number;
    countInJD: number;
  }>;
  skillComparison: Array<{
    category: string;
    requiredCount: number;
    matchedCount: number;
    missingCount: number;
    matchedSkills: string[];
    missingSkills: string[];
  }>;
  sectionAudits: Array<{
    name: string;
    score: number;
    status: AuditStatus;
    issues: string[];
    suggestions: string[];
  }>;
  recommendations: Array<{
    id: string;
    problem: string;
    recommendation: string;
    impact: ImpactLevel;
    section: string;
  }>;
  bulletSuggestions: Array<{
    id: string;
    section: string;
    original: string;
    suggested: string;
    explanation: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const AnalysisSchema = new Schema<IAnalysis>(
  {
    userId: { type: String, index: true },
    resumeName: { type: String, required: true },
    resumeFileSize: { type: String },
    jobTitle: { type: String, required: true },
    targetCompany: { type: String },
    jobDescriptionText: { type: String },
    overallScore: { type: Number, required: true, min: 0, max: 100 },
    scoreRating: { type: String, enum: ['EXCELLENT', 'GOOD', 'NEEDS_IMPROVEMENT', 'POOR'], required: true },
    categoryScores: {
      keywordScore: { type: Number, default: 0 },
      skillScore: { type: Number, default: 0 },
      experienceScore: { type: Number, default: 0 },
      educationScore: { type: Number, default: 0 },
      formattingScore: { type: Number, default: 0 },
      structureScore: { type: Number, default: 0 },
    },
    matchedKeywords: { type: [String], default: [] },
    missingKeywords: { type: [String], default: [] },
    partialKeywords: { type: [String], default: [] },
    keywordDetails: { type: [KeywordItemSchema], default: [] },
    skillComparison: { type: [SkillCategorySchema], default: [] },
    sectionAudits: { type: [SectionAuditSchema], default: [] },
    recommendations: { type: [RecommendationSchema], default: [] },
    bulletSuggestions: { type: [BulletSuggestionSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

export const Analysis = mongoose.models.Analysis || mongoose.model<IAnalysis>('Analysis', AnalysisSchema);
