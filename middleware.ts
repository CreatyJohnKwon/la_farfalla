// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isAdminRoute = pathname.startsWith("/admin");

    if (!isAdminRoute) return NextResponse.next();

    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    const adminEmails = [
        "admin@admin.com",
        "soun0551@naver.com",
        "cofsl0411@naver.com",
        "vmfodzl1125@naver.com",
    ];

    if (!token || !adminEmails.includes(token.email ?? "")) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
