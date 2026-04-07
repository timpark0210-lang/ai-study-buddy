# Kia Ora Tutor: Single Source of Truth (SSOT)

## 1. Project Identity
- **Name**: Kia Ora Tutor
- **Active Project**: **"Kia Ora Tutor"** (NZ Secondary School AI Study Assistant).
- **Platform**: Next.js 16.1.6 (Turbopack) + Gemini 1.5/2.5.
- **Architecture**: Internationalized routing (`src/app/[locale]`), Zustand state, Tailwind v4 styling.
- **Operational Guard**: Always use `;` for command chaining and avoid parentheses in git commits due to Windows PowerShell constraints.
- **Core Vision**: A premium, AI-driven educational assistant with a focus on New Zealand context and bilingual support (EN/KO).
- **Design Aesthetic**: Glassmorphism, Modern Dark Mode, Framer Motion animations.

## 2. Technical Stack (v16.65 & MAS-Driven)
- **Framework**: Next.js 16.1.6 (App Router / Turbopack)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4.0.0 (Glassmorphism & Luminous Scholar Theme)
- **State Management**: Zustand (Persist Middleware)
- **Storage Pipeline**: 
    - **Cloud**: Vercel Blob (Permanent storage for PDFs, MDs, user data)
    - **Local**: localforage / IndexedDB (Offline cache & rapid loading)
- **AI Integration**: Gemini 1.5/2.5 via Next.js Server Actions
- **Internationalization**: `next-intl` v4.8.3

## 3. Directory Architecture (Internationalized)
```text
src/
├── app/
│   ├── [locale]/             # All localized page routes
│   │   ├── library/          # Study Library
│   │   ├── quiz/             # Flashcard & Quiz system
│   │   ├── tutor/            # AI Tutor chat interface
│   │   ├── layout.tsx        # Localized Layout (NextIntlClientProvider)
│   │   └── page.tsx          # Home Page (Localized)
│   ├── api/                  # Global API routes (non-localized)
│   ├── globals.css           # Global styles (Tailwind v4)
│   └── not-found.tsx         # Root 404 Fallback
├── components/               # Atomic & Domain components
├── i18n/                     # next-intl configuration (routing.ts, request.ts)
├── messages/                 # i18n Dictionary (en.json, ko.json)
└── types/                    # Global TypeScript definitions
```

## 4. Critical Routing Guard (Middleware)
- **Policy**: Manual locale normalization to prevent regional nesting loops (e.g., `/en/en-NZ`).
- **Default Locale**: `en`
- **Supported Locales**: `['en', 'ko']`

## 5. UI/UX Tokens
- **Primary**: `hsl(var(--primary))` (premium focus)
- **Surface**: `rgba(255, 255, 255, 0.05)` (Glassmorphism base)
- **Blur**: `backdrp-blur-md`

## 6. Git & Operational Standards
### 🪟 Windows (PowerShell/CMD)
> [!IMPORTANT]
> - **Operator Mismatch**: Standard PowerShell (5.x) does NOT support `&&`. Always use `;` for sequential execution.
> - **Sub-expression Collision**: Parentheses `()` or brackets `[]` in commit messages are often parsed as sub-expressions. Always wrap messages in single quotes `'...'` OR avoid parentheses altogether.
> - **Comprehensive Staging**: Use `git add -A` to ensure all untracked files are captured regardless of directory state.

```powershell
# Use absolute path to global skill script
powershell -ExecutionPolicy Bypass -File "C:\Users\flyto\.gemini\antigravity\skills\git-pushing\scripts\smart_commit.ps1" "feat: add feature"

# OR use git directly (Safe for PowerShell/CMD)
git add -A; git commit -m 'feat: add feature message without parentheses'; git push origin main
```

### 💡 Fallback Strategy
If the scripts fail due to environment restrictions, **DO NOT RETRY**. Instead, manually execute the sequence:
1. `git add -A`
2. `git commit -m 'your message'` (Avoid parentheses or use single quotes)
3. `git status` (Check for success)
4. `git push origin main`
