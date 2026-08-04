import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  
  const isDashboardRoute = 
    nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/tracker") ||
    nextUrl.pathname.startsWith("/analytics") ||
    nextUrl.pathname.startsWith("/goals") ||
    nextUrl.pathname.startsWith("/challenges") ||
    nextUrl.pathname.startsWith("/achievements") ||
    nextUrl.pathname.startsWith("/community") ||
    nextUrl.pathname.startsWith("/ai-coach") ||
    nextUrl.pathname.startsWith("/profile") ||
    nextUrl.pathname.startsWith("/admin");
    
  const isAuthRoute = nextUrl.pathname === "/login" || nextUrl.pathname === "/register";

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL("/dashboard", nextUrl));
    }
    return;
  }

  if (isDashboardRoute && !isLoggedIn) {
    return Response.redirect(new URL("/login", nextUrl));
  }

  if (nextUrl.pathname.startsWith("/admin")) {
    const userRole = (req.auth?.user as any)?.role;
    if (userRole !== "ADMIN") {
      return Response.redirect(new URL("/dashboard", nextUrl));
    }
  }
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|images|favicon.ico).*)",
  ],
};
