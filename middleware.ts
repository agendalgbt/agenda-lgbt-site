import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";

  // Si le visiteur arrive sur link.agendalgbt.com → affiche /link
  if (hostname.startsWith("link.")) {
    const url = request.nextUrl.clone();
    if (url.pathname === "/") {
      url.pathname = "/link";
      return NextResponse.rewrite(url);
    }
  }
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
