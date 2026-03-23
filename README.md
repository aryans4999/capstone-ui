# 🛡️ Aeviox AI - Next-Gen Smart Car Insurance Claims

Aeviox AI is a sophisticated, AI-driven platform built to streamline the car insurance claims lifecycle. By integrating advanced machine learning models with a modern web stack, Aeviox AI eliminates the friction of traditional insurance processes, providing users with instant assessments and adjusters with powerful management tools.

---

## 📖 Table of Contents

- [🌟 Core Philosophy](#-core-philosophy)
- [🚀 Key Features & Workflows](#-key-features--workflows)
- [🏗️ System Architecture](#-system-architecture)
- [🛠️ Tech Stack](#-tech-stack)
- [📂 Project Structure](#-project-structure)
- [🗄️ Data Model](#-data-model-inferred)
- [🏁 Getting Started](#-getting-started)
- [📝 Available Scripts](#-available-scripts)
- [🔮 Future Roadmap](#-future-roadmap)

---

## 🌟 Core Philosophy

Traditional insurance claims are plagued by slow manual inspections, paper-heavy documentation, and a lack of transparency. **Aeviox AI** solves this by:
1.  **Instant Gratification**: Providing immediate AI-based damage assessments via photos and videos.
2.  **Transparency**: A live processing timeline that keeps the claimant informed at every stage.
3.  **Efficiency**: Automating itemized repair estimates to reduce the workload on human adjusters.

---

## 🚀 Key Features & Workflows

### 1. 🤖 AI-Powered Claim Assistant
*   **Step-by-Step Guidance**: Powered by the **Vercel AI SDK**, the assistant helps users describe the accident, upload evidence, and verify policy details.
*   **Visual Analysis**: Integrates with OpenAI (GPT-4o) or Google Gemini to analyze uploaded images/videos for specific damage types (dents, scratches, structural issues).

### 2. 📊 Real-Time Claim Tracking
*   **Interactive Timeline**: Tracks a claim from *Filed* → *Evidence Collected* → *AI Assessment* → *Expert Review* → *Final Decision*.
*   **Progress Indicators**: Visual feedback on the percentage of completion for each claim.

### 3. 🎥 Video Evidence & AI Assessment
*   **Frame Analysis**: Processes video evidence to capture multiple angles of vehicle damage.
*   **AI Confidence Scores**: Provides adjusters with a confidence level for AI-detected damages.

### 4. 📄 Automated Reporting & Itemization
*   **Itemized Repairs**: Generates a detailed breakdown of parts, labor costs, and specific damages.
*   **PDF/Printable Reports**: One-click generation of official damage assessment reports for users and repair shops.

### 5. 🛡️ Dual-Role Dashboards
*   **User Dashboard**: Focused on claim filing, document management, and profile updates.
*   **Admin Dashboard**: High-level overview of all claims, user management, and manual verification tools.

---

## 🏗️ System Architecture

Aeviox AI follows a modern, serverless architecture:

-   **Frontend**: **Next.js 16** with React 19, utilizing Server Components for performance and Client Components for interactivity.
-   **Authentication**: **Clerk** manages user sessions, multi-factor authentication, and role-based access control (Admin vs. User).
-   **Database & Storage**: **Supabase** (PostgreSQL) stores claim data, while Supabase Storage handles high-resolution evidence images and videos.
-   **AI Orchestration**: **Vercel AI SDK** acts as the bridge between the UI and LLMs (OpenAI/Gemini), handling streaming responses and tool-calling for damage estimation.

---

## 🛠️ Tech Stack

### Frontend & UI
-   **Next.js 16**: App Router, Server Actions, and optimized metadata.
-   **Tailwind CSS**: Utility-first styling with custom animations.
-   **shadcn/ui**: Accessible, high-quality components built on **Radix UI**.
-   **Lucide React**: Consistent and beautiful iconography.
-   **Recharts**: Data visualization for claim stats and payouts.

### Backend & AI
-   **Supabase**: Real-time database updates and secure file storage.
-   **Clerk**: Enterprise-grade identity management.
-   **Vercel AI SDK**: Unified interface for AI model interactions.
-   **Zod**: Schema-based validation for all API routes and form submissions.

---

## 📂 Project Structure

```text
aeviox-ai-claims-app/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Authentication routes (Sign-in/Sign-up)
│   ├── admin/                  # Admin Dashboard (High-level management)
│   │   └── dashboard/          # Claims/Users overview
│   ├── dashboard/              # User Dashboard (Claimant view)
│   │   ├── claims/             # Individual claim tracking & history
│   │   ├── documents/          # Secure vault for policy docs & ID
│   │   ├── profile/            # User settings & Vehicle info
│   │   └── video-proof/        # AI Video analysis interface
│   ├── api/                    # Serverless API routes (AI processing, webhooks)
│   ├── layout.tsx              # Global layout with providers
│   └── page.tsx                # Marketing landing page
├── components/                 # Atomic design structure
│   ├── admin/                  # Specialized admin views (UsersList, ClaimsManager)
│   ├── dashboard/              # User-specific views (ClaimsList, Timeline)
│   ├── ui/                     # Reusable shadcn/ui components
│   ├── error-boundary.tsx      # Robust error handling
│   └── theme-provider.tsx      # Dark/Light mode logic
├── hooks/                      # Custom React hooks (useToast, useMobile)
├── lib/                        # Business logic & Third-party clients
│   ├── supabase/               # Supabase JS client config
│   ├── ai/                     # AI prompt templates and logic
│   └── utils.ts                # Formatting and class merging
├── public/                     # Static assets & placeholders
├── styles/                     # Global CSS and Tailwind directives
├── supabase.ts                 # Type definitions for the database
├── components.json             # shadcn/ui config
└── package.json                # Dependency manifest
```

---

## 🗄️ Data Model (Inferred)

The system revolves around the `claims` table:

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` | Unique identifier for the claim. |
| `policy_number` | `String` | Linked insurance policy. |
| `status` | `Enum` | `Pending`, `In Review`, `Approved`, `Rejected`. |
| `claim_date` | `Date` | Date of the incident. |
| `location` | `String` | Incident location/GPS data. |
| `images` | `JSONB` | Array of URLs to evidence photos. |
| `damages` | `JSONB` | AI-generated summary of detected damages. |
| `repair` | `JSONB` | Itemized list: `{ part_name, part_cost, damage_desc }`. |

---

## 🏁 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/your-username/aeviox-ai-claims-app.git
cd aeviox-ai-claims-app
pnpm install
```

### 2. Environment Configuration
Create a `.env.local` file with the following keys:
```env
# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Backend
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# AI (Pick one or both)
OPENAI_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
```

### 3. Database Setup
Ensure your Supabase project has a `claims` table matching the schema above. Enable **Row Level Security (RLS)** to protect user data.

### 4. Launch
```bash
pnpm dev
```

---

## 📝 Available Scripts

-   `pnpm dev`: Run development server with HMR.
-   `pnpm build`: Generate optimized production build.
-   `pnpm lint`: Run static analysis to find code issues.
-   `pnpm start`: Serve the production build.

---

## 🔮 Future Roadmap

-   [ ] **OCR Integration**: Automatically extract data from driver licenses and police reports.
-   [ ] **Garage Network Integration**: Directly send approved estimates to nearby partner repair shops.
-   [ ] **Real-time Chat**: AI-powered live support for immediate claim queries.
-   [ ] **Mobile App (PWA)**: Enhanced mobile experience for on-site accident reporting.

---
Built with 🚀 for the future of Insurance Technology.
