import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const STATIC_EXTENSIONS = /\.(png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot)$/i;

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  // Ignorer les fichiers statiques
  if (STATIC_EXTENSIONS.test(pathname)) {
    return NextResponse.next();
  }

  // Si le visiteur arrive sur link.agendalgbt.com → affiche /link
  if (hostname.startsWith("link.")) {
    const url = request.nextUrl.clone();
    if (url.pathname === "/") {
      url.pathname = "/link";
      return NextResponse.rewrite(url);
    }
  }

  // Si le visiteur arrive sur pro.agendalgbt.com → affiche /pro
  if (hostname.startsWith("pro.")) {
    const url = request.nextUrl.clone();
    if (!url.pathname.startsWith("/pro")) {
      url.pathname = "/pro" + url.pathname;
      return NextResponse.rewrite(url);
    }
  }
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|_sp).*)"],
};
