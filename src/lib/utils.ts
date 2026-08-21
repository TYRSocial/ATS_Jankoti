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
      text: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      stroke: "#10B981",
      badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    };
  }
  if (score >= 65) {
    return {
      text: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      stroke: "#F59E0B",
      badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    };
  }
  if (score >= 50) {
    return {
      text: "text-orange-400",
      bg: "bg-orange-500/10",
      border: "border-orange-500/30",
      stroke: "#E67E22",
      badgeBg: "bg-orange-500/20 text-orange-300 border-orange-500/40",
    };
  }
  return {
    text: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    stroke: "#EF4444",
    badgeBg: "bg-rose-500/20 text-rose-300 border-rose-500/40",
  };
}

export function getImpactBadge(impact: ImpactLevel) {
  switch (impact) {
    case "HIGH":
      return "bg-rose-500/15 text-rose-300 border border-rose-500/30";
    case "MEDIUM":
      return "bg-amber-500/15 text-amber-300 border border-amber-500/30";
    case "LOW":
      return "bg-sky-500/15 text-sky-300 border border-sky-500/30";
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
