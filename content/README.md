# Obsidian 블로그 워크플로우 완벽 가이드

CMS 없이 Obsidian만으로 블로그를 관리하는 완벽한 시스템입니다.

---

## 빠른 시작

### 1. 처음 시작하시나요?
👉 **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - 30분 안에 완벽한 설정 완료

### 2. 빠른 참조가 필요하신가요?
👉 **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - 단축키, 명령어, 자주 쓰는 패턴

### 3. 상세 가이드가 필요하신가요?
👉 **[OBSIDIAN_BLOG_WORKFLOW.md](./OBSIDIAN_BLOG_WORKFLOW.md)** - 전체 워크플로우 설명

---

## 📚 문서 구조

### 필수 문서
| 문서 | 설명 | 난이도 |
|------|------|--------|
| [SETUP_GUIDE.md](./SETUP_GUIDE.md) | 초기 설정 단계별 가이드 | ⭐ 초급 |
| [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) | 빠른 참조 치트시트 | ⭐ 초급 |
| [OBSIDIAN_BLOG_WORKFLOW.md](./OBSIDIAN_BLOG_WORKFLOW.md) | 완벽한 워크플로우 가이드 | ⭐⭐ 중급 |

### 고급 문서
| 문서 | 설명 | 난이도 |
|------|------|--------|
| [ADVANCED_DATAVIEW_EXAMPLES.md](./ADVANCED_DATAVIEW_EXAMPLES.md) | Dataview 활용 예제 모음 | ⭐⭐⭐ 고급 |
| [KOREAN_BLOGGING_TIPS.md](./KOREAN_BLOGGING_TIPS.md) | 한글 블로그 최적화 팁 | ⭐⭐ 중급 |

### 작업 파일
| 파일 | 용도 |
|------|------|
| [Dashboard.md](./Dashboard.md) | 블로그 관리 대시보드 |
| [templates/](./templates/) | 블로그 포스트 템플릿 모음 |
| [posts/](./posts/) | 실제 블로그 포스트 저장소 |

---

## 🎯 추천 학습 경로

### 1단계: 초기 설정 (30분)
1. ✅ [SETUP_GUIDE.md](./SETUP_GUIDE.md) 읽고 플러그인 설치
2. ✅ 첫 테스트 포스트 작성
3. ✅ Dashboard.md 확인

### 2단계: 워크플로우 익히기 (1주일)
1. ✅ [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)의 단축키 암기
2. ✅ 매일 아이디어 캡처 연습 (`⌘⇧I`)
3. ✅ 주 1회 포스트 작성 목표

### 3단계: 고급 기능 활용 (2-4주)
1. ✅ [ADVANCED_DATAVIEW_EXAMPLES.md](./ADVANCED_DATAVIEW_EXAMPLES.md)에서 원하는 쿼리 복사
2. ✅ Dashboard 커스터마이징
3. ✅ 본인만의 템플릿 생성

### 4단계: 최적화 (지속적)
1. ✅ [KOREAN_BLOGGING_TIPS.md](./KOREAN_BLOGGING_TIPS.md)로 한글 최적화
2. ✅ 작성 루틴 확립
3. ✅ 월 1회 Dashboard로 회고

---

## 🚀 핵심 기능

### 1. 빠른 포스트 생성
- **단축키**: `⌘N`
- **결과**: 자동으로 템플릿 적용, 파일명 생성, frontmatter 설정

### 2. 아이디어 캡처
- **단축키**: `⌘⇧I`
- **결과**: 즉시 아이디어를 `ideas.md`에 기록

### 3. 자동 Git 동기화
- **자동**: 30분마다 자동 커밋 & 푸시
- **수동**: `⌘⇧C` + `⌘⇧P`

### 4. 이미지 자동 처리
- **방법**: 이미지 복사 후 `⌘V`
- **결과**: 자동으로 `/public/images/posts/`에 저장, 경로 생성

### 5. 콘텐츠 대시보드
- **파일**: [Dashboard.md](./Dashboard.md)
- **기능**: 통계, 초안 관리, 태그 분석, 월별 현황

---

## 📋 체크리스트

### 초기 설정 완료 확인
- [ ] Dataview 플러그인 설치 및 활성화
- [ ] QuickAdd 플러그인 설치 및 매크로 설정
- [ ] Templater 폴더 템플릿 설정
- [ ] Obsidian Git 자동 백업 설정
- [ ] 이미지 자동 저장 경로 설정
- [ ] 단축키 설정 (`⌘N`, `⌘⇧I`, `⌘⇧C`, `⌘⇧P`)

### 일상 워크플로우
- [ ] 매일: 아이디어 떠오르면 즉시 캡처 (`⌘⇧I`)
- [ ] 주 1회: 새 포스트 작성 (`⌘N`)
- [ ] 주 1회: Dashboard 확인
- [ ] 월 1회: 통계 리뷰 및 목표 점검

---

## 🛠️ 설치된 플러그인

| 플러그인 | 용도 | 우선순위 |
|----------|------|----------|
| **Templater** | 동적 템플릿 | ⭐⭐⭐ 필수 |
| **Dataview** | 콘텐츠 관리 대시보드 | ⭐⭐⭐ 필수 |
| **QuickAdd** | 빠른 포스트 생성 | ⭐⭐⭐ 필수 |
| **Obsidian Git** | 자동 백업 & 동기화 | ⭐⭐⭐ 필수 |
| **Linter** | 마크다운 자동 정리 | ⭐⭐ 추천 |
| **Paste image rename** | 이미지 자동 처리 | ⭐⭐⭐ 필수 |
| **Tag Wrangler** | 태그 일괄 관리 | ⭐⭐ 추천 |
| **Calendar** | 포스팅 일정 시각화 | ⭐ 선택 |
| **Front Matter Title** | 파일명 대신 제목 표시 | ⭐⭐ 추천 |

---

## 🗂️ 폴더 구조

```
/content/
├── .obsidian/              # Obsidian 설정
│   ├── plugins/           # 설치된 플러그인
│   └── snippets/          # CSS 커스터마이징
│
├── templates/              # 템플릿 모음
│   ├── blog-post.md       # 기본 블로그 포스트
│   ├── blog-post-with-filename.md  # 파일명 자동 생성
│   ├── draft.md           # 초안 템플릿
│   ├── daily-note.md      # 데일리 노트
│   └── publish-checklist.md  # 발행 체크리스트
│
├── posts/                  # 블로그 포스트
│   ├── 2024-03-24-beginner.md
│   ├── 2024-07-17-10-principles.md
│   └── ideas.md           # 아이디어 메모
│
├── Dashboard.md            # 관리 대시보드
├── README.md              # 이 파일
├── SETUP_GUIDE.md         # 초기 설정 가이드
├── QUICK_REFERENCE.md     # 빠른 참조
├── OBSIDIAN_BLOG_WORKFLOW.md  # 상세 워크플로우
├── ADVANCED_DATAVIEW_EXAMPLES.md  # 고급 예제
├── KOREAN_BLOGGING_TIPS.md  # 한글 블로그 팁
└── intro.md               # 소개 페이지
```

---

## 💡 자주 묻는 질문 (FAQ)

### Q1: 플러그인을 꼭 다 설치해야 하나요?
**A**: 필수 플러그인은 Templater, Dataview, QuickAdd, Obsidian Git, Paste image rename입니다. 나머지는 선택사항입니다.

### Q2: 모바일에서도 사용할 수 있나요?
**A**: 네! Obsidian 모바일 앱을 설치하고 동일한 볼트를 동기화하면 됩니다. QuickAdd 매크로도 모바일에서 작동합니다.

### Q3: Git을 모르는데 괜찮나요?
**A**: 네! Obsidian Git 플러그인이 자동으로 처리해줍니다. 단축키만 알면 됩니다.

### Q4: 한글 파일명을 써도 되나요?
**A**: 파일명은 영문 슬러그를 권장합니다. Frontmatter의 `title`에 한글 제목을 넣으세요. [KOREAN_BLOGGING_TIPS.md](./KOREAN_BLOGGING_TIPS.md) 참조.

### Q5: Dataview가 너무 복잡해요
**A**: [ADVANCED_DATAVIEW_EXAMPLES.md](./ADVANCED_DATAVIEW_EXAMPLES.md)에서 원하는 쿼리를 복사해서 사용하세요. 이해할 필요 없이 복사만 하면 됩니다.

### Q6: 템플릿을 커스터마이징하고 싶어요
**A**: `/content/templates/` 폴더의 파일을 직접 수정하면 됩니다.

---

## 🎓 추가 학습 자료

### Obsidian 공식
- [Obsidian 공식 문서](https://help.obsidian.md/)
- [Obsidian 포럼](https://forum.obsidian.md/)
- [Discord 커뮤니티](https://discord.gg/obsidianmd)

### 플러그인 문서
- [Dataview 문서](https://blacksmithgu.github.io/obsidian-dataview/)
- [Templater 문서](https://silentvoid13.github.io/Templater/)
- [QuickAdd 문서](https://github.com/chhoumann/quickadd)

### 한글 커뮤니티
- [Obsidian 한국 사용자 모임](https://www.facebook.com/groups/obsidiankorea)
- [생산성 커뮤니티](https://disquiet.io/)

---

## 🔄 업데이트 로그

### v1.0 (2025-12-26)
- ✅ 초기 가이드 작성
- ✅ 템플릿 6종 생성
- ✅ Dashboard 설정
- ✅ Dataview 예제 40개 추가
- ✅ 한글 블로그 최적화 가이드

---

## 📞 도움말

문제가 생기거나 질문이 있으면:
1. 각 가이드의 "문제 해결" 섹션 확인
2. [SETUP_GUIDE.md](./SETUP_GUIDE.md)의 "문제 해결" 참조
3. Obsidian 공식 포럼 검색

---

## 📝 피드백

이 가이드를 개선할 아이디어가 있으시면:
- GitHub Issue 생성
- 직접 수정 후 Pull Request
- 커뮤니티에 공유

---

**이 워크플로우로 멋진 블로그를 만들어보세요!** 🚀

---

**버전**: 1.0
**작성일**: 2025-12-26
**라이선스**: MIT
**작성자**: Claude Code
