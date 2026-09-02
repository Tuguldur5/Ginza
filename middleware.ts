import { NextRequest, NextResponse } from "next/server";
const ADMIN_SESSION_COOKIE = "ginza_admin_session";

export function middleware(request: NextRequest) { const { pathname } = request.nextUrl; if (!pathname.startsWith("/admin") || pathname === "/admin/login") return NextResponse.next(); if (!request.cookies.has(ADMIN_SESSION_COOKIE)) return NextResponse.redirect(new URL("/admin/login", request.url)); return NextResponse.next(); }
export const config = { matcher: ["/admin/:path*"] };