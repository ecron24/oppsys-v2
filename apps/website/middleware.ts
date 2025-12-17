// apps/website/middleware.ts
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Récupérer la session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Routes protégées - rediriger vers app.oppsys.io si connecté
  const protectedRoutes = ["/dashboard"];
  if (protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))) {
    if (session) {
      const APP_URL = "https://app.oppsys.io";
      return NextResponse.redirect(`${APP_URL}/dashboard`);
    }
    // Si pas connecté, rediriger vers login
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Redirection du dashboard vers l'app
  if (req.nextUrl.pathname === "/dashboard") {
    const APP_URL = "https://app.oppsys.io";
    return NextResponse.redirect(`${APP_URL}/dashboard`);
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
