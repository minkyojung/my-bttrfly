import { test } from "node:test";
import assert from "node:assert/strict";
import { slugify, SLUG_PATTERN } from "../lib/slugify.ts";

// 글을 읽고 편집하는 경로가 slug에 요구하는 규칙. lib/markdown.ts의
// readPostFile과 app/api/write/posts/[slug]/route.ts가 쓰는 것과 같아야 한다.
const ROUTING_GATE = /^[\w-]+$/;

test("생성 가능한 slug는 반드시 라우팅이 받아준다", () => {
  // 이 불변식이 깨지면 "커밋은 되는데 열 수 없는 글"이 생긴다.
  const titles = [
    "Hello World",
    "안녕하세요 세상",           // 순수 한글
    "AI를 더 저렴하게 쓰는 법",   // 한글 + 영문 혼합
    "Vercel, Tailwind & Framer",
    "제목  --  여러   공백",
    "!!!",                       // 문자·숫자 없음
    "2024 회고",
    "  앞뒤 공백  ",
    "émoji 😀 test",
  ];

  for (const title of titles) {
    const slug = slugify(title);
    if (slug === "") continue; // 빈 slug는 API가 400으로 거절하므로 안전
    assert.ok(
      SLUG_PATTERN.test(slug),
      `slugify가 자기 규칙을 어김: ${title} → ${slug}`
    );
    assert.ok(
      ROUTING_GATE.test(slug),
      `라우팅이 못 읽는 slug 생성됨: ${title} → ${slug}`
    );
  }
});

test("순수 한글 제목은 빈 slug를 내어 API가 거절하게 한다", () => {
  // 조용히 한글 slug를 만들면 글이 404가 되므로, 빈 값을 내는 게 올바른 실패다.
  assert.equal(slugify("안녕하세요"), "");
  assert.equal(slugify("한글 제목 입니다"), "");
});

test("영문 제목은 읽을 수 있는 slug가 된다", () => {
  assert.equal(slugify("Hello World"), "hello-world");
  assert.equal(slugify("  Trim  Me  "), "trim-me");
  assert.equal(slugify("Vercel, Tailwind & Framer"), "vercel-tailwind-framer");
});

test("앞뒤 하이픈이 남지 않는다", () => {
  for (const title of ["!!!Hello!!!", "---a---", "...b..."]) {
    const slug = slugify(title);
    assert.ok(!slug.startsWith("-"), `앞 하이픈: ${slug}`);
    assert.ok(!slug.endsWith("-"), `뒤 하이픈: ${slug}`);
  }
});

test("80자로 잘려도 하이픈으로 끝나지 않는다", () => {
  // 자른 자리가 하이픈이면 SLUG_PATTERN은 통과하지만 지저분한 URL이 된다.
  const slug = slugify("a".repeat(78) + " bb");
  assert.ok(slug.length <= 80);
  assert.ok(!slug.endsWith("-"), slug);
});

test("SLUG_PATTERN은 비ASCII를 거부한다", () => {
  assert.ok(!SLUG_PATTERN.test("한글-슬러그"));
  assert.ok(!SLUG_PATTERN.test("Hello"));  // 대문자
  assert.ok(!SLUG_PATTERN.test("a b"));    // 공백
  assert.ok(!SLUG_PATTERN.test(""));       // 빈 값
  assert.ok(SLUG_PATTERN.test("valid-slug-123"));
});
