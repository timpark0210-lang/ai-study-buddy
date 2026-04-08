---
description: 안정적인 Git Push 수행을 위한 순차 실행 워크플로우 (PowerShell 파싱 오류 방지)
---

# Git Push Workflow

이 워크플로우는 `cmd /c`와 `&&` 연산자를 조합할 때 발생하는 특수문자 및 따옴표 파싱 에러(PowerShell 환경 이슈)를 피하기 위해 설계되었습니다. 여러 명령어를 조합하지 않고 개별적으로 순차 실행합니다.

// turbo-all

1. 변경된 파일들의 상태를 먼저 확인합니다.
2. `git status`

3. 변경사항을 스테이징 영역에 추가합니다. (특정 파일이 주어지지 않은 경우 모든 변경사항 추가)
4. `git add .`

5. 변경사항을 커밋합니다. (에이전트는 작업 내용에 맞춰 Conventional Commits 형식으로 메시지를 작성해야 합니다.)
6. `git commit -m "[자동 생성된 커밋 메시지]"`

7. 원격 저장소(`main` 브랜치 기준)로 푸시를 수행합니다.
8. `git push origin main`
