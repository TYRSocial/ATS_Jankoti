"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Sparkles, FileSearch, History, LayoutDashboard, ArrowRight, User } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-purple-100/80 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Jankoti Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-11 w-40 flex items-center overflow-hidden">
            <Image
              src="/jankotilogo.png"
              alt="Jankoti Logo"
              width={160}
              height={44}
              priority
              className="object-contain object-left group-hover:scale-[1.02] transition-transform duration-200"
            />
          </div>
          <span className="hidden sm:inline-flex text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
            ATS Score Module
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-7">
          <Link
            href="/"
            className={`text-sm font-semibold transition-colors ${
              pathname === "/" ? "text-[#6d28d9]" : "text-slate-600 hover:text-[#6d28d9]"
            }`}
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
              pathname.startsWith("/dashboard") ? "text-[#6d28d9]" : "text-slate-600 hover:text-[#6d28d9]"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            href="/upload"
            className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
              pathname.startsWith("/upload") ? "text-[#6d28d9]" : "text-slate-600 hover:text-[#6d28d9]"
            }`}
          >
            <FileSearch className="w-4 h-4" />
            Analyze Resume
          </Link>
          <Link
            href="/history"
            className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
              pathname.startsWith("/history") ? "text-[#6d28d9]" : "text-slate-600 hover:text-[#6d28d9]"
            }`}
          >
            <History className="w-4 h-4" />
            History
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-700 hover:text-[#6d28d9] px-3.5 py-2 transition-colors flex items-center gap-1.5 hidden sm:flex"
          >
            <User className="w-4 h-4 text-purple-600" />
            <span>Sign In</span>
          </Link>
          <Link
            href="/upload"
            id="nav-scan-btn"
            className="text-sm font-semibold text-white btn-primary-gradient px-4 py-2 rounded-full shadow-md flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Scan Resume</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
