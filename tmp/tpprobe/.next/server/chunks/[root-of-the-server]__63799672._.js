module.exports = {

"[project]/.next-internal/server/app/api/write/auth/route/actions.js [app-rsc] (server actions loader, ecmascript)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
}}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}}),
"[project]/lib/write-auth.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
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
"[project]/app/api/write/auth/route.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "POST": ()=>POST
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$write$2d$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/write-auth.ts [app-route] (ecmascript)");
;
;
async function POST(request) {
    let body;
    try {
        body = await request.json();
    } catch  {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Invalid request body"
        }, {
            status: 400
        });
    }
    const password = body?.password;
    if (typeof password !== "string" || !password) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Password is required"
        }, {
            status: 400
        });
    }
    const valid = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$write$2d$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyPassword"])(password);
    if (!valid) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Incorrect password"
        }, {
            status: 401
        });
    }
    const token = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$write$2d$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["signSession"])();
    const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        ok: true
    });
    response.cookies.set(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$write$2d$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WRITE_SESSION_COOKIE"], token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$write$2d$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WRITE_SESSION_MAX_AGE_SECONDS"]
    });
    return response;
}
}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__63799672._.js.map