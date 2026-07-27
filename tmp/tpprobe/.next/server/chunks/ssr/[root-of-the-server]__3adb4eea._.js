module.exports = {

"[next]/internal/font/google/noto_serif_kr_8e09a07c.module.css [app-rsc] (css module)": ((__turbopack_context__) => {

__turbopack_context__.v({
  "className": "noto_serif_kr_8e09a07c-module__yN3OAG__className",
  "variable": "noto_serif_kr_8e09a07c-module__yN3OAG__variable",
});
}),
"[next]/internal/font/google/noto_serif_kr_8e09a07c.js [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>__TURBOPACK__default__export__
});
var __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$noto_serif_kr_8e09a07c$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__ = __turbopack_context__.i("[next]/internal/font/google/noto_serif_kr_8e09a07c.module.css [app-rsc] (css module)");
;
const fontData = {
    className: __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$noto_serif_kr_8e09a07c$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].className,
    style: {
        fontFamily: "'Noto Serif KR', 'Noto Serif KR Fallback'",
        fontStyle: "normal"
    }
};
if (__TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$noto_serif_kr_8e09a07c$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].variable != null) {
    fontData.variable = __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$noto_serif_kr_8e09a07c$2e$module$2e$css__$5b$app$2d$rsc$5d$__$28$css__module$29$__["default"].variable;
}
const __TURBOPACK__default__export__ = fontData;
}),
"[project]/lib/about-content.ts [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "aboutContent": ()=>aboutContent
});
const aboutContent = {
    intro: [
        "I work between operations and engineering. After leading operations at Disquiet — Korea's largest startup community, growing from 15,000 to 100,000 members in twelve months — I've been building independent projects during my alternative civilian service."
    ],
    background: [
        {
            period: "2024–2026",
            role: "Alternative civilian service · independent building"
        },
        {
            period: "2023–2024",
            role: "Operations · Disquiet (15K → 100K members)"
        },
        {
            period: "2021–2023",
            role: "BBA · Mondragon University"
        }
    ],
    selectedWork: [
        {
            name: "flowcap",
            url: "https://github.com/minkyojung/flowcap",
            description: "Open-source macOS menu-bar app that records workflows and turns them into AI-generated documentation."
        },
        {
            name: "Momo memory engine",
            url: "https://usemomo.com",
            description: "Early prototype of an AI memory system."
        }
    ],
    stack: [
        "TypeScript",
        "Swift",
        "Python",
        "React",
        "Next.js",
        "SwiftUI",
        "Cloudflare Workers",
        "Postgres / pgvector",
        "Claude / OpenAI / Gemini"
    ],
    exploring: [
        "Local AI",
        "AI orchestration",
        "AI clones"
    ]
};
}),
"[project]/lib/site-config.ts [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "blogPostingSchema": ()=>blogPostingSchema,
    "personSchema": ()=>personSchema,
    "postUrl": ()=>postUrl,
    "siteConfig": ()=>siteConfig
});
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$about$2d$content$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/about-content.ts [app-rsc] (ecmascript)");
;
const siteConfig = {
    url: "https://www.minkyojung.com",
    name: "William Jung",
    alternateName: "Minkyo Jung",
    role: "Operator × Engineer",
    headline: "Operator × Engineer · Previously Operations at Disquiet (15K → 100K)",
    description: "Operator × engineer. Previously led operations at Disquiet, growing the community from 15,000 to 100,000 members. Now building independent products and writing about products & AI.",
    locale: "ko_KR",
    email: "williamjung0130@gmail.com",
    social: {
        twitter: {
            handle: "@imwilliamjung",
            url: "https://x.com/imwilliamjung"
        },
        github: {
            handle: "minkyojung",
            url: "https://github.com/minkyojung"
        },
        substack: "https://williamjung0130.substack.com",
        disquiet: "https://disquiet.io/@williamjung"
    }
};
const postUrl = (slug)=>`${siteConfig.url}/posts/${slug}`;
function blogPostingSchema(input) {
    const url = input.canonicalUrl ?? postUrl(input.slug);
    return {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: input.title,
        datePublished: input.date,
        dateModified: input.date,
        description: input.description,
        url,
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": url
        },
        image: input.image ? `${siteConfig.url}${input.image}` : undefined,
        author: {
            "@type": "Person",
            name: siteConfig.name,
            url: siteConfig.url
        }
    };
}
function personSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "Person",
        name: siteConfig.name,
        alternateName: siteConfig.alternateName,
        url: siteConfig.url,
        description: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$about$2d$content$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["aboutContent"].intro.join(" "),
        email: `mailto:${siteConfig.email}`,
        knowsAbout: [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$about$2d$content$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["aboutContent"].stack,
            ...__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$about$2d$content$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["aboutContent"].exploring
        ],
        sameAs: [
            siteConfig.social.twitter.url,
            siteConfig.social.github.url,
            siteConfig.social.substack,
            siteConfig.social.disquiet
        ]
    };
}
}),
"[project]/app/layout.tsx [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>RootLayout,
    "metadata": ()=>metadata
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$noto_serif_kr_8e09a07c$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[next]/internal/font/google/noto_serif_kr_8e09a07c.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$site$2d$config$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/site-config.ts [app-rsc] (ecmascript)");
;
;
;
;
const metadata = {
    metadataBase: new URL(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$site$2d$config$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["siteConfig"].url),
    title: {
        default: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$site$2d$config$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["siteConfig"].alternateName,
        template: `%s — ${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$site$2d$config$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["siteConfig"].alternateName}`
    },
    description: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$site$2d$config$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["siteConfig"].description,
    authors: [
        {
            name: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$site$2d$config$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["siteConfig"].name,
            url: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$site$2d$config$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["siteConfig"].url
        }
    ],
    creator: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$site$2d$config$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["siteConfig"].name,
    openGraph: {
        type: "website",
        locale: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$site$2d$config$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["siteConfig"].locale,
        url: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$site$2d$config$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["siteConfig"].url,
        siteName: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$site$2d$config$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["siteConfig"].name,
        title: `${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$site$2d$config$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["siteConfig"].name} — ${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$site$2d$config$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["siteConfig"].role}`,
        description: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$site$2d$config$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["siteConfig"].description
    },
    // title/description은 명시하지 않는다 — 명시하면 하위 페이지(글)의
    // 트위터 카드 제목까지 사이트 제목으로 고정돼버린다 (메타데이터는 키 단위 상속).
    twitter: {
        card: "summary_large_image",
        creator: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$site$2d$config$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["siteConfig"].social.twitter.handle
    },
    alternates: {
        canonical: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$site$2d$config$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["siteConfig"].url
    }
};
function RootLayout({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("html", {
        lang: "ko",
        className: __TURBOPACK__imported__module__$5b$next$5d2f$internal$2f$font$2f$google$2f$noto_serif_kr_8e09a07c$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].variable,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("body", {
            className: "antialiased",
            children: children
        }, void 0, false, {
            fileName: "[project]/app/layout.tsx",
            lineNumber: 49,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/layout.tsx",
        lineNumber: 48,
        columnNumber: 5
    }, this);
}
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { m: module, e: exports } = __turbopack_context__;
{
module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-rsc] (ecmascript)").vendored['react-rsc'].ReactJsxDevRuntime; //# sourceMappingURL=react-jsx-dev-runtime.js.map
}}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__3adb4eea._.js.map