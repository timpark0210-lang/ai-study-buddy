# Kia Ora Tutor: Single Source of Truth (SSOT)

## 1. Project Identity
- **Name**: Kia Ora Tutor
- **Core Vision**: A premium, AI-driven educational assistant with a focus on New Zealand context and bilingual support (EN/KO).
- **Design Aesthetic**: Glassmorphism, Modern Dark Mode, Framer Motion animations.

## 2. Technical Stack (v4 Standard)
- **Framework**: Next.js 16.1.6 (Turbopack)
- **Styling**: Tailwind CSS v4.0.0 (Custom HSL Palettes)
- **Internationalization**: `next-intl` v4.8.3
- **State Management**: Zustand
- **AI Integration**: Gemini 1.5/2.5 via custom API routes

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
