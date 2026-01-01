# Obsidian 블로그 워크플로우 - 초기 설정 가이드

이 가이드는 30분 안에 완벽한 블로그 워크플로우를 구축하는 단계별 지침입니다.

---

## 사전 준비

- ✅ Obsidian 설치됨
- ✅ `/content/` 폴더가 Obsidian 볼트로 설정됨
- ✅ Git 저장소 연결됨

---

## 1단계: 핵심 플러그인 설치 (10분)

### 1.1 커뮤니티 플러그인 활성화

1. Obsidian 실행
2. `설정` (⌘,) 열기
3. 왼쪽 메뉴에서 `커뮤니티 플러그인` 선택
4. `제한 모드 끄기` 클릭
5. `찾아보기` 클릭

### 1.2 필수 플러그인 설치

아래 플러그인을 검색하여 **순서대로** 설치하세요:

#### 1) Dataview ⭐⭐⭐
- 검색: "Dataview"
- 설치 후 활성화
- 설정:
  - `Enable JavaScript Queries`: ✅ 활성화
  - `Enable Inline Queries`: ✅ 활성화

#### 2) QuickAdd ⭐⭐⭐
- 검색: "QuickAdd"
- 설치 후 활성화
- (설정은 나중에)

#### 3) Linter ⭐⭐
- 검색: "Linter"
- 설치 후 활성화
- 설정:
  - `YAML Title Alignment`: ✅
  - `Format Tags in YAML`: ✅
  - `Remove Empty Lines`: ✅
  - `Lint on save`: ✅ (저장 시 자동 정리)

#### 4) Paste image rename ⭐⭐⭐
- 검색: "Paste image rename"
- 설치 후 활성화
- 설정:
  - `Image name pattern`: `{{fileName}}-{{DATE:YYYYMMDDHHmmss}}`
  - `Image folder path`: `../public/images/posts`
  - `Handle all attachments`: ✅

#### 5) Tag Wrangler ⭐⭐
- 검색: "Tag Wrangler"
- 설치 후 활성화

#### 6) Calendar
- 검색: "Calendar"
- 설치 후 활성화
- 설정:
  - `Default date format`: `YYYY-MM-DD`
  - `Show week number`: ✅

#### 7) Front Matter Title
- 검색: "Front Matter Title"
- 설치 후 활성화

---

## 2단계: Templater 설정 (5분)

### 2.1 Templater 기본 설정

1. `설정` → `Templater` (왼쪽 메뉴)
2. 아래 항목 설정:

```
Template folder location: templates
Trigger Templater on new file creation: ✅
Enable folder templates: ✅
```

### 2.2 폴더 템플릿 연결

`Folder Templates` 섹션에서:

1. `Add New` 클릭
2. **Folder**: `posts` 입력
3. **Template**: `templates/blog-post.md` 선택
4. `Add` 클릭

이제 `posts/` 폴더에 새 파일을 만들면 자동으로 템플릿이 적용됩니다!

---

## 3단계: QuickAdd 매크로 설정 (10분)

### 3.1 새 블로그 포스트 매크로

1. `설정` → `QuickAdd`
2. `Manage Macros` 탭 선택
3. 아래 단계 따라하기:

**매크로 생성:**
1. 상단 입력창에 "새 블로그 포스트" 입력
2. `Add Macro` 클릭
3. 방금 생성된 매크로 옆 `Configure` 클릭

**매크로 설정:**
1. `Add Choice` → `Template` 선택
2. Template path: `templates/blog-post-with-filename.md` 선택
3. File Name Format: `{{VALUE:제목}}`
4. Folder: `posts/`
5. `Add` 클릭

**단축키 설정:**
1. `설정` → `단축키` (Hotkeys)
2. 검색창에 "QuickAdd: 새 블로그 포스트" 입력
3. 단축키 설정: `⌘N`

### 3.2 아이디어 캡처 매크로 (선택사항)

1. `설정` → `QuickAdd` → `Manage Macros`
2. 상단 입력창에 "아이디어 캡처" 입력
3. `Add Macro` 클릭
4. `Configure` 클릭

**설정:**
1. `Add Choice` → `Capture` 선택
2. Capture format:
   ```markdown
   ## {{DATE:HH:mm}} - {{VALUE:제목}}

   {{VALUE:내용}}

   ---
   ```
3. `Capture to`: `posts/ideas.md` (파일이 자동 생성됨)
4. `Insert after`: `## 아이디어 리스트`
5. `Add` 클릭

**단축키:**
- `설정` → `단축키` → "QuickAdd: 아이디어 캡처" → `⌘⇧I`

---

## 4단계: Obsidian Git 최적화 (3분)

1. `설정` → `Obsidian Git`
2. 아래 설정 확인/변경:

```
✅ Vault backup interval (minutes): 30
✅ Auto pull interval (minutes): 10
✅ Commit message: content: {{date}} - {{numFiles}} files
✅ Date placeholder format: YYYY-MM-DD HH:mm:ss
✅ Pull updates on startup: ✅
✅ Push on backup: ✅
✅ Show status bar: ✅
```

### Git 단축키 설정

`설정` → `단축키`:

| 명령어 | 단축키 |
|--------|--------|
| `Obsidian Git: Commit all changes` | `⌘⇧C` |
| `Obsidian Git: Push` | `⌘⇧P` |
| `Obsidian Git: Pull` | `⌘⇧L` |

---

## 5단계: 생산성 단축키 설정 (2분)

`설정` → `단축키`에서 아래 항목들도 설정:

| 명령어 | 추천 단축키 |
|--------|-------------|
| `Toggle editing/reading view` | `⌘E` (기본값) |
| `Open command palette` | `⌘P` (기본값) |
| `Quick switcher` | `⌘O` (기본값) |
| `Search in all files` | `⌘⇧F` (기본값) |
| `Toggle left sidebar` | `⌘B` |
| `Toggle right sidebar` | `⌘⇧B` |

---

## 6단계: 작업 공간 설정 (선택사항, 3분)

### 6.1 이상적인 레이아웃

**왼쪽 사이드바:**
- 파일 탐색기
- 태그 패널

**중앙:**
- 에디터 (메인 작업 공간)

**오른쪽 사이드바:**
- 아웃라인
- 백링크

### 6.2 워크스페이스 저장

1. 원하는 레이아웃으로 패널 배치
2. `⌘P` → "Workspace: Save current workspace" 입력
3. 이름: "블로그 작업" 입력
4. Enter

**다음부터:**
- `⌘P` → "Workspace: Load workspace" → "블로그 작업" 선택

---

## 7단계: 테스트 (5분)

### 7.1 첫 블로그 포스트 만들기

1. `⌘N` (QuickAdd 실행)
2. 제목: "테스트 포스트" 입력
3. 슬러그: "test-post" 입력
4. 태그: "일" 입력
5. 본문에 간단한 내용 작성

### 7.2 이미지 테스트

1. 아무 이미지 복사 (스크린샷 등)
2. 에디터에서 `⌘V`
3. 이미지가 `/public/images/posts/`에 저장되는지 확인
4. 마크다운 경로가 자동 생성되는지 확인

### 7.3 Dashboard 확인

1. `Dashboard.md` 파일 열기
2. Dataview 쿼리가 작동하는지 확인
3. 방금 만든 테스트 포스트가 보이는지 확인

### 7.4 Git 동기화 테스트

1. `⌘⇧C` (Commit)
2. `⌘⇧P` (Push)
3. GitHub에서 커밋 확인

---

## 완료 체크리스트

- [ ] Dataview 설치 및 활성화
- [ ] QuickAdd 설치 및 매크로 설정
- [ ] Linter 설치 및 활성화
- [ ] Paste image rename 설정
- [ ] Tag Wrangler 설치
- [ ] Calendar 설치
- [ ] Templater 폴더 템플릿 설정
- [ ] QuickAdd 단축키 (`⌘N`) 설정
- [ ] Git 단축키 설정
- [ ] 테스트 포스트 작성 성공
- [ ] 이미지 업로드 테스트 성공
- [ ] Dashboard.md 작동 확인
- [ ] Git 동기화 테스트 성공

---

## 다음 단계

### 즉시 시작할 수 있는 것들

1. **Dashboard.md 커스터마이징**
   - `ADVANCED_DATAVIEW_EXAMPLES.md` 참조
   - 본인의 필요에 맞는 쿼리 추가

2. **태그 체계 정립**
   - 카테고리 태그: 일, 사고, 기술, 삶
   - 보조 태그: 자유롭게 추가

3. **첫 실제 포스트 작성**
   - `⌘N` → 제목 입력 → 작성 시작
   - 발행 전 `publish-checklist.md` 참조

4. **작성 루틴 만들기**
   - 매주 특정 요일에 작성 시간 확보
   - Dashboard로 진행 상황 추적

---

## 문제 해결

### Dataview가 작동하지 않아요
- `설정` → `Dataview` → JavaScript Queries 활성화 확인
- Obsidian 재시작

### QuickAdd 매크로가 실행되지 않아요
- `설정` → `QuickAdd` → 매크로 설정 재확인
- 템플릿 파일 경로 확인

### 이미지가 저장되지 않아요
- Paste image rename 플러그인 활성화 확인
- 경로 설정: `../public/images/posts`
- `/public/images/posts/` 폴더가 존재하는지 확인

### Git 자동 커밋이 안 돼요
- Obsidian Git 플러그인 활성화 확인
- 설정에서 "Vault backup interval" 확인
- 터미널에서 `git status` 실행해보기

---

## 추가 리소스

- **상세 가이드**: `OBSIDIAN_BLOG_WORKFLOW.md`
- **빠른 참조**: `QUICK_REFERENCE.md`
- **고급 Dataview**: `ADVANCED_DATAVIEW_EXAMPLES.md`

---

## 도움이 필요하신가요?

Obsidian 공식 포럼: https://forum.obsidian.md/
Discord 커뮤니티: https://discord.gg/obsidianmd

---

**설정 완료 시간**: 약 30-40분
**난이도**: 초급-중급
**업데이트**: 2025-12-26

이 가이드를 완료하셨다면, 이제 CMS 없이 Obsidian만으로 블로그를 효율적으로 관리할 수 있습니다!
