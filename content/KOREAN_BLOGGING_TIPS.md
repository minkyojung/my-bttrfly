# 한국어 블로깅을 위한 Obsidian 최적화 팁

Obsidian으로 한국어 블로그를 작성할 때 유용한 팁과 트릭 모음입니다.

---

## 1. 한글 파일명 vs 영문 슬러그

### 문제점
- 한글 파일명은 URL에서 인코딩됨 (`%ED%95%9C%EA%B8%80`)
- SEO에 불리함
- 일부 시스템에서 호환성 문제

### 추천 방법: 하이브리드 접근

**파일명**: 영문 슬러그 사용
```
2024-03-24-beginner.md
2024-07-17-10-principles.md
```

**Frontmatter title**: 한글 제목
```yaml
---
title: 계속해서 초보자가 되는 불편함
date: 2024-03-24
---
```

**결과**:
- URL: `example.com/blog/2024-03-24-beginner` (SEO 친화적)
- 표시: "계속해서 초보자가 되는 불편함" (한글 제목)
- Obsidian: Front Matter Title 플러그인으로 한글 제목 표시

### 슬러그 생성 팁

**한글 → 영문 슬러그 변환 규칙**:
- 의미 기반 번역: "초보자" → "beginner"
- 핵심 단어만: "복잡한 세상에서 명확하게 사고하는 방법" → "clear-thinking"
- 번호 활용: "10가지 원칙" → "10-principles"

**Templater 템플릿에 슬러그 프롬프트 추가**:
```markdown
<%*
const title = await tp.system.prompt("한글 제목:");
const slug = await tp.system.prompt("영문 슬러그 (예: clear-thinking):");
const date = tp.date.now("YYYY-MM-DD");
await tp.file.rename(`${date}-${slug}`);
-%>
---
title: <%= title %>
date: <%= date %>
slug: <%= slug %>
---
```

---

## 2. 한글 타이핑 최적화

### 2.1 자주 사용하는 한글 표현 스니펫

Text Expander 스타일 (QuickAdd 사용):

```
// 자주 쓰는 표현들
ㄱㅅ → 감사합니다
ㅇㅇ → 이러한
ㄷㅇ → 다음과 같은
```

### 2.2 한글 마크다운 서식

**강조 사용 팁**:
```markdown
**강조할 내용**은 이렇게  (띄어쓰기 중요!)
*기울임*도 마찬가지

// 잘못된 예 (띄어쓰기 없음)
**강조**는 작동하지만 가독성이 떨어짐
```

**따옴표 스타일**:
```markdown
한글에서는 겹따옴표("")와 홑따옴표('')를 혼용
> 인용문은 블록쿼트 사용
```

---

## 3. 한글 검색 최적화

### 3.1 동의어 태그 전략

```yaml
---
title: 스타트업에서 일하기
tags:
  - 일
  - 스타트업
  - 창업
  - 벤처
  - startup  # 영문 태그 병기
aliases:
  - 스타트업 생활
  - 스타트업 문화
---
```

**검색할 때**:
- "스타트업" 검색 → 관련 포스트 모두 검색됨
- aliases 덕분에 "스타트업 생활" 검색도 가능

### 3.2 Dataview로 한글 검색

```dataview
TABLE title, tags
FROM "posts"
WHERE contains(title, "스타트업") OR contains(tags, "스타트업")
```

---

## 4. 한글 폰트 최적화 (Obsidian 표시용)

### 4.1 CSS 스니펫으로 폰트 변경

`/content/.obsidian/snippets/korean-font.css` 생성:

```css
/* 한글 가독성 최적화 */
body {
  --font-text: 'Pretendard', 'Apple SD Gothic Neo', sans-serif;
  --font-text-size: 16px;
  line-height: 1.8;
}

/* 에디터 폰트 */
.cm-s-obsidian {
  font-family: 'Pretendard', 'Apple SD Gothic Neo', monospace;
  font-size: 16px;
  line-height: 1.8;
}

/* 미리보기 폰트 */
.markdown-preview-view {
  font-family: 'Pretendard', 'Apple SD Gothic Neo', sans-serif;
  font-size: 16px;
  line-height: 1.8;
}

/* 제목 폰트 크기 조정 */
.markdown-preview-view h1 {
  font-size: 2em;
  font-weight: 700;
  margin-top: 1.5em;
}

.markdown-preview-view h2 {
  font-size: 1.6em;
  font-weight: 600;
  margin-top: 1.3em;
}

.markdown-preview-view h3 {
  font-size: 1.3em;
  font-weight: 600;
  margin-top: 1.2em;
}
```

**활성화**:
1. `설정` → `외관` → `CSS snippets`
2. `korean-font.css` 옆 토글 활성화

### 4.2 추천 한글 폰트

**무료 폰트**:
- **Pretendard**: 현대적, 가독성 좋음 (추천!)
- **Noto Sans KR**: Google Fonts, 안정적
- **Spoqa Han Sans Neo**: 깔끔한 디자인

**설치 방법**:
1. 폰트 다운로드 (Google Fonts)
2. 시스템에 설치
3. CSS 스니펫에서 폰트명 변경

---

## 5. 한글 콘텐츠 관리 전략

### 5.1 카테고리 체계 (한글)

```yaml
# 메인 카테고리 (1개만 선택)
tags:
  - 일        # 업무, 커리어, 스타트업
  - 사고      # 생각, 철학, 의사결정
  - 기술      # 개발, IT, 도구
  - 삶        # 일상, 라이프스타일, 취미

# 서브 카테고리 (여러 개 가능)
  - 스타트업
  - 의사결정
  - 성장
```

### 5.2 Dashboard 한글화

```dataview
TABLE
  title as "제목",
  date as "작성일",
  tags as "태그",
  choice(status = "published", "✅ 발행", "📝 작성중") as "상태"
FROM "posts"
SORT date DESC
LIMIT 10
```

### 5.3 작성 진행 상황 추적

```yaml
---
title: 제목
date: 2024-03-24
tags: [일]
status: draft
진행도: 30%
예상_독자: 스타트업 메이커
핵심_메시지: 초보자가 되는 것을 두려워하지 말자
---
```

**Dashboard에서 활용**:
```dataview
TABLE
  title as "제목",
  진행도,
  예상_독자 as "타겟 독자",
  핵심_메시지 as "메시지"
FROM "posts"
WHERE status = "draft"
SORT 진행도 DESC
```

---

## 6. 한글 맞춤법 및 퇴고

### 6.1 외부 도구 연동

**추천 도구**:
1. **부산대 맞춤법 검사기**: https://speller.cs.pusan.ac.kr/
2. **네이버 맞춤법 검사기**: https://search.naver.com/search.naver?where=nexearch&query=맞춤법+검사기

**워크플로우**:
1. Obsidian에서 본문 복사
2. 맞춤법 검사기에 붙여넣기
3. 수정 사항 확인
4. Obsidian에서 수정

### 6.2 자주 틀리는 표현 체크리스트

퇴고 시 확인할 항목:

```markdown
- [ ] 되/돼 구분 (되어 → 돼, 하게 되다 → 되다)
- [ ] -ㄴ데/-는데 구분
- [ ] 웬/왠 구분 (웬일이야 / 왠지)
- [ ] 안/않 구분 (안 하다 / 하지 않다)
- [ ] 띄어쓰기 (만큼, 대로, 뿐)
```

### 6.3 Linter 규칙 (한글 최적화)

`설정` → `Linter`:

```
✅ Remove Multiple Spaces: 중복 공백 제거
✅ Remove Empty Lines: 불필요한 빈 줄 제거
✅ Paragraph blank lines: 문단 간 빈 줄 추가
✅ Heading blank lines: 제목 전후 빈 줄
```

---

## 7. 한글 콘텐츠 SEO

### 7.1 Frontmatter SEO 필드

```yaml
---
title: 계속해서 초보자가 되는 불편함
date: 2024-03-24
slug: beginner
tags: [일, 스타트업]
summary: 스타트업에서 일하며 계속 초보자가 되는 상황과 이를 즐기는 방법
keywords:
  - 스타트업
  - 초보자
  - 성장
  - 커리어
featured: true
---
```

### 7.2 한글 키워드 최적화

**제목 작성 팁**:
```
✅ 구체적: "10가지 방법" (숫자 포함)
✅ 궁금증 유발: "왜 초보자가 되어야 할까?"
✅ 실용적: "스타트업에서 살아남는 법"
```

**본문 키워드 배치**:
- 첫 문단에 핵심 키워드 포함
- H2, H3 제목에 키워드 자연스럽게 배치
- 키워드 밀도: 전체 글의 1-2%

---

## 8. 한글 콘텐츠 재활용

### 8.1 시리즈 기획

```yaml
# 첫 포스트
---
title: 스타트업 생존기 #1 - 시작
series: 스타트업 생존기
series_order: 1
---

# 두 번째 포스트
---
title: 스타트업 생존기 #2 - 성장
series: 스타트업 생존기
series_order: 2
---
```

**Dataview로 시리즈 자동 정리**:
```dataview
TABLE
  title as "제목",
  series_order as "순서",
  date as "날짜"
FROM "posts"
WHERE series = "스타트업 생존기"
SORT series_order ASC
```

### 8.2 주제별 묶음

```dataview
TABLE
  title as "제목",
  date as "날짜"
FROM "posts"
WHERE contains(tags, "스타트업") AND contains(tags, "성장")
SORT date DESC
```

---

## 9. 모바일 작성 (한글)

### 9.1 Obsidian 모바일 설정

**iOS/Android 앱 설치**:
1. App Store / Play Store에서 "Obsidian" 검색
2. 동일한 볼트 동기화 (iCloud / Obsidian Sync)

**모바일 최적화 팁**:
- 큰 폰트 크기 사용 (18px)
- 단축키 대신 커맨드 팔레트 활용
- QuickAdd 매크로로 빠른 캡처

### 9.2 모바일에서 아이디어 캡처

**워크플로우**:
1. 모바일에서 Obsidian 열기
2. 커맨드 팔레트 (`⋮`) → "QuickAdd: 아이디어 캡처"
3. 제목 + 내용 간단히 입력
4. 자동으로 Git 동기화 (Obsidian Git)
5. PC에서 나중에 확장하여 포스트 작성

---

## 10. 한글 블로그 글쓰기 템플릿

### 10.1 스토리텔링 템플릿

`/content/templates/storytelling.md`:

```markdown
---
title: <% tp.file.cursor(1) %>
date: <% tp.date.now("YYYY-MM-DD") %>
tags:
  - <% tp.file.cursor(2) %>
status: draft
---

## 도입 (Hook)
<!-- 독자의 관심을 끄는 일화, 질문, 통계 -->

<% tp.file.cursor(3) %>

## 문제 제기
<!-- 이 글을 왜 읽어야 하는가? -->

## 본론
### 포인트 1

### 포인트 2

### 포인트 3

## 결론
<!-- 핵심 메시지 요약 -->

## 행동 제안
<!-- 독자가 다음에 할 수 있는 일 -->

---
**키워드**: <% tp.file.cursor(4) %>
**예상 독자**:
**핵심 메시지**:
```

### 10.2 리스트형 템플릿 (N가지 방법)

`/content/templates/list-post.md`:

```markdown
---
title: <% tp.file.cursor(1) %>
date: <% tp.date.now("YYYY-MM-DD") %>
tags:
  - <% tp.file.cursor(2) %>
status: draft
---

<!-- 예: "명확하게 사고하는 10가지 방법" -->

<% tp.file.cursor(3) %>

## 1. [첫 번째 방법]

## 2. [두 번째 방법]

## 3. [세 번째 방법]

<!-- 필요한 만큼 추가 -->

## 마무리

---
**참고 자료**:
-
```

### 10.3 경험 공유 템플릿

`/content/templates/experience.md`:

```markdown
---
title: <% tp.file.cursor(1) %>
date: <% tp.date.now("YYYY-MM-DD") %>
tags:
  - <% tp.file.cursor(2) %>
status: draft
---

## 배경
<!-- 어떤 상황이었나? -->

<% tp.file.cursor(3) %>

## 문제
<!-- 무엇이 어려웠나? -->

## 해결 과정
<!-- 어떻게 접근했나? -->

## 배운 점
<!-- 무엇을 얻었나? -->

## 적용 방법
<!-- 다른 사람은 어떻게 활용할 수 있나? -->

---
**관련 경험**:
**추천 대상**:
```

---

## 11. 한글 블로그 성장 추적

### 11.1 작성 목표 설정

`/content/목표.md`:

```markdown
# 2024년 블로그 목표

## 양적 목표
- [ ] 주 1회 발행 (연 52개)
- [ ] 평균 글자 수: 1500자 이상

## 질적 목표
- [ ] 핵심 메시지 명확히
- [ ] 실용적인 조언 포함
- [ ] 개인 경험 기반

## 진행 상황

\```dataview
TABLE
  length(rows) as "발행 수"
FROM "posts"
WHERE date >= date("2024-01-01") AND status = "published"
GROUP BY dateformat(date, "yyyy-MM")
\```
```

### 11.2 독자 피드백 추적

```yaml
---
title: 제목
feedback:
  - source: 디스콰이엇
    comment: 공감했어요
    date: 2024-03-25
  - source: 이메일
    comment: 좋은 글 감사합니다
    date: 2024-03-26
---
```

---

## 12. 빠른 참조: 한글 마크다운 문법

```markdown
# 제목 1
## 제목 2
### 제목 3

**굵게**
*기울임*
~~취소선~~

> 인용문
> 여러 줄 가능

- 순서 없는 목록
  - 하위 항목

1. 순서 있는 목록
2. 두 번째

[링크 텍스트](URL)
![이미지 설명](경로)

`인라인 코드`

\```javascript
// 코드 블록
const example = "한글도 가능";
\```

| 표 | 헤더 |
|----|------|
| 셀 | 내용 |

---

- [ ] 체크박스
- [x] 완료 항목
```

---

## 마무리

이 가이드를 활용하면 한글 블로그를 Obsidian에서 효율적으로 관리할 수 있습니다.

**추천 워크플로우**:
1. 아이디어는 모바일에서 빠르게 캡처
2. PC에서 본격 작성 (템플릿 활용)
3. 맞춤법 검사 후 퇴고
4. Dashboard로 진행 상황 추적
5. 발행 전 체크리스트 확인
6. Git 자동 동기화

**성공적인 한글 블로그 작성을 응원합니다!**
