import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { type UserRole, ROUTE_PERMISSIONS } from "@/lib/types";

/**
 * Check if user has permission to access a route
 */
function hasRoutePermission(
  userRole: UserRole | null,
  pathname: string
): boolean {
  if (!userRole) return false;

  for (const [route, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(route)) {
      return allowedRoles.includes(userRole);
    }
  }

  // Default: allow access if not explicitly restricted
  return true;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Initialize Supabase client with SSR cookies
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Public routes (no auth required)
  const publicRoutes = [
    "/",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/privacy",
    "/terms",
    "/401",
    "/403",
    "/500",
    "/503",
  ] as const;

  const isPublicRoute = publicRoutes.some((prefix) =>
    prefix === "/" ? pathname === "/" : pathname.startsWith(prefix)
  );

  // Redirect authenticated users away from auth pages
  if (
    user &&
    ["/", "/login", "/signup", "/forgot-password"].includes(pathname)
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  // Redirect unauthenticated users from root or protected pages
  if (!user && !isPublicRoute && !pathname.startsWith("/auth")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (!user && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Authenticated users: check route permissions
  if (user && !isPublicRoute) {
    // const userRole = get public.profile.role
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profileData) {
      console.error(
        `Error fetching profile for user ${user.id}:`,
        profileError
      );
      const url = request.nextUrl.clone();
      url.pathname = "/500";
      return NextResponse.redirect(url);
    }

    const userRole = profileData.role as UserRole | null;

    if (!hasRoutePermission(userRole, pathname)) {
      console.warn(
        `Access denied for user ${user.id} with role ${userRole} to ${pathname}`
      );
      const url = request.nextUrl.clone();
      url.pathname = "/403";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
