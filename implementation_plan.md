# Implementation Plan - Refactoring to Vercel

## Phase 1: 환경 설정 및 핵심 인프라 (Core Foundation)
- [ ] `SSOT.md` 기반 프로젝트 설정 확인 및 `package.json` 종속성 업데이트.
- [ ] `lib/agents/` 내 Gemini API 호출 공통 래퍼(Wrapper) 캡슐화.
- [ ] 4개 핵심 에이전트(Analyst, Strategist, Tutor, Teacher)의 순수 로직 모듈화.

## Phase 2: 상태 관리 및 API 레이어 (Bridge)
- [ ] **Zustand Store** 구축:
    - [ ] `useUserStore`: Level, XP, Streak 관리.
    - [ ] `useLibraryStore`: 업로드 파일 목록, 세션 관리.
    - [ ] `useArtifactStore`: 학습 아티팩트 관리.
- [ ] **API Routes**: `/api/chat`, `/api/generate-guide`, `/api/generate-quiz` 완벽 구현.

## Phase 3: 프리미엄 컴포넌트 마이그레이션 (UI/UX)
- [ ] `gas-src/Index.html`의 CSS 테마를 신규 Tailwind v4 디자인 시스템으로 이식.
- [ ] **Chat View**: 버블 시스템, 파일 프리뷰, 아티팩트 사이드바 컴포넌트화.
- [ ] **Study View**: 마크다운/LaTeX 고가독성 렌더러 구현.
- [ ] **Dashboard**: 대시보드 통계 카드 및 유저 프로필 카드 리액트 컴포넌트화.
- [ ] **Common UI**: `GlassCard`, `PremiumButton`, `LoadingSpinner` 제작.

## Phase 4: 기능 통합 및 검증 (Integration)
- [ ] `localforage` 연동을 통한 브라우저 영속성 확보.
- [ ] **Study Guide**의 PDF 다운로드 기능 현대화.
- [ ] **Adaptive Quiz**의 UI 상태 관리 및 데이터 흐름 완성.

## Phase 5: 최종 배포 및 품질 보증 (QA & Deploy)
- [ ] Lighthouse 성능 및 접근성 최적화.
- [ ] Vercel 자동 배포 연동 및 환경 변수(API Keys) 설정.
- [ ] 최종 사용자 시나리오 테스트.
