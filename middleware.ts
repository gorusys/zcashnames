import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";

  // www → apex redirect
  if (host.startsWith("www.")) {
    const url = request.nextUrl.clone();
    url.host = host.replace(/^www\./, "");
    return NextResponse.redirect(url, 301);
  }

  // docs subdomain → /docs rewrite
  if (host.startsWith("docs.")) {
    const { pathname } = request.nextUrl;

    if (pathname.startsWith("/docs") || pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
      return NextResponse.next();
    }

    const url = request.nextUrl.clone();
    url.pathname = `/docs${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/og).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
