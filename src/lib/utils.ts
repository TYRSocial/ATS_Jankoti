import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ScoreRating, ImpactLevel } from "@/types/ats";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getScoreRating(score: number): ScoreRating {
  if (score >= 80) return "EXCELLENT";
  if (score >= 65) return "GOOD";
  if (score >= 50) return "NEEDS_IMPROVEMENT";
  return "POOR";
}

export function getScoreColor(score: number) {
  if (score >= 80) {
    return {
      text: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      stroke: "#10B981",
      badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
    };
  }
  if (score >= 65) {
    return {
      text: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200",
      stroke: "#8B5CF6",
      badgeBg: "bg-purple-100 text-purple-800 border-purple-200",
    };
  }
  if (score >= 50) {
    return {
      text: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
      stroke: "#F59E0B",
      badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
    };
  }
  return {
    text: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
    stroke: "#EF4444",
    badgeBg: "bg-rose-100 text-rose-800 border-rose-200",
  };
}

export function getImpactBadge(impact: ImpactLevel) {
  switch (impact) {
    case "HIGH":
      return "bg-rose-100 text-rose-700 border border-rose-200";
    case "MEDIUM":
      return "bg-amber-100 text-amber-700 border border-amber-200";
    case "LOW":
      return "bg-sky-100 text-sky-700 border border-sky-200";
  }
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}
