# Audio Files

이 폴더에는 블로그 포스트의 오디오 파일들이 저장됩니다.

## 사용 방법

### 1. 오디오 파일 추가

이 폴더(`public/audio/`)에 MP3 파일을 추가하세요:

```bash
# 예시
public/audio/test.mp3
public/audio/my-post.mp3
```

### 2. 포스트에 오디오 연결

블로그 포스트의 frontmatter에 오디오 정보를 추가하세요:

```markdown
---
title: 포스트 제목
date: 2025-01-15
tags:
  - 태그1
audio: /audio/test.mp3
audioTitle: 오디오 제목 (선택사항)
audioArtist: William Jung (선택사항)
---

포스트 내용...
```

### 3. 필드 설명

- `audio`: (필수) 오디오 파일 경로. `/audio/`로 시작해야 합니다.
- `audioTitle`: (선택) AudioPlayer에 표시될 제목. 없으면 포스트 제목 사용
- `audioArtist`: (선택) AudioPlayer에 표시될 아티스트명. 없으면 "William Jung" 사용

## 파일 형식

- 지원 형식: MP3 (권장), WAV, OGG
- 권장 비트레이트: 128kbps (파일 크기와 품질의 균형)
- 파일명: 영문, 숫자, 하이픈(-), 언더스코어(_)만 사용

## 예시

```bash
# 파일 추가
cp ~/my-audio.mp3 public/audio/test.mp3

# Git에 추가
git add public/audio/test.mp3
git commit -m "Add audio for test post"
```

## 주의사항

⚠️ Git 저장소에 직접 추가하면 저장소 크기가 증가합니다.
- 파일이 많아지면 Vercel Blob 같은 외부 스토리지 사용을 고려하세요.
- 큰 파일(10MB 이상)은 Git LFS 사용을 권장합니다.
