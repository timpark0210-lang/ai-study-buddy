---
description: Pull latest changes from GitHub main branch using github-mcp-server
---

1. GitHub MCP 서버를 사용하여 원격 저장소(`main` 브랜치)의 파일 상태를 조회합니다.
   - `owner`: "timpark0210-lang"
   - `repo`: "ai-study-buddy"
   - `ref`: "refs/heads/main"

2. 로컬 파일 시스템과 원격 저장소의 내용을 비교합니다.
   - 원격지에만 있거나, 내용이 다른 파일을 찾아냅니다.
   - 대형 프로젝트의 경우 주요 디렉토리(`src`, `public` 등)를 순차적으로 확인합니다.

3. 변경된 파일 목록 및 업데이트 내용을 대표님께 요약 보고합니다.

4. 대표님의 동기화 승인 시, `write_to_file` 도구를 사용하여 로컬 파일을 최신 원격 데이터로 덮어씁니다.

5. 동기화가 완료되면 변경된 파일 수와 주요 변경 사항을 한국어로 보고합니다.
