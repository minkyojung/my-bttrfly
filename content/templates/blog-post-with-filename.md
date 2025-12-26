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
