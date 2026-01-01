# Obsidian 블로그 워크플로우 빠른 참조

## 🚀 자주 사용하는 단축키

| 단축키 | 기능 |
|--------|------|
| `⌘N` | 새 블로그 포스트 (QuickAdd 설정 후) |
| `⌘⇧I` | 아이디어 빠른 캡처 |
| `⌘E` | 편집/미리보기 모드 전환 |
| `⌘P` | 명령 팔레트 |
| `⌘O` | 파일 빠른 열기 |
| `⌘⇧F` | 전체 검색 |
| `⌘⇧C` | Git Commit |
| `⌘⇧P` | Git Push |
| `⌘K` | 링크 삽입 |
| `⌘B` | 굵게 |
| `⌘I` | 기울임 |

## 📋 블로그 포스트 Frontmatter 템플릿

```yaml
---
title: 제목을 입력하세요
date: 2024-03-24
tags:
  - 일
  - 태그2
status: draft
---
```

## 🏷️ 표준 태그 목록

**카테고리 태그 (1개 선택)**:
- `일` - 업무/커리어
- `사고` - 생각/철학
- `기술` - 개발/기술
- `삶` - 일상/라이프스타일

**보조 태그 (자유롭게)**:
- `스타트업`, `창업`, `의사결정`, `성장`, `개발`, `디자인`, 등

## 🖼️ 이미지 삽입 방법

1. **복사-붙여넣기**: 이미지 복사 → `⌘V`
2. **마크다운**: `![설명](../../public/images/posts/filename.png)`
3. **자동 경로**: Paste Image Rename 플러그인이 자동 처리

## 📁 디렉토리 구조

```
/content/
├── .obsidian/          # Obsidian 설정
├── templates/          # 템플릿 파일
│   ├── blog-post.md
│   ├── blog-post-with-filename.md
│   ├── draft.md
│   └── daily-note.md
├── posts/              # 블로그 포스트
│   └── YYYY-MM-DD-slug.md
├── Dashboard.md        # 관리 대시보드
└── intro.md
```

## 📝 일반적인 워크플로우

### 새 포스트 작성
1. `⌘N` 또는 QuickAdd 실행
2. 제목 및 슬러그 입력
3. 태그 선택
4. 본문 작성
5. 이미지 추가 (`⌘V`)
6. Linter 실행 (저장 시 자동)
7. Git commit & push (`⌘⇧C` + `⌘⇧P`)

### 초안 관리
1. Dashboard.md 열기
2. "초안 상태 포스트" 섹션 확인
3. 작업할 포스트 선택
4. 완료 후 `status: published`로 변경

### 아이디어 캡처
1. `⌘⇧I` (QuickAdd 설정 후)
2. 아이디어 제목 입력
3. 간단한 내용 메모
4. 나중에 확장하여 포스트로 발전

## 🔍 유용한 Dataview 쿼리

### 최근 포스트 목록
```dataview
TABLE title, date, tags
FROM "posts"
SORT date DESC
LIMIT 5
```

### 초안만 보기
```dataview
LIST
FROM "posts"
WHERE status = "draft"
```

### 특정 태그 검색
```dataview
TABLE title, date
FROM "posts"
WHERE contains(tags, "일")
SORT date DESC
```

## 🛠️ 문제 해결

### Templater가 작동하지 않을 때
- `설정` → `Templater` → `Template folder location` 확인
- 경로: `templates`

### 이미지가 보이지 않을 때
- 경로 확인: `../../public/images/posts/`
- 파일명에 공백이 있으면 인코딩 문제 발생 가능

### Git 동기화 안 될 때
- Obsidian Git 플러그인 활성화 확인
- `설정` → `Obsidian Git` → "Auto backup" 활성화

## 📦 필수 플러그인 체크리스트

- [ ] Templater
- [ ] Dataview
- [ ] QuickAdd
- [ ] Linter
- [ ] Obsidian Git
- [ ] Paste image rename
- [ ] Tag Wrangler
- [ ] Calendar

## 💾 백업 체크

- 자동: Obsidian Git (30분마다)
- 수동: `⌘⇧C` + `⌘⇧P`
- 확인: GitHub 저장소 확인

---

**더 자세한 내용은** `OBSIDIAN_BLOG_WORKFLOW.md` 참조
