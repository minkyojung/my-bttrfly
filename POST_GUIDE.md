# 포스트 작성 가이드

## 새로운 포스트 추가하기

### 1. posts/[slug]/page.tsx 파일 열기
```
app/posts/[slug]/page.tsx
```

### 2. posts 객체에 새 포스트 추가
```jsx
const posts = {
  "your-post-id": {
    title: "포스트 제목",
    date: "2024.02.01",
    content: (
      <>
        <p className="mb-2">
          첫 번째 문단
        </p>
        <p className="mb-2">
          두 번째 문단
        </p>
      </>
    )
  }
};
```

### 3. posts/page.tsx에 목록 추가
```jsx
const posts = [
  { id: "your-post-id", title: "포스트 제목", date: "2024.02.01", preview: "미리보기 텍스트" },
];
```

## 스타일 가이드

- **일반 문단**: `<p className="mb-2">텍스트</p>`
- **큰 문단**: `<p className="mb-2 text-lg leading-relaxed">텍스트</p>`
- **인용구**: `<blockquote className="mb-2 pl-4 border-l-2 border-black italic">인용문</blockquote>`
- **소제목**: `<h2 className="text-2xl mb-2 mt-6 font-normal">제목</h2>`
- **강조**: `<em>강조할 텍스트</em>`
- **볼드**: `<span className="font-bold">볼드 텍스트</span>`
- **이미지**: `<img src="/images/photo.jpg" alt="설명" className="w-full mb-2" />`

## URL 구조
- 홈: `/`
- 포스트 목록: `/posts`
- 개별 포스트: `/posts/your-post-id`