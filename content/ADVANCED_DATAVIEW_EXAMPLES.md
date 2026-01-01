# Dataview 고급 활용 예제

이 문서는 블로그 관리를 위한 실용적인 Dataview 쿼리 모음입니다.

---

## 1. 콘텐츠 분석

### 1.1 작성 패턴 분석 - 요일별

````markdown
## 📈 요일별 작성 빈도

```dataviewjs
const posts = dv.pages('"posts"')
  .where(p => p.date)
  .groupBy(p => {
    const date = new Date(p.date);
    const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    return days[date.getDay()];
  });

dv.table(
  ["요일", "포스트 수", "비율"],
  posts.map(p => [
    p.key,
    p.rows.length,
    `${Math.round(p.rows.length / dv.pages('"posts"').length * 100)}%`
  ])
  .sort((a, b) => b[1] - a[1])
);
```
````

### 1.2 월별 생산성 추이

````markdown
## 📊 월별 포스팅 추이

```dataview
TABLE
  length(rows) as "포스트 수",
  sum(rows.file.size) as "총 용량"
FROM "posts"
WHERE date
GROUP BY dateformat(date, "yyyy-MM") as "월"
SORT "월" DESC
LIMIT 12
```
````

### 1.3 가장 긴/짧은 글

````markdown
## 📏 콘텐츠 길이 분석

### 가장 긴 글 Top 5
```dataview
TABLE
  title as "제목",
  length(file.content) as "글자 수",
  date as "날짜"
FROM "posts"
SORT length(file.content) DESC
LIMIT 5
```

### 가장 짧은 글 Top 5
```dataview
TABLE
  title as "제목",
  length(file.content) as "글자 수",
  date as "날짜"
FROM "posts"
WHERE length(file.content) > 0
SORT length(file.content) ASC
LIMIT 5
```
````

---

## 2. 태그 기반 분석

### 2.1 태그 인기도

````markdown
## 🏷️ 가장 많이 사용된 태그

```dataview
TABLE
  length(rows) as "사용 횟수",
  round(length(rows) / length(list(file) from "posts") * 100, 1) + "%" as "비율"
FROM "posts"
FLATTEN tags
WHERE tags
GROUP BY tags
SORT length(rows) DESC
LIMIT 10
```
````

### 2.2 태그 조합 분석

````markdown
## 🔗 자주 함께 사용되는 태그

```dataviewjs
const posts = dv.pages('"posts"').where(p => p.tags && p.tags.length > 1);
const combinations = {};

posts.forEach(post => {
  const tags = post.tags.sort();
  for (let i = 0; i < tags.length; i++) {
    for (let j = i + 1; j < tags.length; j++) {
      const combo = `${tags[i]} + ${tags[j]}`;
      combinations[combo] = (combinations[combo] || 0) + 1;
    }
  }
});

const sorted = Object.entries(combinations)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);

dv.table(
  ["태그 조합", "사용 횟수"],
  sorted
);
```
````

---

## 3. 작성 습관 추적

### 3.1 최근 작성 활동

````markdown
## ⏰ 최근 30일 활동

```dataview
TABLE
  title as "제목",
  date as "날짜",
  dateformat(file.mtime, "yyyy-MM-dd HH:mm") as "마지막 수정"
FROM "posts"
WHERE date >= date(now) - dur(30 days)
SORT file.mtime DESC
```
````

### 3.2 오래된 초안 찾기

````markdown
## ⚠️ 30일 이상 방치된 초안

```dataview
TABLE
  title as "제목",
  date as "작성 시작일",
  round((date(now) - date) / dur(1 day), 0) as "방치 일수"
FROM "posts"
WHERE status = "draft"
AND date < date(now) - dur(30 days)
SORT date ASC
```
````

### 3.3 이번 주 작성 목표

````markdown
## 🎯 이번 주 목표 (주 1회 발행)

```dataviewjs
const today = new Date();
const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));

const thisWeek = dv.pages('"posts"')
  .where(p => p.date >= dv.date(startOfWeek) && p.date <= dv.date(endOfWeek));

const published = thisWeek.where(p => p.status === "published");
const drafts = thisWeek.where(p => p.status === "draft");

dv.header(3, `발행: ${published.length}개 | 초안: ${drafts.length}개`);

if (published.length === 0) {
  dv.paragraph("⚠️ 아직 이번 주에 발행한 포스트가 없습니다!");
} else {
  dv.paragraph("✅ 이번 주 목표 달성!");
}
```
````

---

## 4. 시리즈 관리

### 4.1 시리즈별 포스트

````markdown
## 📚 시리즈별 포스트

```dataview
TABLE
  title as "제목",
  date as "날짜"
FROM "posts"
WHERE series
GROUP BY series
SORT date ASC
```
````

### 4.2 시리즈 완성도

````markdown
## 📖 시리즈 진행상황

```dataviewjs
const series = dv.pages('"posts"')
  .where(p => p.series)
  .groupBy(p => p.series);

dv.table(
  ["시리즈", "총 포스트", "발행", "초안", "완성도"],
  series.map(s => {
    const total = s.rows.length;
    const published = s.rows.filter(r => r.status === "published").length;
    const draft = s.rows.filter(r => r.status === "draft").length;
    const completion = Math.round(published / total * 100);

    return [
      s.key,
      total,
      published,
      draft,
      `${completion}%`
    ];
  })
  .sort((a, b) => b[4] - a[4])
);
```
````

---

## 5. 콘텐츠 품질 체크

### 5.1 Frontmatter 누락 확인

````markdown
## ⚠️ 메타데이터 누락 확인

```dataview
TABLE
  file.name as "파일",
  choice(!title, "❌", "✅") as "Title",
  choice(!date, "❌", "✅") as "Date",
  choice(!tags, "❌", "✅") as "Tags",
  choice(!status, "❌", "✅") as "Status"
FROM "posts"
WHERE !title OR !date OR !tags OR !status
```
````

### 5.2 너무 짧은 글 찾기

````markdown
## 📉 1000자 미만 포스트

```dataview
TABLE
  title as "제목",
  length(file.content) as "글자 수",
  date as "날짜"
FROM "posts"
WHERE length(file.content) < 1000
SORT length(file.content) ASC
```
````

---

## 6. 발행 관리

### 6.1 발행 대기 중인 포스트

````markdown
## 🚀 발행 준비 완료

```dataview
TABLE
  title as "제목",
  date as "예정일",
  tags as "태그",
  length(file.content) as "글자 수"
FROM "posts"
WHERE status = "ready" OR status = "review"
SORT date ASC
```
````

### 6.2 최근 발행 이력

````markdown
## 📰 최근 발행 (10개)

```dataview
TABLE
  title as "제목",
  date as "발행일",
  tags as "태그",
  round((date(now) - date) / dur(1 day), 0) as "경과 일수"
FROM "posts"
WHERE status = "published"
SORT date DESC
LIMIT 10
```
````

---

## 7. 인사이트 대시보드

### 7.1 종합 통계

````markdown
## 📈 블로그 종합 통계

```dataviewjs
const posts = dv.pages('"posts"');
const published = posts.where(p => p.status === "published");
const drafts = posts.where(p => p.status === "draft");

const totalWords = posts.array()
  .reduce((sum, p) => sum + p.file.size, 0);

const avgWords = Math.round(totalWords / posts.length);

const thisMonth = published.where(p =>
  p.date >= dv.date("now") - dv.duration("30 days")
);

dv.header(3, "전체 통계");
dv.list([
  `총 포스트: ${posts.length}개`,
  `발행됨: ${published.length}개`,
  `초안: ${drafts.length}개`,
  `평균 글자 수: ${avgWords}자`,
  `최근 30일 발행: ${thisMonth.length}개`
]);

// 발행 비율
const publishRate = Math.round(published.length / posts.length * 100);
dv.header(3, `발행률: ${publishRate}%`);

// 진행바 표시
const bar = "█".repeat(Math.floor(publishRate / 5)) +
            "░".repeat(20 - Math.floor(publishRate / 5));
dv.paragraph(bar);
```
````

---

## 8. 사용자 정의 뷰

### 8.1 나만의 콘텐츠 캘린더

````markdown
## 📅 콘텐츠 캘린더 (이번 달)

```dataviewjs
const posts = dv.pages('"posts"')
  .where(p => p.date &&
    p.date.year === new Date().getFullYear() &&
    p.date.month === new Date().getMonth() + 1
  )
  .sort(p => p.date);

const calendar = {};
posts.forEach(post => {
  const day = post.date.day;
  if (!calendar[day]) calendar[day] = [];
  calendar[day].push(`${post.title} (${post.status || "draft"})`);
});

for (let day = 1; day <= 31; day++) {
  if (calendar[day]) {
    dv.header(4, `${day}일`);
    dv.list(calendar[day]);
  }
}
```
````

### 8.2 관련 포스트 추천 (현재 페이지 기준)

포스트 끝에 추가할 코드:

````markdown
## 관련 포스트

```dataview
TABLE
  title as "제목",
  date as "날짜"
FROM "posts"
WHERE
  file.name != this.file.name
  AND any(tags, (t) => contains(this.tags, t))
SORT date DESC
LIMIT 3
```
````

---

## 9. 성과 추적

### 9.1 연간 작성 목표

````markdown
## 🎯 2024년 목표: 주 1회 발행 (52개)

```dataviewjs
const year = 2024;
const posts = dv.pages('"posts"')
  .where(p => p.date && p.date.year === year && p.status === "published");

const goal = 52;
const current = posts.length;
const percentage = Math.round(current / goal * 100);

dv.header(3, `${current} / ${goal} (${percentage}%)`);

const bar = "█".repeat(Math.floor(percentage / 2)) +
            "░".repeat(50 - Math.floor(percentage / 2));
dv.paragraph(bar);

const weeksLeft = Math.ceil((new Date(`${year}-12-31`) - new Date()) / (7 * 24 * 60 * 60 * 1000));
const needed = Math.max(0, goal - current);

if (needed > 0) {
  dv.paragraph(`⚠️ 목표까지 ${needed}개 필요 (남은 주: ${weeksLeft})`);
} else {
  dv.paragraph(`✅ 목표 달성!`);
}
```
````

### 9.2 작성 스트릭

````markdown
## 🔥 작성 연속 기록

```dataviewjs
const posts = dv.pages('"posts"')
  .where(p => p.date && p.status === "published")
  .sort(p => p.date, "desc");

let streak = 0;
let currentDate = new Date();

posts.forEach(post => {
  const postDate = new Date(post.date);
  const diff = Math.floor((currentDate - postDate) / (1000 * 60 * 60 * 24));

  if (diff <= 7) {
    streak++;
    currentDate = postDate;
  }
});

dv.header(3, `현재 연속 ${streak}주 발행 중! 🔥`);
```
````

---

## 10. 실시간 대시보드

모든 기능을 통합한 완전한 대시보드:

````markdown
# 📊 실시간 블로그 대시보드

## 현황

```dataviewjs
const posts = dv.pages('"posts"');
const published = posts.where(p => p.status === "published");
const drafts = posts.where(p => p.status === "draft");
const thisWeek = published.where(p => p.date >= dv.date("now") - dv.duration("7 days"));

dv.table(
  ["지표", "값"],
  [
    ["총 포스트", posts.length],
    ["발행됨", published.length],
    ["초안", drafts.length],
    ["이번 주 발행", thisWeek.length],
    ["발행률", `${Math.round(published.length / posts.length * 100)}%`]
  ]
);
```

## 최근 활동

```dataview
TABLE
  title as "제목",
  status as "상태",
  date as "날짜"
FROM "posts"
SORT file.mtime DESC
LIMIT 5
```

## 다음 할 일

```dataview
TASK
FROM "posts"
WHERE status = "draft"
```

## 태그 인기도

```dataview
TABLE
  length(rows) as "포스트 수"
FROM "posts"
FLATTEN tags
GROUP BY tags
SORT length(rows) DESC
LIMIT 5
```
````

---

## 사용 팁

1. **Dashboard.md에 통합**: 위의 쿼리를 Dashboard.md에 복사하여 사용
2. **커스터마이징**: 본인의 워크플로우에 맞게 수정
3. **성능 최적화**: 포스트가 많아지면 LIMIT 사용
4. **정기적 확인**: 주 1회 대시보드 확인 습관화

---

**참고 자료**:
- [Dataview 공식 문서](https://blacksmithgu.github.io/obsidian-dataview/)
- [Dataview 예제 모음](https://github.com/blacksmithgu/obsidian-dataview/discussions)
