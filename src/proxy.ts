import { NextResponse, type NextRequest } from "next/server";
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/kk/documents") {
    return NextResponse.redirect(new URL("/ru/documents", request.url));
  }
  const headers = new Headers(request.headers);
  headers.set(
    "x-mama-locale",
    request.nextUrl.pathname.startsWith("/kk") ? "kk" : "ru",
  );
  return NextResponse.next({ request: { headers } });
}
export const config = { matcher: ["/ru/:path*", "/kk/:path*"] };
