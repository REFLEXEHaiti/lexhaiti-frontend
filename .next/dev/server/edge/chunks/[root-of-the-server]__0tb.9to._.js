(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push(["chunks/[root-of-the-server]__0tb.9to._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/IDEA-Haiti/lexhaiti-frontend/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
// middleware.ts
// ═══════════════════════════════════════════════════════════════
// IDEA Haiti — Middleware Next.js
// Commun aux 3 plateformes
// Protège les routes privées et redirige vers /auth/connexion
// ═══════════════════════════════════════════════════════════════
var __TURBOPACK__imported__module__$5b$project$5d2f$IDEA$2d$Haiti$2f$lexhaiti$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/IDEA-Haiti/lexhaiti-frontend/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$IDEA$2d$Haiti$2f$lexhaiti$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/IDEA-Haiti/lexhaiti-frontend/node_modules/next/dist/esm/server/web/spec-extension/response.js [middleware-edge] (ecmascript)");
;
// Routes qui nécessitent une connexion
const ROUTES_PROTEGEES = [
    '/dashboard',
    '/admin',
    '/paiement',
    '/profil'
];
function middleware(request) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('access_token')?.value;
    const estProtegee = ROUTES_PROTEGEES.some((r)=>pathname.startsWith(r));
    if (estProtegee && !token) {
        const url = request.nextUrl.clone();
        url.pathname = '/auth/connexion';
        url.searchParams.set('redirect', pathname);
        return __TURBOPACK__imported__module__$5b$project$5d2f$IDEA$2d$Haiti$2f$lexhaiti$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(url);
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$IDEA$2d$Haiti$2f$lexhaiti$2d$frontend$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
}
const config = {
    matcher: [
        '/dashboard/:path*',
        '/admin/:path*',
        '/paiement/:path*',
        '/profil/:path*'
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__0tb.9to._.js.map