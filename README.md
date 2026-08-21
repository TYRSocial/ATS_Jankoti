# 🧠 Jankoti ATS Resume Checker
### *AI-Powered Applicant Tracking System Resume Analyzer*

> **"Jankoti — Igniting Future Ideas"**  
> Built for recruiters and job seekers who want data-driven, ATS-compatible resumes.

---

## 🚀 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 14.2.5 | App Router, SSR, API Routes |
| **React** | 18 | UI component library |
| **TypeScript** | 5 | Type-safe development |
| **Tailwind CSS** | 3.4 | Utility-first styling |
| **Lucide React** | Latest | Icon system |
| **Recharts** | Latest | Score visualizations & charts |

### Backend (API Routes — Built-in Next.js)
| Technology | Purpose |
|---|---|
| **Next.js API Routes** | RESTful endpoints (`/api/*`) |
| **Mongoose** | MongoDB ODM & schema validation |
| **MongoDB** | Primary persistent database |

### Database Schema
| Model | Fields |
|---|---|
| `Analysis` | ATS score, category breakdowns, keyword matrix, skill comparison, section audits, recommendations, bullet suggestions |
| `User` | Candidate profile, scan count aggregates, auth info |

### DevOps / Tooling
| Tool | Purpose |
|---|---|
| **PostCSS + Autoprefixer** | CSS processing |
| **ESLint** | Code linting |
| **.env.local** | Secure environment config |
| **Git + GitHub** | Version control |

---

## 📐 Architecture

```
ATS/
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── page.tsx                # Landing page
│   │   ├── upload/page.tsx         # Resume upload + JD input
│   │   ├── dashboard/page.tsx      # Candidate dashboard
│   │   ├── history/page.tsx        # Scan history
│   │   ├── login/page.tsx          # Auth — Login
│   │   ├── register/page.tsx       # Auth — Register
│   │   ├── settings/page.tsx       # MongoDB & API settings
│   │   ├── analysis/
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # ATS Report dashboard
│   │   │       └── improve/page.tsx # AI Bullet Optimizer
│   │   └── api/
│   │       ├── analysis/
│   │       │   ├── route.ts        # POST — Run analysis
│   │       │   ├── history/route.ts # GET — Fetch history
│   │       │   └── [id]/route.ts   # GET, PATCH, DELETE — Single report
│   │       ├── resume/
│   │       │   └── upload/route.ts # POST — Resume file upload
│   │       └── auth/
│   │           ├── login/route.ts  # POST — Login
│   │           └── register/route.ts # POST — Register
│   ├── components/
│   │   └── navigation/Navbar.tsx   # Jankoti branded navbar
│   ├── lib/
│   │   ├── db.ts                   # MongoDB singleton connection
│   │   ├── mockData.ts             # Fallback mock data engine
│   │   └── utils.ts                # Utility helpers
│   ├── models/
│   │   ├── Analysis.ts             # Mongoose ATS Analysis schema
│   │   └── User.ts                 # Mongoose User schema
│   ├── services/
│   │   ├── analysis.ts             # Analysis service (MongoDB + fallback)
│   │   ├── resume.ts               # Resume upload service
│   │   └── api.ts                  # Base API fetch wrapper
│   └── types/
│       └── ats.ts                  # TypeScript interfaces & types
├── .env.local                      # Environment variables (not committed)
├── tailwind.config.ts              # Jankoti design tokens
├── next.config.mjs                 # Next.js config
└── tsconfig.json                   # TypeScript config
```

---

## ✨ Features

### 🎯 ATS Score Engine
- **Overall ATS Score** — 0–100 radial gauge with color-coded rating
- **6 Category Breakdowns** — Keyword Match, Formatting, Skills Alignment, Work Experience, Education, ATS Compatibility
- **Keyword Matrix** — Matched ✅ vs Missing ❌ keywords with impact ratings (Critical / High / Medium / Low)
- **Skill Comparison** — Side-by-side required vs candidate skills table
- **Section Audits** — Per-section health checks (Contact, Summary, Experience, Education, Skills, etc.)
- **Recommendations** — High-impact, actionable improvement cards

### 🤖 AI Bullet Optimizer
- Side-by-side original vs AI-enhanced bullet comparisons
- **Accept** / **Reject** / **Undo** per bullet point
- Impact metrics for each rewrite

### 📊 Dashboard
- Overview metrics with trend indicators
- Recent scan history with mini radial score gauges
- Quick scan launcher

### 📁 Scan History
- Real-time search by job title / company
- Score filters: All · ≥75% · 50–74% · <50%
- MongoDB-backed deletion

### 🔐 Authentication
- Candidate registration & login
- Guest mode (no login required)

### ⚙️ Settings
- MongoDB connection URI overview
- Custom backend API endpoint configuration
- Live connection tester

---

## 🎨 Design System

| Token | Value | Usage |
|---|---|---|
| `navy` | `#0A2540` | Primary brand dark |
| `deep-blue` | `#0D1B2E` | Background surfaces |
| `orange` | `#E67E22` | CTA buttons, highlights |
| `amber` | `#F39C12` | Accent, score indicators |
| `indigo` | `#4F46E5` | Secondary accents |
| `dark-surface` | `#080D1A` | App background |

**UI Style**: Glassmorphism · Dark mode · Micro-animations · Radial gauges · Gradient cards

---

## 🛠️ Setup & Installation

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/TYRSocial/ATS_Jankoti.git
cd ATS_Jankoti
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env.local` file in the root:
```env
MONGODB_URI=mongodb://localhost:27017/ats-checker
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 4. Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/analysis` | Submit resume + JD for ATS analysis |
| `GET` | `/api/analysis/history` | Fetch paginated scan history |
| `GET` | `/api/analysis/:id` | Get single analysis report |
| `PATCH` | `/api/analysis/:id` | Update bullet suggestion status |
| `DELETE` | `/api/analysis/:id` | Delete a scan record |
| `POST` | `/api/resume/upload` | Upload resume file (PDF/DOCX ≤5MB) |
| `POST` | `/api/auth/register` | Register candidate |
| `POST` | `/api/auth/login` | Login candidate |

---

## 📋 Design Reference

This frontend was built from a provided **UI/UX PDF specification** that defined:
- Page layouts and component hierarchy
- Color palette and typography (Jankoti brand guidelines)
- Navigation flow and user journeys
- Dashboard widget structure
- ATS scorecard visual design
- Keyword matrix and skill comparison table layouts
- AI bullet optimizer interface

The design follows **Material Design + Glassmorphism** principles with a dark space-blue aesthetic.

---

## 🏢 About Jankoti

**Jankoti** is a recruitment & HR-tech platform that empowers candidates and recruiters with AI-driven tools to optimize hiring processes.

> *"Igniting Future Ideas"* — Jankoti's mission is to bridge the gap between talent and opportunity through intelligent automation.

---

## 📝 License

This project is proprietary to **TYRSocial / Jankoti**. All rights reserved.
