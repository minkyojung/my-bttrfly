// TipTap은 브라우저 DOM 위에서만 돈다. 에디터를 쓰는 테스트는 이 파일을
// --import로 먼저 걸어 최소한의 DOM을 세운 뒤 실행한다.
//
// 이 테스트들이 test/editor/ 아래에 따로 사는 이유: 위쪽 테스트는
// --conditions=react-server로 도는데(lib/markdown.ts의 server-only 때문),
// 그 조건에서는 React가 서버 빌드로 해석돼 에디터가 로드되지 않는다.
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>");

globalThis.window = dom.window;
globalThis.document = dom.window.document;
Object.defineProperty(globalThis, "navigator", {
  value: dom.window.navigator,
  configurable: true,
});
for (const key of [
  "HTMLElement",
  "Element",
  "Node",
  "DOMParser",
  "getComputedStyle",
]) {
  globalThis[key] = dom.window[key];
}
