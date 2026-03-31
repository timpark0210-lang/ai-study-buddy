# SSOT (Single Source of Truth) - Kia Ora Tutor Modernization

## 1. 프로젝트 개요 (Overview)
- **명칭**: Kia Ora Tutor (NZ AI Study Buddy)
- **목표**: GAS 기반 단일 파일 레거시 시스템을 Next.js 15 + Vercel 환경으로 완전 마이그레이션 및 고도화.
- **핵심 가치**: Socratic Method (소크라테스식 문답), AI Multi-Agent System (MAS), Premium UX.

## 2. 기술 스택 (Tech Stack)
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4 (Glassmorphism & Vibrant Design)
- **State Management**: Zustand (Global Store)
- **AI Engine**: Google Gemini 1.5 Pro/Flash (via Google AI SDK or API Route)
- **Persistence**: Browser IndexedDB (localforage) + API Synchronization
- **Animation**: Framer Motion / Lucide React

## 3. MAS 아키텍처 (Multi-Agent System)
- **Vision Analyst**: PDF/이미지에서 텍스트 및 구조 정보 추출.
- **Learning Strategist**: 학생의 수준과 목표 개념(Target Concept)을 분석하여 학습 경로(Scaffolding) 수립.
- **Tutor Agent**: Strategist의 계획에 따라 소크라테스식 문답을 수행. (절대 정답 발설 금지)
- **Master Teacher Agent**: 분석된 내용을 바탕으로 프리미엄 학습 가이드(Study Guide) 생성.
- **Quiz Machine**: 학습 결과 검증을 위한 5문항의 적응형 퀴즈 생성.

## 4. 폴더 구조 (Directory Structure)
```text
src/
├── app/                  # App Router (Pages & API)
│   ├── api/              # Route Handlers (AI, Utils)
│   ├── (main)/           # Main App UI (Chat, Viewers)
│   └── layout.tsx        # Base Layout
├── components/           # UI Components
│   ├── ui/               # Primary components (Buttons, Cards)
│   ├── chat/             # Message bubbles, Chat form
│   ├── study/            # Study guide renderer
│   └── library/          # Source Library modal/list
├── lib/                  # Centralized logic
│   ├── agents/           # Multi-Agent logic
│   ├── hooks/            # Custom hooks
│   └── utils/            # Shared utilities (PDF, Markdown)
├── store/                # Zustand Stores (User, Library, Artifacts)
└── types/                # Unified TypeScript Definitions
```

## 5. 데이터 흐름 (Data Pipeline)
1. **Input**: User uploads file or text.
2. **Sync**: Saved to `SourceLibraryStore` (Zustand) & `IndexedDB`.
3. **Analyze**: Vision Analyst & Strategist process input -> Context Object.
4. **Action**: Select Agent (Tutor/Teacher/Quiz) based on View Mode.
5. **Output**: AI-generated content (Markdown/LaTeX) rendered in UI.
