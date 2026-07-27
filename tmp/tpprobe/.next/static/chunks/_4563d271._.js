(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/lib/utils.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "cn": ()=>cn,
    "formatDate": ()=>formatDate
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn() {
    for(var _len = arguments.length, inputs = new Array(_len), _key = 0; _key < _len; _key++){
        inputs[_key] = arguments[_key];
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
function formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/lib/columns.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
// 홈페이지 섹션(칼럼)의 단일 출처.
// 이 배열을 수정하면 (1) Keystatic 카테고리 선택지와 (2) 홈페이지 섹션이
// 순서까지 함께 바뀐다 — 컴포넌트나 그룹핑 로직은 건드릴 필요 없다.
// 카테고리를 추가/이름변경/재정렬하려면 여기 배열만 고치면 된다.
__turbopack_context__.s({
    "COLUMNS": ()=>COLUMNS
});
const COLUMNS = [
    {
        value: "Essays",
        label: "Essays"
    },
    {
        value: "Interviews",
        label: "Interviews"
    },
    {
        value: "Newsletter",
        label: "Newsletter"
    },
    {
        value: "Retrospectives",
        label: "Retrospectives"
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/lib/slugify.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
// slug 규칙의 단일 출처. 생성기(slugify) · 저자 입력 검증 · API 검증이 모두
// 이 규칙을 공유해야 "만들 수는 있는데 못 읽는 slug"가 생기지 않는다.
// 소문자 영숫자와 하이픈만 허용한다(비ASCII 불가).
__turbopack_context__.s({
    "SLUG_PATTERN": ()=>SLUG_PATTERN,
    "slugify": ()=>slugify
});
const SLUG_PATTERN = /^[a-z0-9-]+$/;
function slugify(title) {
    return title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80).replace(/-+$/g, "");
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/PostImage.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "PostImage": ()=>PostImage
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
;
;
function PostImage(param) {
    let { src, alt, meta } = param;
    if (meta) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "block my-6 rounded-md overflow-hidden",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                src: src,
                alt: alt,
                width: meta.width,
                height: meta.height,
                className: "block w-full h-auto max-w-full",
                sizes: "(max-width: 600px) 100vw, 600px"
            }, void 0, false, {
                fileName: "[project]/components/PostImage.tsx",
                lineNumber: 14,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/PostImage.tsx",
            lineNumber: 13,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "block my-6 rounded-md overflow-hidden relative aspect-video w-full",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            src: src,
            alt: alt,
            fill: true,
            className: "block w-full h-auto max-w-full object-cover",
            sizes: "(max-width: 600px) 100vw, 600px",
            unoptimized: true
        }, void 0, false, {
            fileName: "[project]/components/PostImage.tsx",
            lineNumber: 28,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/PostImage.tsx",
        lineNumber: 27,
        columnNumber: 5
    }, this);
}
_c = PostImage;
var _c;
__turbopack_context__.k.register(_c, "PostImage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/ui/link.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "SmartLink": ()=>SmartLink
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
;
function isExternal(href) {
    return /^https?:\/\//.test(href) || href.startsWith("mailto:");
}
function SmartLink(param) {
    let { href, className, children, ...props } = param;
    if (isExternal(href)) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
            href: href,
            target: "_blank",
            rel: "noopener noreferrer",
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(className),
            ...props,
            children: children
        }, void 0, false, {
            fileName: "[project]/components/ui/link.tsx",
            lineNumber: 18,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        href: href,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(className),
        ...props,
        children: children
    }, void 0, false, {
        fileName: "[project]/components/ui/link.tsx",
        lineNumber: 30,
        columnNumber: 5
    }, this);
}
_c = SmartLink;
var _c;
__turbopack_context__.k.register(_c, "SmartLink");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/PostBody.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "PostBody": ()=>PostBody
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$markdown$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__Markdown__as__default$3e$__ = __turbopack_context__.i("[project]/node_modules/react-markdown/lib/index.js [app-client] (ecmascript) <export Markdown as default>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$remark$2d$gfm$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/remark-gfm/lib/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$remark$2d$breaks$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/remark-breaks/lib/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$PostImage$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/PostImage.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$link$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/link.tsx [app-client] (ecmascript)");
;
;
;
;
;
;
function PostBody(param) {
    let { content, imageMeta } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$markdown$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__Markdown__as__default$3e$__["default"], {
        remarkPlugins: [
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$remark$2d$gfm$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$remark$2d$breaks$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
        ],
        components: {
            img: (param)=>{
                let { src, alt } = param;
                if (typeof src !== 'string') return null;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$PostImage$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PostImage"], {
                    src: src,
                    alt: alt !== null && alt !== void 0 ? alt : '',
                    meta: imageMeta[src]
                }, void 0, false, {
                    fileName: "[project]/components/PostBody.tsx",
                    lineNumber: 20,
                    columnNumber: 18
                }, void 0);
            },
            // react-markdown이 넘기는 ref는 SmartLink와 호환되지 않아 제외한다
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            a: (param)=>{
                let { href, children, ref: _ref, ...rest } = param;
                if (typeof href !== 'string') {
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        ...rest,
                        children: children
                    }, void 0, false, {
                        fileName: "[project]/components/PostBody.tsx",
                        lineNumber: 26,
                        columnNumber: 20
                    }, void 0);
                }
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$link$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SmartLink"], {
                    href: href,
                    ...rest,
                    children: children
                }, void 0, false, {
                    fileName: "[project]/components/PostBody.tsx",
                    lineNumber: 29,
                    columnNumber: 13
                }, void 0);
            }
        },
        children: content
    }, void 0, false, {
        fileName: "[project]/components/PostBody.tsx",
        lineNumber: 15,
        columnNumber: 5
    }, this);
}
_c = PostBody;
var _c;
__turbopack_context__.k.register(_c, "PostBody");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/write/MarkdownEditor.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "EditorSurface": ()=>EditorSurface,
    "EditorToolbar": ()=>EditorToolbar,
    "usePostEditor": ()=>usePostEditor
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$react$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@tiptap/react/dist/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$starter$2d$kit$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tiptap/starter-kit/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$extension$2d$placeholder$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/@tiptap/extension-placeholder/dist/index.js [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$extension$2d$placeholder$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@tiptap/extension-placeholder/dist/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$extension$2d$image$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tiptap/extension-image/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$extension$2d$table$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tiptap/extension-table/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tiptap$2d$markdown$2f$dist$2f$tiptap$2d$markdown$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tiptap-markdown/dist/tiptap-markdown.es.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
// 이미지 업로드(툴바·붙여넣기·드래그 공용). 성공 시 공개 경로, 실패 시 null.
async function uploadImage(file) {
    const formData = new FormData();
    formData.append("file", file);
    try {
        const res = await fetch("/api/write/images", {
            method: "POST",
            body: formData
        });
        const data = await res.json().catch(()=>({}));
        return res.ok && data.path ? data.path : null;
    } catch (e) {
        return null;
    }
}
function imageFilesFrom(list) {
    return Array.from(list !== null && list !== void 0 ? list : []).filter((f)=>f.type.startsWith("image/"));
}
function usePostEditor(value, onChange) {
    _s();
    // 붙여넣기/드래그 핸들러는 editorProps 안(초기화 시점)에서 정의되므로,
    // 업로드 완료 후 삽입할 때 쓸 editor 인스턴스를 ref로 참조한다.
    const editorRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    async function insertImages(files, pos) {
        for (const file of files){
            const path = await uploadImage(file);
            const ed = editorRef.current;
            if (!path) {
                window.alert("Image upload failed");
                continue;
            }
            if (!ed) continue;
            if (pos != null) {
                ed.chain().focus().insertContentAt(pos, {
                    type: "image",
                    attrs: {
                        src: path,
                        alt: file.name
                    }
                }).run();
            } else {
                ed.chain().focus().setImage({
                    src: path,
                    alt: file.name
                }).run();
            }
        }
    }
    const editor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$react$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useEditor"])({
        immediatelyRender: false,
        extensions: [
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$starter$2d$kit$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$extension$2d$image$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$extension$2d$table$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Table"].configure({
                resizable: true
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$extension$2d$table$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableRow"],
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$extension$2d$table$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableHeader"],
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$extension$2d$table$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableCell"],
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tiptap$2d$markdown$2f$dist$2f$tiptap$2d$markdown$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Markdown"],
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$extension$2d$placeholder$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"].configure({
                placeholder: "Start writing…"
            })
        ],
        content: value,
        editorProps: {
            attributes: {
                // 타이포그래피는 tailwind.config.ts의 typography가 담당한다(발행 페이지와
                // 같은 정의). 여기서는 편집 영역으로서 필요한 것만 더한다.
                class: "prose max-w-none min-h-[400px] focus:outline-none"
            },
            // 클립보드 이미지 붙여넣기: 이미지가 있으면 가로채 업로드 후 삽입.
            handlePaste: {
                "usePostEditor.useEditor[editor]": (_view, event)=>{
                    var _event_clipboardData;
                    const files = imageFilesFrom((_event_clipboardData = event.clipboardData) === null || _event_clipboardData === void 0 ? void 0 : _event_clipboardData.files);
                    if (files.length === 0) return false;
                    event.preventDefault();
                    void insertImages(files);
                    return true;
                }
            }["usePostEditor.useEditor[editor]"],
            // 파일 드래그&드롭: 드롭 지점 위치에 업로드 후 삽입.
            handleDrop: {
                "usePostEditor.useEditor[editor]": (view, event)=>{
                    var _event_dataTransfer;
                    const files = imageFilesFrom((_event_dataTransfer = event.dataTransfer) === null || _event_dataTransfer === void 0 ? void 0 : _event_dataTransfer.files);
                    if (files.length === 0) return false;
                    event.preventDefault();
                    const coords = view.posAtCoords({
                        left: event.clientX,
                        top: event.clientY
                    });
                    void insertImages(files, coords === null || coords === void 0 ? void 0 : coords.pos);
                    return true;
                }
            }["usePostEditor.useEditor[editor]"]
        },
        onUpdate: {
            "usePostEditor.useEditor[editor]": (param)=>{
                let { editor } = param;
                // tiptap-markdown이 editor.storage.markdown에 getMarkdown()을 붙이지만
                // 타입 augmentation이 노출되지 않아 좁은 캐스트로 접근한다.
                const storage = editor.storage;
                onChange(storage.markdown.getMarkdown());
            }
        }["usePostEditor.useEditor[editor]"]
    });
    editorRef.current = editor;
    return editor;
}
_s(usePostEditor, "uZK+IzExcgMpvrI4dsl23Z0rH1E=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$react$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useEditor"]
    ];
});
function EditorSurface(param) {
    let { editor } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tiptap$2f$react$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["EditorContent"], {
        editor: editor
    }, void 0, false, {
        fileName: "[project]/components/write/MarkdownEditor.tsx",
        lineNumber: 127,
        columnNumber: 10
    }, this);
}
_c = EditorSurface;
function EditorToolbar(param) {
    let { editor } = param;
    _s1();
    const imageInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [uploadingImage, setUploadingImage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    function promptLink() {
        const previous = editor.getAttributes("link").href;
        const url = window.prompt("Link URL", previous !== null && previous !== void 0 ? previous : "https://");
        if (url === null) return;
        if (url === "") {
            editor.chain().focus().unsetLink().run();
            return;
        }
        editor.chain().focus().setLink({
            href: url
        }).run();
    }
    // 툴바 이미지 버튼: 붙여넣기/드래그와 동일한 공용 업로드 헬퍼 사용.
    async function handleImageFile(e) {
        var _e_target_files;
        const file = (_e_target_files = e.target.files) === null || _e_target_files === void 0 ? void 0 : _e_target_files[0];
        e.target.value = ""; // 같은 파일 재선택 허용
        if (!file) return;
        setUploadingImage(true);
        const path = await uploadImage(file);
        setUploadingImage(false);
        if (path) {
            editor.chain().focus().setImage({
                src: path,
                alt: file.name
            }).run();
        } else {
            window.alert("Image upload failed");
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-wrap items-center gap-1",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Btn, {
                onClick: ()=>editor.chain().focus().toggleBold().run(),
                active: editor.isActive("bold"),
                label: "B",
                bold: true
            }, void 0, false, {
                fileName: "[project]/components/write/MarkdownEditor.tsx",
                lineNumber: 163,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Btn, {
                onClick: ()=>editor.chain().focus().toggleItalic().run(),
                active: editor.isActive("italic"),
                label: "I",
                italic: true
            }, void 0, false, {
                fileName: "[project]/components/write/MarkdownEditor.tsx",
                lineNumber: 164,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Btn, {
                onClick: ()=>editor.chain().focus().toggleStrike().run(),
                active: editor.isActive("strike"),
                label: "S",
                strike: true
            }, void 0, false, {
                fileName: "[project]/components/write/MarkdownEditor.tsx",
                lineNumber: 165,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Btn, {
                onClick: ()=>editor.chain().focus().toggleCode().run(),
                active: editor.isActive("code"),
                label: "</>"
            }, void 0, false, {
                fileName: "[project]/components/write/MarkdownEditor.tsx",
                lineNumber: 166,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Divider, {}, void 0, false, {
                fileName: "[project]/components/write/MarkdownEditor.tsx",
                lineNumber: 167,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Btn, {
                onClick: ()=>editor.chain().focus().toggleHeading({
                        level: 1
                    }).run(),
                active: editor.isActive("heading", {
                    level: 1
                }),
                label: "H1"
            }, void 0, false, {
                fileName: "[project]/components/write/MarkdownEditor.tsx",
                lineNumber: 168,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Btn, {
                onClick: ()=>editor.chain().focus().toggleHeading({
                        level: 2
                    }).run(),
                active: editor.isActive("heading", {
                    level: 2
                }),
                label: "H2"
            }, void 0, false, {
                fileName: "[project]/components/write/MarkdownEditor.tsx",
                lineNumber: 169,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Btn, {
                onClick: ()=>editor.chain().focus().toggleHeading({
                        level: 3
                    }).run(),
                active: editor.isActive("heading", {
                    level: 3
                }),
                label: "H3"
            }, void 0, false, {
                fileName: "[project]/components/write/MarkdownEditor.tsx",
                lineNumber: 170,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Divider, {}, void 0, false, {
                fileName: "[project]/components/write/MarkdownEditor.tsx",
                lineNumber: 171,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Btn, {
                onClick: ()=>editor.chain().focus().toggleBulletList().run(),
                active: editor.isActive("bulletList"),
                label: "• List"
            }, void 0, false, {
                fileName: "[project]/components/write/MarkdownEditor.tsx",
                lineNumber: 172,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Btn, {
                onClick: ()=>editor.chain().focus().toggleOrderedList().run(),
                active: editor.isActive("orderedList"),
                label: "1. List"
            }, void 0, false, {
                fileName: "[project]/components/write/MarkdownEditor.tsx",
                lineNumber: 173,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Btn, {
                onClick: ()=>editor.chain().focus().toggleBlockquote().run(),
                active: editor.isActive("blockquote"),
                label: "“"
            }, void 0, false, {
                fileName: "[project]/components/write/MarkdownEditor.tsx",
                lineNumber: 174,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Btn, {
                onClick: ()=>editor.chain().focus().toggleCodeBlock().run(),
                active: editor.isActive("codeBlock"),
                label: "Code"
            }, void 0, false, {
                fileName: "[project]/components/write/MarkdownEditor.tsx",
                lineNumber: 175,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Btn, {
                onClick: ()=>editor.chain().focus().insertTable({
                        rows: 3,
                        cols: 3,
                        withHeaderRow: true
                    }).run(),
                active: editor.isActive("table"),
                label: "Table"
            }, void 0, false, {
                fileName: "[project]/components/write/MarkdownEditor.tsx",
                lineNumber: 176,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Divider, {}, void 0, false, {
                fileName: "[project]/components/write/MarkdownEditor.tsx",
                lineNumber: 177,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Btn, {
                onClick: promptLink,
                active: editor.isActive("link"),
                label: "Link"
            }, void 0, false, {
                fileName: "[project]/components/write/MarkdownEditor.tsx",
                lineNumber: 178,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Btn, {
                onClick: ()=>{
                    var _imageInputRef_current;
                    return (_imageInputRef_current = imageInputRef.current) === null || _imageInputRef_current === void 0 ? void 0 : _imageInputRef_current.click();
                },
                active: false,
                label: uploadingImage ? "…" : "Image"
            }, void 0, false, {
                fileName: "[project]/components/write/MarkdownEditor.tsx",
                lineNumber: 179,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Btn, {
                onClick: ()=>editor.chain().focus().setHorizontalRule().run(),
                active: false,
                label: "―"
            }, void 0, false, {
                fileName: "[project]/components/write/MarkdownEditor.tsx",
                lineNumber: 184,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                ref: imageInputRef,
                type: "file",
                accept: "image/*",
                onChange: handleImageFile,
                className: "hidden"
            }, void 0, false, {
                fileName: "[project]/components/write/MarkdownEditor.tsx",
                lineNumber: 185,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/write/MarkdownEditor.tsx",
        lineNumber: 162,
        columnNumber: 5
    }, this);
}
_s1(EditorToolbar, "K2Vk3Lg1RlLvZXF1wIMP0jALX2s=");
_c1 = EditorToolbar;
function Divider() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "mx-1 h-4 w-px bg-border"
    }, void 0, false, {
        fileName: "[project]/components/write/MarkdownEditor.tsx",
        lineNumber: 197,
        columnNumber: 10
    }, this);
}
_c2 = Divider;
function Btn(param) {
    let { onClick, active, label, bold, italic, strike } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "button",
        onClick: onClick,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("rounded-sm px-2 py-1 text-sm text-fg-muted hover:bg-surface hover:text-fg", active && "bg-surface text-fg", bold && "font-bold", italic && "italic", strike && "line-through"),
        children: label
    }, void 0, false, {
        fileName: "[project]/components/write/MarkdownEditor.tsx",
        lineNumber: 216,
        columnNumber: 5
    }, this);
}
_c3 = Btn;
var _c, _c1, _c2, _c3;
__turbopack_context__.k.register(_c, "EditorSurface");
__turbopack_context__.k.register(_c1, "EditorToolbar");
__turbopack_context__.k.register(_c2, "Divider");
__turbopack_context__.k.register(_c3, "Btn");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/write/PostForm.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "PostForm": ()=>PostForm
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$columns$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/columns.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$slugify$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/slugify.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$PostBody$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/PostBody.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$write$2f$MarkdownEditor$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/write/MarkdownEditor.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
// 제목/소제목용 자동 높이 textarea. <input>은 단일 라인이라 긴 텍스트가 가로로
// 잘리므로, 내용에 맞춰 높이를 늘려 여러 줄로 감싸지게 한다.
function AutoTextarea(param) {
    let { value, onChange, placeholder, className } = param;
    _s();
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AutoTextarea.useEffect": ()=>{
            const el = ref.current;
            if (!el) return;
            el.style.height = "auto";
            el.style.height = "".concat(el.scrollHeight, "px");
        }
    }["AutoTextarea.useEffect"], [
        value
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
        ref: ref,
        value: value,
        onChange: (e)=>onChange(e.target.value),
        placeholder: placeholder,
        rows: 1,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("resize-none overflow-hidden", className)
    }, void 0, false, {
        fileName: "[project]/components/write/PostForm.tsx",
        lineNumber: 37,
        columnNumber: 5
    }, this);
}
_s(AutoTextarea, "8uVE59eA/r6b92xF80p7sH8rXLk=");
_c = AutoTextarea;
function todayDate() {
    return new Date().toISOString().slice(0, 10);
}
function PostForm(param) {
    let { mode, slug: initialSlug, baseSha, initialValues } = param;
    _s1();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    // 저장에 성공하면 새 지문으로 갱신한다. 그러지 않으면 두 번째 저장이
    // 자기 자신의 변경을 "다른 곳의 수정"으로 오인해 409가 난다.
    const shaRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(baseSha);
    // slug는 저자가 직접 편집하는 필드다. 생성 시 제목에서 초안을 자동으로
    // 채우되(아직 저자가 손대지 않았을 때만), 발행 후에는 불변이므로 편집
    // 화면에서는 읽기 전용으로 보여준다.
    const [slug, setSlug] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialSlug !== null && initialSlug !== void 0 ? initialSlug : "");
    const slugTouched = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(mode === "edit");
    var _initialValues_title;
    const [title, setTitle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])((_initialValues_title = initialValues === null || initialValues === void 0 ? void 0 : initialValues.title) !== null && _initialValues_title !== void 0 ? _initialValues_title : "");
    var _initialValues_date;
    const [date, setDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])((_initialValues_date = initialValues === null || initialValues === void 0 ? void 0 : initialValues.date) !== null && _initialValues_date !== void 0 ? _initialValues_date : todayDate());
    var _initialValues_category;
    const [category, setCategory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])((_initialValues_category = initialValues === null || initialValues === void 0 ? void 0 : initialValues.category) !== null && _initialValues_category !== void 0 ? _initialValues_category : "");
    var _initialValues_summary;
    const [summary, setSummary] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])((_initialValues_summary = initialValues === null || initialValues === void 0 ? void 0 : initialValues.summary) !== null && _initialValues_summary !== void 0 ? _initialValues_summary : "");
    var _initialValues_cover;
    const [cover, setCover] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])((_initialValues_cover = initialValues === null || initialValues === void 0 ? void 0 : initialValues.cover) !== null && _initialValues_cover !== void 0 ? _initialValues_cover : "");
    var _initialValues_external;
    const [external, setExternal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])((_initialValues_external = initialValues === null || initialValues === void 0 ? void 0 : initialValues.external) !== null && _initialValues_external !== void 0 ? _initialValues_external : "");
    var _initialValues_canonical;
    const [canonical, setCanonical] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])((_initialValues_canonical = initialValues === null || initialValues === void 0 ? void 0 : initialValues.canonical) !== null && _initialValues_canonical !== void 0 ? _initialValues_canonical : "");
    var _initialValues_featured;
    const [featured, setFeatured] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])((_initialValues_featured = initialValues === null || initialValues === void 0 ? void 0 : initialValues.featured) !== null && _initialValues_featured !== void 0 ? _initialValues_featured : false);
    var _initialValues_draft;
    const [draft, setDraft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])((_initialValues_draft = initialValues === null || initialValues === void 0 ? void 0 : initialValues.draft) !== null && _initialValues_draft !== void 0 ? _initialValues_draft : false);
    var _initialValues_source;
    const [source, setSource] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])((_initialValues_source = initialValues === null || initialValues === void 0 ? void 0 : initialValues.source) !== null && _initialValues_source !== void 0 ? _initialValues_source : "");
    var _initialValues_content;
    const [content, setContent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])((_initialValues_content = initialValues === null || initialValues === void 0 ? void 0 : initialValues.content) !== null && _initialValues_content !== void 0 ? _initialValues_content : "");
    const editor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$write$2f$MarkdownEditor$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePostEditor"])(content, setContent);
    const [uploading, setUploading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [coverFileName, setCoverFileName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [submitting, setSubmitting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [savedSlug, setSavedSlug] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [deleting, setDeleting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showSettings, setShowSettings] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showPreview, setShowPreview] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // --- 이탈/유실 방어 ---
    // 현재 폼 전체를 직렬화해 초기 상태와 비교하는 것으로 "변경됨(dirty)"을 판정한다.
    const snapshot = {
        slug,
        title,
        date,
        category,
        summary,
        cover,
        external,
        canonical,
        featured,
        draft,
        source: source || undefined,
        content
    };
    const serialized = JSON.stringify(snapshot);
    // 최초 렌더 시점의 값을 기준선으로 고정(저장 성공 시 갱신).
    const baselineRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(serialized);
    const dirty = serialized !== baselineRef.current;
    const draftKey = "write-draft:".concat(initialSlug !== null && initialSlug !== void 0 ? initialSlug : "new");
    const [recoverable, setRecoverable] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    function applyValues(v) {
        // 복구한 초안이 커스텀 slug를 담고 있을 수 있으므로 이후 제목 편집이
        // 덮어쓰지 않도록 touched로 표시한다.
        if (v.slug !== undefined) {
            setSlug(v.slug);
            slugTouched.current = true;
        }
        setTitle(v.title);
        setDate(v.date);
        var _v_category;
        setCategory((_v_category = v.category) !== null && _v_category !== void 0 ? _v_category : "");
        var _v_summary;
        setSummary((_v_summary = v.summary) !== null && _v_summary !== void 0 ? _v_summary : "");
        var _v_cover;
        setCover((_v_cover = v.cover) !== null && _v_cover !== void 0 ? _v_cover : "");
        var _v_external;
        setExternal((_v_external = v.external) !== null && _v_external !== void 0 ? _v_external : "");
        var _v_canonical;
        setCanonical((_v_canonical = v.canonical) !== null && _v_canonical !== void 0 ? _v_canonical : "");
        setFeatured(v.featured);
        setDraft(v.draft);
        var _v_source;
        setSource((_v_source = v.source) !== null && _v_source !== void 0 ? _v_source : "");
        setContent(v.content);
        // WYSIWYG 에디터는 초기 content만 읽으므로, 복구 시 본문도 직접 반영.
        editor === null || editor === void 0 ? void 0 : editor.commands.setContent(v.content);
    }
    // 마운트 시: 저장된 로컬 초안이 초기값과 다르면 복구 배너를 띄운다.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PostForm.useEffect": ()=>{
            try {
                const raw = localStorage.getItem(draftKey);
                if (!raw) return;
                const parsed = JSON.parse(raw);
                if (JSON.stringify(parsed) !== baselineRef.current) {
                    setRecoverable(parsed);
                } else {
                    localStorage.removeItem(draftKey);
                }
            } catch (e) {
            /* 손상된 초안은 무시 */ }
        // draftKey는 마운트 시 고정이므로 1회만 실행
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["PostForm.useEffect"], []);
    // 변경 시 디바운스로 로컬에 초안 저장(서버 저장 = git 커밋이라 자주 못 함).
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PostForm.useEffect": ()=>{
            if (!dirty) return;
            const id = setTimeout({
                "PostForm.useEffect.id": ()=>{
                    try {
                        localStorage.setItem(draftKey, serialized);
                    } catch (e) {
                    /* 용량 초과 등은 무시 */ }
                }
            }["PostForm.useEffect.id"], 800);
            return ({
                "PostForm.useEffect": ()=>clearTimeout(id)
            })["PostForm.useEffect"];
        }
    }["PostForm.useEffect"], [
        dirty,
        serialized,
        draftKey
    ]);
    // 새로고침·탭닫기·URL이동 등 하드 내비게이션에 브라우저 기본 경고를 띄운다.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PostForm.useEffect": ()=>{
            if (!dirty) return;
            const handler = {
                "PostForm.useEffect.handler": (e)=>{
                    e.preventDefault();
                    e.returnValue = "";
                }
            }["PostForm.useEffect.handler"];
            window.addEventListener("beforeunload", handler);
            return ({
                "PostForm.useEffect": ()=>window.removeEventListener("beforeunload", handler)
            })["PostForm.useEffect"];
        }
    }["PostForm.useEffect"], [
        dirty
    ]);
    // ⌘S(⌃S)로 저장. 브라우저 기본 "페이지 저장"을 막고 폼 제출로 돌린다.
    // requestSubmit()이라 버튼 클릭과 동일한 경로(검증 포함)를 탄다.
    const formRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PostForm.useEffect": ()=>{
            const handler = {
                "PostForm.useEffect.handler": (e)=>{
                    var _formRef_current;
                    if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "s") return;
                    e.preventDefault();
                    if (!submitting) (_formRef_current = formRef.current) === null || _formRef_current === void 0 ? void 0 : _formRef_current.requestSubmit();
                }
            }["PostForm.useEffect.handler"];
            window.addEventListener("keydown", handler);
            return ({
                "PostForm.useEffect": ()=>window.removeEventListener("keydown", handler)
            })["PostForm.useEffect"];
        }
    }["PostForm.useEffect"], [
        submitting
    ]);
    // 앱 내 링크(←, Back)는 App Router가 소프트 내비를 못 막으므로 직접 확인한다.
    function confirmLeave(e) {
        if (dirty && !window.confirm("Unsaved changes will be lost. Leave anyway?")) {
            e.preventDefault();
        }
    }
    // 생성 모드에서 저자가 slug를 아직 직접 건드리지 않았다면 제목에서 자동 채운다.
    function handleTitleChange(value) {
        setTitle(value);
        if (mode === "create" && !slugTouched.current) {
            setSlug((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$slugify$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["slugify"])(value));
        }
    }
    async function handleCoverChange(e) {
        var _e_target_files;
        const file = (_e_target_files = e.target.files) === null || _e_target_files === void 0 ? void 0 : _e_target_files[0];
        if (!file) return;
        setUploading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch("/api/write/images", {
                method: "POST",
                body: formData
            });
            const data = await res.json().catch(()=>({}));
            if (!res.ok) {
                var _data_error;
                setError((_data_error = data.error) !== null && _data_error !== void 0 ? _data_error : "Image upload failed");
                return;
            }
            setCover(data.path);
            setCoverFileName(file.name);
        } catch (e) {
            setError("Image upload failed");
        } finally{
            setUploading(false);
        }
    }
    async function handleDelete() {
        if (mode !== "edit" || !initialSlug) return;
        if (!window.confirm('Delete "'.concat(title, '"?\n\nThe post is removed from the site on the next deploy. ') + "It stays in git history, so it can be restored.")) {
            return;
        }
        setError(null);
        setDeleting(true);
        try {
            const res = await fetch("/api/write/posts/".concat(initialSlug), {
                method: "DELETE"
            });
            const data = await res.json().catch(()=>({}));
            if (!res.ok) {
                var _data_error;
                setError((_data_error = data.error) !== null && _data_error !== void 0 ? _data_error : "Delete failed");
                return;
            }
            // 삭제 성공 → 이 글의 로컬 초안도 정리하고, 이탈 경고가 뜨지 않도록
            // 기준선을 현재 값으로 맞춘 뒤 목록으로 돌아간다.
            try {
                localStorage.removeItem(draftKey);
            } catch (e) {
            /* noop */ }
            baselineRef.current = serialized;
            router.push("/write");
        } catch (e) {
            setError("Delete failed");
        } finally{
            setDeleting(false);
        }
    }
    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setSavedSlug(null);
        if (!title.trim() || !date.trim() || !content.trim()) {
            setError("Title, date, and body are required.");
            setShowSettings(true);
            return;
        }
        if (mode === "create" && !__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$slugify$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SLUG_PATTERN"].test(slug.trim())) {
            setError("Slug must be lowercase letters, numbers, and hyphens.");
            setShowSettings(true);
            return;
        }
        setSubmitting(true);
        try {
            const body = {
                slug: slug.trim(),
                title,
                date,
                category: category || undefined,
                summary: summary || undefined,
                cover: cover || undefined,
                external: external || undefined,
                canonical: canonical || undefined,
                featured,
                draft,
                source: source || undefined,
                content,
                ...mode === "edit" ? {
                    baseSha: shaRef.current
                } : {}
            };
            const res = await fetch(mode === "create" ? "/api/write/posts" : "/api/write/posts/".concat(initialSlug), {
                method: mode === "create" ? "POST" : "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });
            const data = await res.json().catch(()=>({}));
            if (!res.ok) {
                var _data_error;
                setError((_data_error = data.error) !== null && _data_error !== void 0 ? _data_error : "Save failed");
                return;
            }
            // 저장 = GitHub 커밋. Vercel 재배포 전까지 현재 파일시스템은 옛 내용을
            // 읽으므로 방금 저장한 글로 자동 이동하지 않고 여기 머물며 안내만 한다.
            setSavedSlug(data.slug);
            if (typeof data.sha === "string") shaRef.current = data.sha;
            // 저장 성공 → 로컬 초안 제거 + 현재 값을 새 기준선으로(=더 이상 dirty 아님).
            try {
                localStorage.removeItem(draftKey);
            } catch (e) {
            /* noop */ }
            baselineRef.current = serialized;
            setRecoverable(null);
        } catch (e) {
            setError("Save failed");
        } finally{
            setSubmitting(false);
        }
    }
    const inputClass = "w-full rounded-sm border border-border bg-bg px-3 py-2 text-sm text-fg";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
        ref: formRef,
        onSubmit: handleSubmit,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "sticky top-0 z-20 border-b border-border bg-bg/90 backdrop-blur",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between px-6 py-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex min-w-0 items-center gap-3 text-sm",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/write",
                                        onClick: confirmLeave,
                                        className: "shrink-0 text-fg-muted hover:text-fg",
                                        children: "←"
                                    }, void 0, false, {
                                        fileName: "[project]/components/write/PostForm.tsx",
                                        lineNumber: 373,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "truncate text-fg-muted",
                                        children: mode === "edit" ? initialSlug : slug || "New post"
                                    }, void 0, false, {
                                        fileName: "[project]/components/write/PostForm.tsx",
                                        lineNumber: 380,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "shrink-0 text-xs text-fg-subtle",
                                        children: dirty ? "· Unsaved" : savedSlug ? "· Saved" : ""
                                    }, void 0, false, {
                                        fileName: "[project]/components/write/PostForm.tsx",
                                        lineNumber: 383,
                                        columnNumber: 13
                                    }, this),
                                    mode === "edit" && !draft && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                        href: "/posts/".concat(initialSlug),
                                        target: "_blank",
                                        rel: "noreferrer",
                                        className: "shrink-0 text-xs text-fg-muted underline hover:text-fg",
                                        children: "View ↗"
                                    }, void 0, false, {
                                        fileName: "[project]/components/write/PostForm.tsx",
                                        lineNumber: 389,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/write/PostForm.tsx",
                                lineNumber: 372,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex shrink-0 items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>setShowPreview((v)=>!v),
                                        className: "rounded-sm border border-border px-3 py-1.5 text-sm text-fg-muted hover:text-fg",
                                        children: showPreview ? "Edit" : "Preview"
                                    }, void 0, false, {
                                        fileName: "[project]/components/write/PostForm.tsx",
                                        lineNumber: 400,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>setShowSettings((v)=>!v),
                                        className: "rounded-sm border border-border px-3 py-1.5 text-sm text-fg-muted hover:text-fg",
                                        children: "Settings"
                                    }, void 0, false, {
                                        fileName: "[project]/components/write/PostForm.tsx",
                                        lineNumber: 407,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "submit",
                                        disabled: submitting,
                                        title: "⌘S",
                                        className: "rounded-sm bg-accent-warm px-4 py-1.5 text-sm font-bold text-white disabled:opacity-50",
                                        children: submitting ? "Saving…" : mode === "create" ? "Publish" : "Save"
                                    }, void 0, false, {
                                        fileName: "[project]/components/write/PostForm.tsx",
                                        lineNumber: 414,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/write/PostForm.tsx",
                                lineNumber: 399,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/write/PostForm.tsx",
                        lineNumber: 371,
                        columnNumber: 9
                    }, this),
                    editor && !showPreview && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "border-t border-border px-6 py-1.5",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mx-auto max-w-[680px]",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$write$2f$MarkdownEditor$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EditorToolbar"], {
                                editor: editor
                            }, void 0, false, {
                                fileName: "[project]/components/write/PostForm.tsx",
                                lineNumber: 428,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/write/PostForm.tsx",
                            lineNumber: 427,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/write/PostForm.tsx",
                        lineNumber: 426,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/write/PostForm.tsx",
                lineNumber: 370,
                columnNumber: 7
            }, this),
            recoverable && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mx-auto mt-4 flex max-w-[680px] items-center justify-between gap-4 rounded-sm border border-border bg-surface px-4 py-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-fg-muted",
                        children: "You have unsaved local changes for this post."
                    }, void 0, false, {
                        fileName: "[project]/components/write/PostForm.tsx",
                        lineNumber: 436,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex shrink-0 gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>{
                                    applyValues(recoverable);
                                    setRecoverable(null);
                                },
                                className: "rounded-sm bg-accent-warm px-3 py-1 text-sm font-bold text-white",
                                children: "Restore"
                            }, void 0, false, {
                                fileName: "[project]/components/write/PostForm.tsx",
                                lineNumber: 440,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>{
                                    try {
                                        localStorage.removeItem(draftKey);
                                    } catch (e) {
                                    /* noop */ }
                                    setRecoverable(null);
                                },
                                className: "rounded-sm border border-border px-3 py-1 text-sm text-fg-muted hover:text-fg",
                                children: "Discard"
                            }, void 0, false, {
                                fileName: "[project]/components/write/PostForm.tsx",
                                lineNumber: 450,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/write/PostForm.tsx",
                        lineNumber: 439,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/write/PostForm.tsx",
                lineNumber: 435,
                columnNumber: 9
            }, this),
            (error || savedSlug) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mx-auto max-w-[680px] px-6 pt-4",
                children: [
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-red-500",
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/components/write/PostForm.tsx",
                        lineNumber: 470,
                        columnNumber: 21
                    }, this),
                    savedSlug && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-fg-muted",
                        children: [
                            "Saved as ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-fg",
                                children: savedSlug
                            }, void 0, false, {
                                fileName: "[project]/components/write/PostForm.tsx",
                                lineNumber: 473,
                                columnNumber: 24
                            }, this),
                            ". It'll appear on the site once the new deploy finishes (~1–2 min).",
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/write",
                                onClick: confirmLeave,
                                className: "text-accent-warm underline",
                                children: "Back to list"
                            }, void 0, false, {
                                fileName: "[project]/components/write/PostForm.tsx",
                                lineNumber: 475,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/write/PostForm.tsx",
                        lineNumber: 472,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/write/PostForm.tsx",
                lineNumber: 469,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mx-auto max-w-[680px] px-6 py-12",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AutoTextarea, {
                        value: title,
                        onChange: handleTitleChange,
                        placeholder: "Title",
                        className: "block w-full border-0 bg-transparent p-0 font-serif text-4xl font-bold leading-tight text-fg outline-none placeholder:text-fg-subtle"
                    }, void 0, false, {
                        fileName: "[project]/components/write/PostForm.tsx",
                        lineNumber: 489,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AutoTextarea, {
                        value: summary,
                        onChange: setSummary,
                        placeholder: "Add a subtitle…",
                        className: "mt-4 block w-full border-0 bg-transparent p-0 font-serif text-xl leading-snug text-fg-muted outline-none placeholder:text-fg-subtle"
                    }, void 0, false, {
                        fileName: "[project]/components/write/PostForm.tsx",
                        lineNumber: 496,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-8 border-t border-border pt-8",
                        children: showPreview ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "prose max-w-none",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$PostBody$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PostBody"], {
                                content: content,
                                imageMeta: {}
                            }, void 0, false, {
                                fileName: "[project]/components/write/PostForm.tsx",
                                lineNumber: 506,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/write/PostForm.tsx",
                            lineNumber: 505,
                            columnNumber: 13
                        }, this) : editor && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$write$2f$MarkdownEditor$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EditorSurface"], {
                            editor: editor
                        }, void 0, false, {
                            fileName: "[project]/components/write/PostForm.tsx",
                            lineNumber: 509,
                            columnNumber: 23
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/write/PostForm.tsx",
                        lineNumber: 503,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/write/PostForm.tsx",
                lineNumber: 488,
                columnNumber: 7
            }, this),
            showSettings && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "fixed inset-0 z-30 bg-black/40",
                        onClick: ()=>setShowSettings(false)
                    }, void 0, false, {
                        fileName: "[project]/components/write/PostForm.tsx",
                        lineNumber: 517,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "fixed inset-y-0 right-0 z-40 w-80 overflow-y-auto border-l border-border bg-bg p-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-6 flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-sm font-bold text-fg",
                                        children: "Post settings"
                                    }, void 0, false, {
                                        fileName: "[project]/components/write/PostForm.tsx",
                                        lineNumber: 523,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>setShowSettings(false),
                                        className: "text-fg-muted hover:text-fg",
                                        children: "✕"
                                    }, void 0, false, {
                                        fileName: "[project]/components/write/PostForm.tsx",
                                        lineNumber: 524,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/write/PostForm.tsx",
                                lineNumber: 522,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "mb-1 block text-xs text-fg-muted",
                                                children: "Slug"
                                            }, void 0, false, {
                                                fileName: "[project]/components/write/PostForm.tsx",
                                                lineNumber: 535,
                                                columnNumber: 17
                                            }, this),
                                            mode === "create" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        value: slug,
                                                        onChange: (e)=>{
                                                            slugTouched.current = true;
                                                            setSlug(e.target.value);
                                                        },
                                                        placeholder: "url-slug",
                                                        className: inputClass
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/write/PostForm.tsx",
                                                        lineNumber: 538,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "mt-1 text-xs text-fg-subtle",
                                                        children: [
                                                            "/posts/",
                                                            slug || "…",
                                                            " · 소문자·숫자·하이픈만"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/write/PostForm.tsx",
                                                        lineNumber: 548,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        value: initialSlug !== null && initialSlug !== void 0 ? initialSlug : "",
                                                        disabled: true,
                                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(inputClass, "opacity-60")
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/write/PostForm.tsx",
                                                        lineNumber: 554,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "mt-1 text-xs text-fg-subtle",
                                                        children: "발행 후 고정 (링크 깨짐 방지)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/write/PostForm.tsx",
                                                        lineNumber: 560,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/write/PostForm.tsx",
                                        lineNumber: 534,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "mb-1 block text-xs text-fg-muted",
                                                children: "Date"
                                            }, void 0, false, {
                                                fileName: "[project]/components/write/PostForm.tsx",
                                                lineNumber: 568,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "date",
                                                value: date,
                                                onChange: (e)=>setDate(e.target.value),
                                                className: inputClass
                                            }, void 0, false, {
                                                fileName: "[project]/components/write/PostForm.tsx",
                                                lineNumber: 569,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/write/PostForm.tsx",
                                        lineNumber: 567,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "mb-1 block text-xs text-fg-muted",
                                                children: "Category"
                                            }, void 0, false, {
                                                fileName: "[project]/components/write/PostForm.tsx",
                                                lineNumber: 578,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                value: category,
                                                onChange: (e)=>setCategory(e.target.value),
                                                className: inputClass,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "",
                                                        children: "None"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/write/PostForm.tsx",
                                                        lineNumber: 586,
                                                        columnNumber: 19
                                                    }, this),
                                                    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$columns$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COLUMNS"].map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: c.value,
                                                            children: c.label
                                                        }, c.value, false, {
                                                            fileName: "[project]/components/write/PostForm.tsx",
                                                            lineNumber: 588,
                                                            columnNumber: 21
                                                        }, this))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/write/PostForm.tsx",
                                                lineNumber: 581,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/write/PostForm.tsx",
                                        lineNumber: 577,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "mb-1 block text-xs text-fg-muted",
                                                children: "Cover image"
                                            }, void 0, false, {
                                                fileName: "[project]/components/write/PostForm.tsx",
                                                lineNumber: 596,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "file",
                                                accept: "image/*",
                                                onChange: handleCoverChange,
                                                className: "block w-full text-xs text-fg-muted"
                                            }, void 0, false, {
                                                fileName: "[project]/components/write/PostForm.tsx",
                                                lineNumber: 599,
                                                columnNumber: 17
                                            }, this),
                                            uploading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "mt-1 text-xs text-fg-muted",
                                                children: "Uploading…"
                                            }, void 0, false, {
                                                fileName: "[project]/components/write/PostForm.tsx",
                                                lineNumber: 606,
                                                columnNumber: 19
                                            }, this),
                                            cover && !uploading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "mt-1 text-xs text-fg-subtle",
                                                children: coverFileName !== null && coverFileName !== void 0 ? coverFileName : cover
                                            }, void 0, false, {
                                                fileName: "[project]/components/write/PostForm.tsx",
                                                lineNumber: 609,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/write/PostForm.tsx",
                                        lineNumber: 595,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "mb-1 block text-xs text-fg-muted",
                                                children: "External URL"
                                            }, void 0, false, {
                                                fileName: "[project]/components/write/PostForm.tsx",
                                                lineNumber: 616,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                value: external,
                                                onChange: (e)=>setExternal(e.target.value),
                                                className: inputClass
                                            }, void 0, false, {
                                                fileName: "[project]/components/write/PostForm.tsx",
                                                lineNumber: 619,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/write/PostForm.tsx",
                                        lineNumber: 615,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "mb-1 block text-xs text-fg-muted",
                                                children: "Canonical URL"
                                            }, void 0, false, {
                                                fileName: "[project]/components/write/PostForm.tsx",
                                                lineNumber: 628,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                value: canonical,
                                                onChange: (e)=>setCanonical(e.target.value),
                                                placeholder: "https://…",
                                                className: inputClass
                                            }, void 0, false, {
                                                fileName: "[project]/components/write/PostForm.tsx",
                                                lineNumber: 631,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "mt-1 text-xs text-fg-subtle",
                                                children: "타 매체에서 옮겨온 글의 원문 주소 (본문은 그대로 보여주고 검색엔진에만 원문을 정본으로 알림)"
                                            }, void 0, false, {
                                                fileName: "[project]/components/write/PostForm.tsx",
                                                lineNumber: 638,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/write/PostForm.tsx",
                                        lineNumber: 627,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "mb-1 block text-xs text-fg-muted",
                                                children: "Source"
                                            }, void 0, false, {
                                                fileName: "[project]/components/write/PostForm.tsx",
                                                lineNumber: 645,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                value: source,
                                                onChange: (e)=>setSource(e.target.value),
                                                className: inputClass,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "",
                                                        children: "None"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/write/PostForm.tsx",
                                                        lineNumber: 655,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "disquiet",
                                                        children: "Disquiet"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/write/PostForm.tsx",
                                                        lineNumber: 656,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "substack",
                                                        children: "Substack"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/write/PostForm.tsx",
                                                        lineNumber: 657,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/write/PostForm.tsx",
                                                lineNumber: 648,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/write/PostForm.tsx",
                                        lineNumber: 644,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-6 pt-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "flex items-center gap-2 text-sm text-fg-muted",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "checkbox",
                                                        checked: featured,
                                                        onChange: (e)=>setFeatured(e.target.checked)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/write/PostForm.tsx",
                                                        lineNumber: 663,
                                                        columnNumber: 19
                                                    }, this),
                                                    "Featured"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/write/PostForm.tsx",
                                                lineNumber: 662,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "flex items-center gap-2 text-sm text-fg-muted",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "checkbox",
                                                        checked: draft,
                                                        onChange: (e)=>setDraft(e.target.checked)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/write/PostForm.tsx",
                                                        lineNumber: 671,
                                                        columnNumber: 19
                                                    }, this),
                                                    "Draft"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/write/PostForm.tsx",
                                                lineNumber: 670,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/write/PostForm.tsx",
                                        lineNumber: 661,
                                        columnNumber: 15
                                    }, this),
                                    mode === "edit" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-4 border-t border-border pt-4",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: handleDelete,
                                            disabled: deleting,
                                            className: "text-sm text-red-500 hover:underline disabled:opacity-50",
                                            children: deleting ? "Deleting…" : "Delete this post"
                                        }, void 0, false, {
                                            fileName: "[project]/components/write/PostForm.tsx",
                                            lineNumber: 683,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/write/PostForm.tsx",
                                        lineNumber: 682,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/write/PostForm.tsx",
                                lineNumber: 533,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/write/PostForm.tsx",
                        lineNumber: 521,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true)
        ]
    }, void 0, true, {
        fileName: "[project]/components/write/PostForm.tsx",
        lineNumber: 367,
        columnNumber: 5
    }, this);
}
_s1(PostForm, "pLtou4l7TVX9UsQ0NuexH99HIqE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$write$2f$MarkdownEditor$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePostEditor"]
    ];
});
_c1 = PostForm;
var _c, _c1;
__turbopack_context__.k.register(_c, "AutoTextarea");
__turbopack_context__.k.register(_c1, "PostForm");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=_4563d271._.js.map