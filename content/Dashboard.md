# 블로그 관리 대시보드

## 📊 통계

```dataview
TABLE
  length(rows) as "포스트 수"
FROM "posts"
GROUP BY file.folder
```

**총 포스트 수**: `$= dv.pages('"posts"').length` 개

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

---

## 📏 글자 수별 포스트 (Top 10)

```dataview
TABLE
  title as "제목",
  date as "날짜",
  length(file.content) as "글자 수"
FROM "posts"
SORT length(file.content) DESC
LIMIT 10
```

---

**마지막 업데이트**: `$= dv.date("now")`
