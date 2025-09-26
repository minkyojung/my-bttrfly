# Obsidian 블로그 가이드

## 🚀 빠른 시작

### 1. Obsidian 설정
1. Obsidian 앱 다운로드: https://obsidian.md
2. Obsidian 열기 → "Open folder as vault"
3. `/my-bttrfly/content` 폴더 선택
4. 완료! 이제 Obsidian에서 글 작성 가능

### 2. 첫 글 작성
1. Obsidian에서 새 노트 생성 (Cmd/Ctrl + N)
2. 파일명: `2024-01-30-my-post-title.md`
3. 상단에 frontmatter 추가:
```yaml
---
title: "포스트 제목"
date: 2024-01-30
tags: [태그1, 태그2]
---
```
4. 마크다운으로 내용 작성
5. 저장하면 자동으로 블로그에 반영

## 📝 마크다운 문법

### 기본 문법
```markdown
# 제목 1
## 제목 2
### 제목 3

일반 텍스트

**볼드 텍스트**
*이탤릭 텍스트*
~~취소선~~

> 인용구

- 리스트 항목 1
- 리스트 항목 2

1. 순서 리스트 1
2. 순서 리스트 2

[링크 텍스트](https://example.com)
![이미지](image.jpg)
```

### Obsidian 특수 문법
```markdown
[[다른-포스트]]           # 내부 링크
![[image.png]]            # 이미지 삽입
==하이라이트 텍스트==      # 하이라이트

#태그                     # 해시태그
```

## 📁 폴더 구조
```
content/
├── posts/              # 블로그 포스트
│   ├── 2024-01-28-seoul-to-newyork.md
│   ├── 2024-01-29-light-and-shadow.md
│   └── 2024-01-30-coffee-ritual.md
├── attachments/        # 이미지 파일
│   └── photo.jpg
└── pages/             # 정적 페이지 (About 등)
    └── about.md
```

## ✨ Obsidian 고급 기능

### 1. 템플릿 설정
Settings → Core plugins → Templates 활성화
- 템플릿 폴더: `templates/`
- 새 포스트 템플릿 만들기

### 2. Daily Notes
매일 자동으로 날짜 기반 노트 생성
- Settings → Core plugins → Daily notes
- 파일명 형식: `YYYY-MM-DD`

### 3. 태그 관리
- 태그 패널에서 모든 태그 확인
- 클릭으로 태그별 필터링

### 4. 백링크
- 다른 글에서 현재 글 참조 확인
- 자동으로 연결 관계 생성

### 5. 그래프 뷰
- Cmd/Ctrl + G로 그래프 뷰 열기
- 글 간의 연결 시각화

## 🔧 문제 해결

### 포스트가 블로그에 안 보일 때
1. 파일이 `content/posts/` 폴더에 있는지 확인
2. 파일 확장자가 `.md`인지 확인
3. frontmatter (---로 감싼 메타데이터)가 있는지 확인
4. 개발 서버 재시작: `npm run dev`

### 이미지가 안 보일 때
1. 이미지를 `content/attachments/` 폴더에 저장
2. `![[image.png]]` 형식으로 참조
3. 또는 public 폴더에 저장 후 `![alt](/images/image.png)` 사용

### 내부 링크가 작동하지 않을 때
1. 링크할 파일이 실제로 존재하는지 확인
2. 파일명이 정확한지 확인
3. `[[파일명]]` 형식 사용

## 📚 추가 자료
- Obsidian 공식 문서: https://help.obsidian.md
- 마크다운 가이드: https://www.markdownguide.org
- Next.js 문서: https://nextjs.org/docs