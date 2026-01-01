# Obsidian 블로그 워크플로우 최적화 가이드

현재 설정: `/content/` Obsidian 볼트, Obsidian Git 플러그인, Templater 플러그인 설치됨

---

## 목차
1. [필수 무료 플러그인 설치 및 설정](#1-필수-무료-플러그인-설치-및-설정)
2. [Templater로 블로그 포스트 템플릿 설정](#2-templater로-블로그-포스트-템플릿-설정)
3. [Obsidian Git 플러그인 고급 설정](#3-obsidian-git-플러그인-고급-설정)
4. [Dataview로 콘텐츠 관리 대시보드 만들기](#4-dataview로-콘텐츠-관리-대시보드-만들기)
5. [이미지 처리 워크플로우](#5-이미지-처리-워크플로우)
6. [빠른 캡처 워크플로우](#6-빠른-캡처-워크플로우)
7. [태그 및 메타데이터 관리](#7-태그-및-메타데이터-관리)
8. [미리보기 및 검증](#8-미리보기-및-검증)
9. [추가 생산성 팁](#9-추가-생산성-팁)

---

## 1. 필수 무료 플러그인 설치 및 설정

### 1.1 커뮤니티 플러그인 활성화
1. `설정(⌘,)` → `커뮤니티 플러그인` → `제한 모드 끄기`
2. `찾아보기` 클릭

### 1.2 설치할 플러그인 목록

#### **Templater** (이미 설치됨, 추가 설정 필요)
- **용도**: 동적 블로그 포스트 템플릿 생성
- **설정 위치**: `설정` → `Templater`
- **필수 설정**:
  - Template folder location: `templates/` (새 폴더 생성)
  - Trigger Templater on new file creation: 활성화
  - Enable folder templates: 활성화
    - `posts/` → `templates/blog-post.md` 연결

#### **Dataview** ⭐ 최우선
- **용도**: 블로그 포스트 관리 대시보드, 통계, 필터링
- **설치**: 커뮤니티 플러그인에서 "Dataview" 검색
- **설정**:
  - Enable JavaScript Queries: 활성화
  - Enable Inline Queries: 활성화

#### **QuickAdd** ⭐ 필수
- **용도**: 빠른 블로그 포스트 생성 매크로
- **설치**: 커뮤니티 플러그인에서 "QuickAdd" 검색
- **나중에 설정 상세 설명**

#### **Linter**
- **용도**: 마크다운 포맷팅 자동화, YAML frontmatter 정리
- **설치**: 커뮤니티 플러그인에서 "Linter" 검색
- **설정**:
  - YAML Title Alignment: 활성화
  - Format Tags: 활성화
  - Line Break at Document End: 활성화
  - Remove Empty Lines: 활성화

#### **Calendar**
- **용도**: 블로그 포스팅 일정 시각화
- **설치**: 커뮤니티 플러그인에서 "Calendar" 검색
- **설정**:
  - Default date format: `YYYY-MM-DD`
  - Show week number: 활성화

#### **Tag Wrangler**
- **용도**: 태그 일괄 관리, 이름 변경
- **설치**: 커뮤니티 플러그인에서 "Tag Wrangler" 검색

#### **Paste image rename**
- **용도**: 이미지 붙여넣기 시 자동으로 이름 변경
- **설치**: 커뮤니티 플러그인에서 "Paste image rename" 검색
- **설정**:
  - Image name pattern: `{{fileName}}-{{DATE:YYYYMMDDHHmmss}}`
  - Duplicate number: 활성화

#### **Front Matter Title**
- **용도**: 파일명 대신 frontmatter의 title 표시
- **설치**: 커뮤니티 플러그인에서 "Front Matter Title" 검색

---

## 2. Templater로 블로그 포스트 템플릿 설정

### 2.1 템플릿 폴더 구조
```
/content/
├── .obsidian/
├── templates/           ← 새로 생성
│   ├── blog-post.md    ← 메인 블로그 포스트 템플릿
│   ├── draft.md        ← 초안 템플릿
│   └── daily-note.md   ← 데일리 노트 템플릿
├── posts/
└── intro.md
```

### 2.2 블로그 포스트 템플릿 생성

`/content/templates/blog-post.md` 파일을 아래 내용으로 생성:

```markdown
---
title: <% tp.file.cursor(1) %>
date: <% tp.date.now("YYYY-MM-DD") %>
tags:
  - <% tp.file.cursor(2) %>
status: draft
---

<% tp.file.cursor(3) %>

## 주요 내용

## 결론

---
**메타정보**
- 작성일: <% tp.date.now("YYYY-MM-DD HH:mm") %>
- 최종 수정: <% tp.file.last_modified_date("YYYY-MM-DD HH:mm") %>
- 글자 수:
```

### 2.3 파일명 자동화 템플릿

`/content/templates/blog-post-with-filename.md`:

```markdown
<%*
// 사용자에게 제목 입력 받기
const title = await tp.system.prompt("블로그 포스트 제목을 입력하세요:");
if (!title) return;

// 슬러그 생성 (영문으로 변환 필요시 수동 입력)
const slug = await tp.system.prompt("URL 슬러그를 입력하세요 (예: my-blog-post):");
if (!slug) return;

// 날짜 생성
const date = tp.date.now("YYYY-MM-DD");

// 파일명 생성
const fileName = `${date}-${slug}`;

// 파일 이름 변경
await tp.file.rename(fileName);
-%>
---
title: <%= title %>
date: <%= date %>
tags:
  - <% tp.file.cursor(1) %>
status: draft
---

<% tp.file.cursor(2) %>

## 주요 내용

## 결론

---
**메타정보**
- 작성일: <% tp.date.now("YYYY-MM-DD HH:mm") %>
- 최종 수정: <% tp.file.last_modified_date("YYYY-MM-DD HH:mm") %>
```

### 2.4 초안 템플릿

`/content/templates/draft.md`:

```markdown
---
title: 임시 아이디어 - <% tp.date.now("YYYY-MM-DD HH:mm") %>
date: <% tp.date.now("YYYY-MM-DD") %>
tags:
  - draft
  - idea
status: idea
---

## 아이디어 메모

<% tp.file.cursor() %>

## 다음 단계
- [ ] 주제 구체화
- [ ] 리서치
- [ ] 아웃라인 작성
- [ ] 초안 작성
- [ ] 퇴고
```

### 2.5 Templater 설정 완료
1. `설정` → `Templater` → `Template folder location`: `templates` 입력
2. `Trigger Templater on new file creation`: 활성화
3. `Folder Templates` → `Add New`:
   - Folder: `posts`
   - Template: `templates/blog-post.md`

---

## 3. Obsidian Git 플러그인 고급 설정

### 3.1 기본 설정
`설정` → `Obsidian Git`:

```
✅ Vault backup interval (minutes): 30
✅ Auto pull interval (minutes): 10
✅ Commit message: "content: {{date}} - {{numFiles}} files"
✅ Date placeholder format: YYYY-MM-DD HH:mm:ss
✅ Pull updates on startup: 활성화
✅ Push on backup: 활성화
```

### 3.2 고급 설정 (추천)

```
✅ Disable notifications: Off (알림 받기)
✅ Show status bar: 활성화
✅ Refresh Source Control view on file change: 활성화

커밋 메시지 템플릿:
- Main: "content: {{date}} - {{numFiles}} files"
- 수동 커밋시: "post: {{title}}" 형식 사용
```

### 3.3 .gitignore 설정

`/content/.gitignore` 파일 생성:

```gitignore
# Obsidian
.obsidian/workspace.json
.obsidian/workspace-mobile.json
.obsidian/cache

# OS
.DS_Store
Thumbs.db

# Temporary files
*.tmp
~*
```

### 3.4 유용한 Git 단축키 설정

`설정` → `단축키` → 다음 명령어 검색 후 설정:

- `Obsidian Git: Commit all changes`: `⌘⇧C`
- `Obsidian Git: Push`: `⌘⇧P`
- `Obsidian Git: Pull`: `⌘⇧L`
- `Obsidian Git: Open source control view`: `⌘⇧G`

### 3.5 커밋 전 체크리스트 (습관화)

블로그 포스트 발행 전:
1. Frontmatter 확인 (title, date, tags)
2. 이미지 경로 확인
3. 내부 링크 확인
4. Linter 실행 (`⌘⇧L` - 나중에 설정)
5. Git commit & push

---

## 4. Dataview로 콘텐츠 관리 대시보드 만들기

### 4.1 대시보드 파일 생성

`/content/Dashboard.md` 파일 생성:

````markdown
# 블로그 관리 대시보드

## 📊 통계

```dataview
TABLE
  length(rows) as "포스트 수"
FROM "posts"
GROUP BY file.folder
```

**총 포스트 수**: `= length(list(file.name) from "posts")` 개

---

## ✍️ 최근 작성한 포스트 (5개)

```dataview
TABLE
  title as "제목",
  date as "날짜",
  tags as "태그"
FROM "posts"
SORT date DESC
LIMIT 5
```

---

## 📝 초안 상태 포스트

```dataview
TABLE
  title as "제목",
  date as "날짜",
  tags as "태그"
FROM "posts"
WHERE status = "draft" OR !status
SORT date DESC
```

---

## 🏷️ 태그별 분류

```dataview
TABLE
  length(rows) as "포스트 수"
FROM "posts"
FLATTEN tags
GROUP BY tags
SORT length(rows) DESC
```

---

## 📅 월별 포스팅 현황

```dataview
TABLE
  length(rows) as "포스트 수"
FROM "posts"
WHERE date
GROUP BY dateformat(date, "yyyy-MM") as "월"
SORT "월" DESC
```

---

## 🔥 이번 달 포스트

```dataview
TABLE
  title as "제목",
  date as "날짜",
  tags as "태그"
FROM "posts"
WHERE date >= date(now) - dur(30 days)
SORT date DESC
```

---

## 📌 TODO: 발행 준비

- [ ] 초안 완성도 체크
- [ ] 이미지 최적화
- [ ] SEO 메타데이터 확인
- [ ] 내부 링크 추가
- [ ] 퇴고 완료

---

## 🎯 콘텐츠 아이디어

```dataview
TABLE
  title as "아이디어",
  date as "등록일"
FROM "posts"
WHERE contains(tags, "idea")
SORT date DESC
```

````

### 4.2 고급 Dataview 쿼리 예제

#### 4.2.1 글자 수 기준 정렬

````markdown
## 📏 글자 수별 포스트

```dataview
TABLE
  title as "제목",
  date as "날짜",
  length(file.content) as "글자 수"
FROM "posts"
SORT length(file.content) DESC
LIMIT 10
```
````

#### 4.2.2 태그 조합 검색

````markdown
## 🔍 특정 태그 조합

```dataview
TABLE
  title as "제목",
  date as "날짜",
  tags
FROM "posts"
WHERE contains(tags, "일") OR contains(tags, "사고")
SORT date DESC
```
````

#### 4.2.3 작성 빈도 분석

````markdown
## 📈 요일별 작성 통계

```dataviewjs
const posts = dv.pages('"posts"')
  .where(p => p.date)
  .groupBy(p => {
    const date = new Date(p.date);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[date.getDay()];
  });

dv.table(
  ["요일", "포스트 수"],
  posts.map(p => [p.key, p.rows.length])
);
```
````

---

## 5. 이미지 처리 워크플로우

### 5.1 Paste Image Rename 플러그인 설정

`설정` → `Paste image rename`:

```
Image name pattern: {{fileName}}-{{DATE:YYYYMMDDHHmmss}}
Image folder path: ../public/images/posts
Handle all attachments: 활성화
```

### 5.2 이미지 폴더 구조

```
/budapest/
├── content/
│   └── posts/
│       └── 2024-03-24-beginner.md
└── public/
    └── images/
        └── posts/              ← 블로그 이미지 저장소
            ├── beginner-20240324143022.png
            └── 10-principles-20240717092033.jpg
```

### 5.3 이미지 삽입 워크플로우

1. **방법 1: 복사-붙여넣기** (추천)
   - 이미지 복사 (`⌘C`)
   - Obsidian 에디터에 붙여넣기 (`⌘V`)
   - 자동으로 `/public/images/posts/` 에 저장
   - 마크다운 경로 자동 생성: `![](../../public/images/posts/filename.png)`

2. **방법 2: 드래그 앤 드롭**
   - 이미지 파일을 에디터로 드래그
   - Paste Image Rename이 자동으로 이름 변경

3. **방법 3: Templater로 이미지 스니펫**

   단축키로 이미지 템플릿 삽입:
   ```markdown
   ![이미지 설명](../../public/images/posts/<% tp.file.cursor() %>)
   ```

### 5.4 이미지 최적화 (선택사항)

외부 도구 사용:
- **TinyPNG** (https://tinypng.com) - 웹에서 드래그 앤 드롭
- **ImageOptim** (Mac 무료 앱) - 드래그 앤 드롭으로 자동 최적화

워크플로우:
1. 이미지를 `/public/images/posts/`에 저장
2. ImageOptim으로 드래그하여 압축
3. Obsidian에서 마크다운 링크 삽입

---

## 6. 빠른 캡처 워크플로우

### 6.1 QuickAdd 플러그인 설정

`설정` → `QuickAdd` → `Manage Macros`:

#### 매크로 1: 새 블로그 포스트

1. `Add Macro` 클릭
2. 이름: "새 블로그 포스트"
3. `Configure` 클릭
4. `Template` 선택 → `templates/blog-post-with-filename.md`
5. `File Name Format`: `{{VALUE:제목}}`
6. `Folder`: `posts/`

#### 매크로 2: 빠른 아이디어 메모

1. `Add Macro` 클릭
2. 이름: "아이디어 캡처"
3. `Capture` 선택
4. Capture format:
   ```markdown
   ## {{DATE:HH:mm}} - {{VALUE:아이디어 제목}}

   {{VALUE:내용}}

   ---
   ```
5. `Capture to`: `posts/ideas.md`
6. `Insert after`: `## 아이디어 리스트`

### 6.2 QuickAdd 단축키 설정

`설정` → `단축키`:

- `QuickAdd: 새 블로그 포스트`: `⌘N`
- `QuickAdd: 아이디어 캡처`: `⌘⇧I`

### 6.3 모바일 빠른 캡처 (Obsidian 모바일 앱)

1. 모바일에서도 QuickAdd 사용 가능
2. 홈 화면에서 `⋮` → `QuickAdd` 선택
3. 자동으로 Git 동기화

---

## 7. 태그 및 메타데이터 관리

### 7.1 태그 전략

#### 카테고리 태그 (1개)
```yaml
tags:
  - 일       # 업무/커리어
  - 사고     # 생각/철학
  - 기술     # 개발/기술
  - 삶       # 일상/라이프스타일
```

#### 보조 태그 (여러 개 가능)
```yaml
tags:
  - 일
  - 스타트업
  - 창업
  - 의사결정
```

### 7.2 메타데이터 필드 확장

표준 frontmatter:
```yaml
---
title: 제목
date: YYYY-MM-DD
tags:
  - 태그1
  - 태그2
status: draft | published
summary: 한 줄 요약 (선택사항)
featured: true | false (선택사항)
series: 시리즈명 (선택사항)
---
```

### 7.3 Tag Wrangler로 태그 관리

1. 태그 패널 열기: `⌘⇧T`
2. 태그 우클릭 → `Rename tag` → 모든 파일에서 일괄 변경
3. 태그 우클릭 → `Search tag` → 해당 태그 포스트만 검색

### 7.4 태그 자동완성 설정

Templater 템플릿에 태그 제안 추가:

```markdown
---
title: <% tp.file.cursor(1) %>
date: <% tp.date.now("YYYY-MM-DD") %>
tags:
  - <% tp.system.suggester(["일", "사고", "기술", "삶"], ["일", "사고", "기술", "삶"]) %>
---
```

---

## 8. 미리보기 및 검증

### 8.1 Linter로 자동 검증

`설정` → `Linter`:

#### 활성화할 규칙:
```
✅ YAML timestamp: 파일 수정 시 자동으로 `updated` 필드 추가
✅ Format tags in YAML: 태그 형식 통일
✅ YAML Title Alignment: Title 필드 정렬
✅ Remove Empty Lines: 빈 줄 제거
✅ Remove Multiple Spaces: 중복 공백 제거
✅ Heading blank lines: 헤딩 전후 빈 줄 추가
✅ Paragraph blank lines: 문단 사이 빈 줄
```

#### 자동 실행 설정:
```
✅ Lint on save: 활성화 (저장 시 자동 정리)
```

### 8.2 발행 전 체크리스트

`/content/templates/publish-checklist.md`:

```markdown
# 발행 전 체크리스트

- [ ] **Frontmatter**
  - [ ] title 입력
  - [ ] date 올바른 형식 (YYYY-MM-DD)
  - [ ] tags 2개 이상 추가
  - [ ] status를 published로 변경

- [ ] **콘텐츠**
  - [ ] 제목 확정
  - [ ] 오타 검토
  - [ ] 문법 확인
  - [ ] 링크 동작 확인

- [ ] **이미지**
  - [ ] 모든 이미지 경로 확인
  - [ ] 이미지 최적화 완료
  - [ ] Alt 텍스트 추가

- [ ] **SEO**
  - [ ] 메타 설명 추가 (summary)
  - [ ] 적절한 헤딩 구조 (H2, H3)

- [ ] **마무리**
  - [ ] Linter 실행
  - [ ] Git commit
  - [ ] Git push
```

### 8.3 미리보기 단축키

- `⌘E`: 편집/미리보기 모드 토글
- `⌘⇧E`: 읽기 모드
- `⌘P`: 명령 팔레트 → "Preview" 검색

---

## 9. 추가 생산성 팁

### 9.1 핵심 단축키 정리

| 단축키 | 기능 | 설명 |
|--------|------|------|
| `⌘N` | QuickAdd: 새 블로그 포스트 | 빠른 포스트 생성 |
| `⌘⇧I` | QuickAdd: 아이디어 캡처 | 아이디어 즉시 기록 |
| `⌘E` | 편집/미리보기 토글 | 실시간 미리보기 |
| `⌘P` | 명령 팔레트 | 모든 명령어 검색 |
| `⌘O` | 빠른 파일 전환 | 파일 검색 및 이동 |
| `⌘⇧F` | 전체 검색 | 볼트 전체 텍스트 검색 |
| `⌘⇧C` | Git: Commit | 변경사항 커밋 |
| `⌘⇧P` | Git: Push | 원격 저장소에 푸시 |
| `⌘/` | 주석 토글 | 선택 영역 주석 처리 |

### 9.2 데일리 노트 활용

블로그 작성 진행상황 기록:

`설정` → `데일리 노트`:
```
Date format: YYYY-MM-DD
New file location: daily/
Template file location: templates/daily-note.md
```

`/content/templates/daily-note.md`:
```markdown
# {{date:YYYY년 M월 D일 (ddd)}}

## 블로그 작업
- [ ]

## 아이디어
-

## 메모
```

### 9.3 워크스페이스 활용

블로그 전용 워크스페이스 저장:

1. 블로그 작업에 최적화된 패널 배치:
   - 왼쪽: 파일 탐색기
   - 중앙: 에디터
   - 오른쪽: 태그 패널, 아웃라인

2. `⌘P` → "Save workspace" → "블로그 작업"으로 저장

3. 다음 작업 시: `⌘P` → "Load workspace" → "블로그 작업"

### 9.4 스니펫 활용

자주 사용하는 마크다운 패턴:

`/content/.obsidian/snippets/` (폴더 생성) → `blog-helper.css`:

```css
/* 초안 상태 표시 */
.frontmatter-container[data-status="draft"] {
    border-left: 3px solid #ff6b6b;
}

/* 발행됨 상태 표시 */
.frontmatter-container[data-status="published"] {
    border-left: 3px solid #51cf66;
}
```

`설정` → `외관` → `CSS snippets` → `blog-helper.css` 활성화

### 9.5 백업 전략

#### 자동 백업 (Obsidian Git)
- 30분마다 자동 커밋 & 푸시
- Git 히스토리로 버전 관리

#### 추가 백업 (선택사항)
1. **iCloud/Dropbox 동기화**
   - `/content/` 폴더를 클라우드 폴더에 심볼릭 링크
   ```bash
   ln -s /Users/williamjung/conductor/workspaces/my-bttrfly/budapest/content ~/Library/Mobile\ Documents/com~apple~CloudDocs/obsidian-backup
   ```

2. **Time Machine** (Mac)
   - 시스템 전체 백업

### 9.6 콘텐츠 재활용

과거 포스트를 쉽게 찾아 링크하기:

#### 방법 1: 내부 링크
```markdown
[[2024-03-24-beginner|초보자가 되는 불편함]]
```

#### 방법 2: Dataview로 관련 포스트 자동 추천

포스트 끝에 추가:
````markdown
## 관련 포스트

```dataview
LIST
FROM "posts"
WHERE contains(tags, this.tags[0]) AND file.name != this.file.name
LIMIT 3
```
````

---

## 빠른 시작 체크리스트

### 초기 설정 (1회)
- [ ] Dataview 플러그인 설치
- [ ] QuickAdd 플러그인 설치
- [ ] Linter 플러그인 설치
- [ ] Paste image rename 플러그인 설치
- [ ] Tag Wrangler 플러그인 설치
- [ ] Calendar 플러그인 설치
- [ ] `/content/templates/` 폴더 생성
- [ ] 블로그 포스트 템플릿 생성
- [ ] Dashboard.md 생성
- [ ] QuickAdd 매크로 설정
- [ ] Obsidian Git 설정 검토
- [ ] 단축키 설정

### 일상 워크플로우
1. **아이디어 생각나면**: `⌘⇧I` → 아이디어 캡처
2. **새 포스트 작성**: `⌘N` → 제목 입력 → 작성
3. **이미지 추가**: 복사 → `⌘V` (자동 저장)
4. **태그 관리**: Tag Wrangler로 일괄 수정
5. **발행 전**: Linter 실행 → 체크리스트 확인
6. **Git 동기화**: 자동 (30분마다) 또는 `⌘⇧C` + `⌘⇧P`

---

## 문제 해결

### Q1: Templater가 작동하지 않아요
- `설정` → `Templater` → `Template folder location` 경로 확인
- 템플릿 파일이 `.md` 확장자인지 확인

### Q2: 이미지가 제대로 표시되지 않아요
- 이미지 경로가 `/public/images/posts/`인지 확인
- 상대 경로 확인: `../../public/images/posts/filename.png`
- Next.js 설정에서 이미지 경로 허용 여부 확인

### Q3: Git 자동 커밋이 안 돼요
- Obsidian Git 플러그인 활성화 확인
- Git 저장소 초기화 확인: `git status`
- 플러그인 설정에서 "Auto backup" 활성화 확인

### Q4: Dataview 쿼리가 작동하지 않아요
- Dataview 플러그인 활성화 확인
- JavaScript Queries 활성화 확인
- 쿼리 문법 확인 (공식 문서: https://blacksmithgu.github.io/obsidian-dataview/)

### Q5: 한글 파일명이 문제가 될까요?
- Git에서 한글 파일명 지원: `git config core.quotepath false`
- 하지만 URL 슬러그는 영문 권장: `YYYY-MM-DD-english-slug.md`

---

## 다음 단계

1. **1주차**: 기본 플러그인 설치 및 템플릿 설정
2. **2주차**: QuickAdd 매크로 익히기, 단축키 습관화
3. **3주차**: Dashboard.md로 콘텐츠 현황 관리
4. **4주차**: 자신만의 워크플로우 최적화

---

**마지막 업데이트**: 2025-12-26
**버전**: 1.0
**작성자**: Claude Code

이 가이드는 지속적으로 업데이트됩니다. 새로운 팁이나 개선사항을 발견하면 추가해주세요!
