# 🚀 "Kia Ora Tutor" 프로젝트 실행 기획안 (Project Execution Plan)
> **최종 업데이트**: 2026-02-22 (Phase 7 완료)  
> **보고자**: Anti-Gravity Team (Lead by Antigravity AI)

---

## 1. 프로젝트 비전
뉴질랜드 교육 환경에 최적화된 **Gemini 2.5 기반 AI 학습 에이전트**를 구축하여, 학생들이 단순히 답을 찾는 것을 넘어 스스로 원리를 깨우칠 수 있도록 돕는 프리미엄 학습 솔루션을 제공합니다.

---

## 2. 디자인 아키텍처 (Stitch MCP 기반)
Stitch 디자인(`889039726813448177`)의 프리미엄 감성을 GAS 환경에 이식합니다.

- **Theme**: Light/Dark 하이브리드 지원, `#2b8cee` 메인 블루, `#98FFD9` Mint 포인트.
- **Main Dashboard**: 
    - **통계 카드**: 레벨, XP, 스트릭(Streak), 배지(Badges), Active Quest 시각화.
    - **문서 업로드 존**: 드래그 앤 드롭 + 두 가지 업로드 경로 (Chat / Study Guide).
    - **업로드 파일 패널**: 세션 파일 목록 + `Save to Source Library` 버튼.
- **Tutor Interaction**: 
    - 소크라테스식 질문 대화창.
    - LaTeX 수식 및 마크다운 렌더링 (marked.js + KaTeX).
- **Learning Artifacts**: 
    - 분석된 핵심 개념을 카드 형태로 우측 사이드바에 상주.
- **Study Mode**:
    - Master Teacher AI가 생성한 학습지를 가독성 높은 CSS로 표시.
    - EN/KR 언어 전환 버튼 (기본: English).
- **Source Library 모달**:
    - Google Drive에 영구 저장된 소스 파일 관리.

---

## 3. MAS(Multi-Agent System) 중앙 통제형(Hub-and-Spoke) 설계

| 담당 | 에이전트 | 핵심 직무 | 워크플로우 |
|:---|:---|:---|:---|
| 기능/교육 | **Vision Analyst** | 이미지/PDF 구조 분석 | 독립 (병렬) |
| | **Learning Strategist** | Scaffolding 전략 수립 | Vision 이후 (순차) |
| | **Tutor Agent** | Socratic 문답 | Strategist 이후 (순차) |
| | **Master Teacher Agent** | Study Mode 학습지 생성 | Study Mode 전용 |
| | **Quiz Machine** | 검증용 문제 생성 | 세션 마무리 (🔜 미구현) |
| 디자인 | **UI Designer** | 시각적 렌더링 결정 | 개발 초기 (완료) |
| QC | **Localizer & QA** | NZ English 준수 검수 | 배포 전 |

---

## 4. 기술 사양 (Technical Spec)

| 항목 | 내용 |
|:---|:---|
| **배포 환경** | Google Apps Script (GAS), `HtmlService` IFRAME 모드 |
| **프론트엔드** | HTML + Vanilla JS + Tailwind CSS v3 (CDN), 단일 `Index.html` |
| **AI 모델** | `gemini-2.5-flash` (Vision), `gemini-2.5-pro` (Tutor/Teacher) |
| **로컬라이제이션** | 뉴질랜드(NZ) / NZD / NZ English |
| **스토리지** | Google Drive (`KiaOraTutor_Sources` 폴더) — Source Library 전용 |
| **배포 CLI** | `clasp` — `echo y \| clasp push` (gas-src 디렉터리에서 실행) |
| **권한 스코프** | `script.external_request` + `drive` |

### 4.1. 외부 라이브러리 (CDN)
- Tailwind CSS + Forms/Typography plugin
- Google Fonts (Spline Sans)
- Material Symbols Outlined (아이콘)
- marked.js (Markdown 렌더링)
- KaTeX (LaTeX 수식 렌더링)

---

## 5. 단계별 실행 로드맵 (Executed Phases)

### ✅ Phase 1 — 뼈대 구축
- GAS 프레임워크 세팅, SPA 구조, 기본 UI 컴포넌트 마크업.

### ✅ Phase 2 — AI 두뇌 결합
- Gemini API 연동, MAS 에이전트 체인 (Vision → Strategist → Tutor) 구현.
- LaTeX/마크다운 렌더링 라이브러리 연동.

### ✅ Phase 3 — Stitch UI 이식
- Stitch 디자인 감성을 GAS/HTML 환경으로 이식.
- 사이드바 네비게이션, 뷰 전환 SPA 구조 完.

### ✅ Phase 4 — 비전 & 아티팩트
- Vision Analyst 멀티모달 분석.
- 지식 카드(Knowledge Artifacts) 자동 저장.

### ✅ Phase 5 — 업로드 & 대시보드
- 드래그앤드롭 업로드, 파일 패널 UI.
- 대시보드 통계 연동 (Mock 데이터).

### ✅ Phase 6 — Study Mode
- Study Mode 독립 뷰 구현.
- Master Teacher Agent (20년 강사 페르소나).
- Study Mode 내 자체 파일 업로드 드롭존 + Generate 버튼.

### ✅ Phase 7 — Source Library & 통합
- **Source Library**: `saveSourceFile / getSavedSources / deleteSourceFile / getSourceFileData / getSourceFolder` GAS 백엔드 API 추가.
- **Drive 권한**: `appsscript.json`에 `drive` 스코프 추가.
- **통합 세션 소스**: `window.sessionSources` 전역 배열 — Chat & Study 두 기능이 공통 파일 사용.
- **EN/KR 언어 토글**: Study Mode 헤더 우측에 언어 선택 버튼, `generateStudyGuide(lang)` 파라미터 연동.
- **Study Guide 가독성 CSS**: H1/H2 강조선, H3 블루, 점선 구분선, 표, 블록인용 스타일.
- **Source Library 모달**: 파일 목록, 삭제, 직접 업로드, 배지 카운트.
- **JS 아키텍처 정리**: 손상된 script 블록을 `repair_html.py`로 클린 재작성. 단일 `<script>` 블록 구조 유지.

---

## 6. 다음 실행 과제 (Next Steps)

| 과제 | 우선순위 | 설명 |
|:---|:---:|:---|
| Adaptive Quiz 구현 | 🔴 HIGH | `generateQuiz()` 백엔드 + 퀴즈 UI 연결 |
| Source Library → AI 연동 | 🟡 MED | 앱 시작 시 Drive 소스 자동 로드하여 세션 소스로 초기화 |
| Multi-file Study Guide | 🟡 MED | 첫 파일만 아닌 다중 파일 동시 분석 · 통합 학습지 생성 |
| 사용자 데이터 영속성 | 🟢 LOW | XP/레벨/아티팩트 Google Sheets 또는 Firebase에 실제 저장 |
| NZD 가치 환산 대시보드 | 🟢 LOW | 학습 절약 비용 NZD 환산 시각화 |

---

## 7. 에이전트 인수인계 핵심 규칙

> 다음 에이전트가 이 프로젝트를 이어받을 때 반드시 숙지해야 할 사항:

1. **SSOT.md 먼저 읽기** — 전체 기술 스택, 핵심 함수 목록, 주의사항이 상세히 기록됨.
2. **clasp push 전 확인** — `gas-src/` 디렉터리 내에서 `echo y | clasp push` 실행.
3. **Index.html 수정 시 주의** — Python 인라인 패치는 파일 손상 위험. `repair_html.py` 패턴 또는 직접 편집 도구 사용 권장.
4. **단일 script 블록** — Index.html의 메인 JS는 Line 582의 단일 `<script>` 블록 내에만 위치해야 함. 두 번째 `<script>` 추가 금지.
5. **window.sessionSources** — 모든 업로드 파일의 세션 전역 저장소. Chat/Study 모두 이 배열 참조.
6. **Drive 권한 승인** — 앱 최초 실행 시 Drive 권한 팝업이 표시되면 반드시 승인해야 Source Library 작동.

---
**보고 일시**: 2026-02-22 (NZT)
