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
