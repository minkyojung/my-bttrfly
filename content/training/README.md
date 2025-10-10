# Training Knowledge Base

이 폴더는 AI 학습 전용 콘텐츠를 저장합니다.

## 구조

- **용도**: RAG 임베딩 생성 (Supabase에 저장)
- **표시**: 페이지 좌측 영역에 표시되지 않음
- **검색**: AI 답변 생성 시 검색 대상에 포함됨

## 파일 형식

```markdown
---
title: "제목"
type: "training"
visibility: "private"
category: "decision-making" # 또는 "technical", "philosophy", "experience" 등
priority: "high"  # 검색 가중치 (high, medium, low)
date: "2024-01-01"
tags: ["tag1", "tag2"]
---

# 내용

마크다운 형식으로 작성
```

## 카테고리 가이드

- `decision-making`: 의사결정 방식, 원칙
- `technical`: 기술적 지식, 개발 경험
- `philosophy`: 삶의 철학, 가치관
- `experience`: 개인 경험, 일화
- `learning`: 학습 방법, 성장 과정

## 사용 방법

1. 이 폴더에 `.md` 파일 추가
2. 터미널에서 `npm run embeddings` 실행
3. Supabase에 자동으로 임베딩 생성 및 저장
4. AI가 자동으로 이 콘텐츠를 학습하여 답변에 활용

## 주의사항

- frontmatter는 필수가 아니지만, 추가하면 검색 정확도 향상
- 민감한 개인정보는 포함하지 마세요
- 파일명은 자유롭게 작성 가능 (예: `my-thoughts-on-ai.md`)
