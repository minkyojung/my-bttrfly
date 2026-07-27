(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["chunks/[root-of-the-server]__56b386a6._.js", {

"[externals]/node:buffer [external] (node:buffer, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}}),
"[project]/lib/write-auth.ts [middleware-edge] (ecmascript)": ((__turbopack_context__) => {
"use strict";

/**
 * /write 게이팅용 세션 인증. Edge 미들웨어와 Node API 라우트 양쪽에서
 * 동일하게 동작해야 하므로 Web Crypto(`crypto.subtle`)만 사용한다
 * (Node 전용 `crypto` 모듈은 미들웨어 기본 Edge 런타임에서 못 씀).
 */ __turbopack_context__.s({
    "WRITE_SESSION_COOKIE": ()=>WRITE_SESSION_COOKIE,
    "WRITE_SESSION_MAX_AGE_SECONDS": ()=>WRITE_SESSION_MAX_AGE_SECONDS,
    "signSession": ()=>signSession,
    "verifyPassword": ()=>verifyPassword,
    "verifySession": ()=>verifySession
});
const WRITE_SESSION_COOKIE = "write_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7일
const WRITE_SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000;
function requireEnv(name) {
    const value = process.env[name];
    if (!value) throw new Error(`${name} is not set`);
    return value;
}
function b64urlEncode(bytes) {
    let binary = "";
    for (const byte of bytes)binary += String.fromCharCode(byte);
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlDecode(value) {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for(let i = 0; i < binary.length; i++)bytes[i] = binary.charCodeAt(i);
    return bytes;
}
function hmacKey(secret) {
    return crypto.subtle.importKey("raw", new TextEncoder().encode(secret), {
        name: "HMAC",
        hash: "SHA-256"
    }, false, [
        "sign",
        "verify"
    ]);
}
// 길이가 같은 두 바이트 배열을 상수 시간에 비교한다(타이밍 공격 방지).
function constantTimeEqual(a, b) {
    if (a.length !== b.length) return false;
    let diff = 0;
    for(let i = 0; i < a.length; i++)diff |= a[i] ^ b[i];
    return diff === 0;
}
async function signSession() {
    const exp = Date.now() + SESSION_TTL_MS;
    const payload = b64urlEncode(new TextEncoder().encode(JSON.stringify({
        exp
    })));
    const key = await hmacKey(requireEnv("WRITE_SESSION_SECRET"));
    const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
    return `${payload}.${b64urlEncode(new Uint8Array(signature))}`;
}
async function verifySession(cookieValue) {
    if (!cookieValue) return false;
    const [payload, signature] = cookieValue.split(".");
    if (!payload || !signature) return false;
    try {
        const key = await hmacKey(requireEnv("WRITE_SESSION_SECRET"));
        const valid = await crypto.subtle.verify("HMAC", key, b64urlDecode(signature), new TextEncoder().encode(payload));
        if (!valid) return false;
        const { exp } = JSON.parse(new TextDecoder().decode(b64urlDecode(payload)));
        return typeof exp === "number" && Date.now() < exp;
    } catch  {
        return false;
    }
}
async function verifyPassword(candidate) {
    const actual = requireEnv("WRITE_PASSWORD");
    const key = await hmacKey(requireEnv("WRITE_SESSION_SECRET"));
    const [a, b] = await Promise.all([
        crypto.subtle.sign("HMAC", key, new TextEncoder().encode(candidate)),
        crypto.subtle.sign("HMAC", key, new TextEncoder().encode(actual))
    ]);
    return constantTimeEqual(new Uint8Array(a), new Uint8Array(b));
}
}),
"[project]/middleware.ts [middleware-edge] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "config": ()=>config,
    "middleware": ()=>middleware
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/spec-extension/response.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$write$2d$auth$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/write-auth.ts [middleware-edge] (ecmascript)");
;
;
// 로그인 자체는 세션이 없어도 통과해야 하므로 명시적으로 허용.
const PUBLIC_PATHS = new Set([
    "/write/login",
    "/api/write/auth"
]);
async function middleware(request) {
    const { pathname } = request.nextUrl;
    if (PUBLIC_PATHS.has(pathname)) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    const session = request.cookies.get(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$write$2d$auth$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["WRITE_SESSION_COOKIE"])?.value;
    const authenticated = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$write$2d$auth$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["verifySession"])(session);
    if (authenticated) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    if (pathname.startsWith("/api/write")) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Unauthorized"
        }, {
            status: 401
        });
    }
    const loginUrl = new URL("/write/login", request.url);
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(loginUrl);
}
const config = {
    matcher: [
        "/write/:path*",
        "/api/write/:path*"
    ]
};
}),
}]);

//# sourceMappingURL=%5Broot-of-the-server%5D__56b386a6._.js.map