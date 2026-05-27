---
description: Push local changes to GitHub main branch using github-mcp-server
---

// turbo
1. 로컬 저장소의 상태를 확인하여 변경된 파일을 식별합니다.
   - `git status --short` 실행

2. 식별된 파일들을 처리합니다.
   - 신규/수정 파일: `view_file` 도구로 최신 내용을 읽습니다.
   - 삭제된 파일: 삭제 목록에 추가합니다.

3. GitHub MCP 서버의 `push_files` 도구를 호출하여 커밋 및 푸시합니다.
   - `owner`: "timpark0210-lang"
   - `repo`: "ai-study-buddy"
   - `branch`: "main"
   - `files`: `{path, content}` 객체 배열
   - `message`: 변경 사항을 요약한 영문 커밋 메시지

4. 삭제된 파일이 있는 경우 `delete_file` 도구를 각각 호출합니다.

5. 작업 결과를 대표님께 한국어로 보고하며, 커밋 SHA를 포함합니다.
