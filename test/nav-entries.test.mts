import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { NAV_ENTRIES, INTRO } from "../lib/nav-entries.ts";
import { LOCALES } from "../lib/i18n.ts";

// 홈 문단이 곧 네비게이션이다. 문단과 라우트가 어긋나면 사이트의 유일한 입구가
// 404로 이어지는데, 그건 배포한 뒤에야 드러난다. 여기서 먼저 막는다.
//
// test/published-posts.test.mts가 글에 대해 하는 일을 진입점에 대해 한다.

// components/home/IntroParagraph.tsx와 같은 표기여야 한다.
const TOKEN = /\[([^\]]+)\]\(([\w-]+)\)/g;

function tokensIn(template: string): string[] {
  return [...template.matchAll(TOKEN)].map((m) => m[2]);
}

test("문단이 가리키는 항목이 전부 실재한다", () => {
  const known = new Set(NAV_ENTRIES.map((e) => e.id));

  for (const locale of LOCALES) {
    for (const id of tokensIn(INTRO[locale])) {
      assert.ok(
        known.has(id),
        `${locale} 문단이 없는 항목 "${id}"를 가리킨다`
      );
    }
  }
});

test("문단에 실리는 항목은 두 언어 모두에 등장한다", () => {
  // 한쪽 언어에서만 문구를 지우면 그 언어에서는 해당 페이지로 갈 길이 사라진다.
  // 사람 눈에는 잘 안 띈다 — 그 언어로 볼 일이 적기 때문이다.
  for (const entry of NAV_ENTRIES.filter((e) => !e.unlisted)) {
    for (const locale of LOCALES) {
      assert.ok(
        tokensIn(INTRO[locale]).includes(entry.id),
        `${locale} 문단에 "${entry.id}" 진입점이 없다`
      );
    }
  }
});

test("unlisted 항목은 어느 문단에도 없다", () => {
  // 표시와 실제가 어긋나는 쪽도 막는다. 문단에 넣고 unlisted를 지우지 않으면
  // 위 테스트가 그 항목을 검사하지 않게 되어, 한쪽 언어에서 빠져도 조용히 지나간다.
  for (const entry of NAV_ENTRIES.filter((e) => e.unlisted)) {
    for (const locale of LOCALES) {
      assert.ok(
        !tokensIn(INTRO[locale]).includes(entry.id),
        `"${entry.id}"가 ${locale} 문단에 있는데 unlisted로 표시돼 있다`
      );
    }
  }
});

test("모든 항목에 대응하는 라우트가 있다", () => {
  for (const entry of NAV_ENTRIES) {
    const route = path.join(
      process.cwd(),
      "app/[locale]",
      entry.path,
      "page.tsx"
    );
    assert.ok(
      fs.existsSync(route),
      `${entry.id}의 라우트가 없다: app/[locale]${entry.path}/page.tsx`
    );
  }
});

test("항목마다 두 언어의 라벨과 프리뷰가 채워져 있다", () => {
  for (const entry of NAV_ENTRIES) {
    for (const locale of LOCALES) {
      assert.ok(entry.label[locale]?.trim(), `${entry.id}.label.${locale} 비어있음`);
      assert.ok(
        entry.preview[locale]?.title?.trim(),
        `${entry.id}.preview.${locale}.title 비어있음`
      );
      assert.ok(
        entry.preview[locale]?.body?.trim(),
        `${entry.id}.preview.${locale}.body 비어있음`
      );
    }
  }
});
