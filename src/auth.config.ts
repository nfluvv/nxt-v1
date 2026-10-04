import type { NextAuthConfig } from "next-auth";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/forbidden",
  "/about",
  "/pricing",
  "/u",
];

type CheckAuthorizationParams = {
  isLoggedIn: boolean;
  role?: "USER" | "ADMIN";
  pathname: string;
  locale: string;
  origin: string;
};

export function checkAuthorization({
  isLoggedIn,
  role,
  pathname,
  locale,
  origin,
}: CheckAuthorizationParams): true | Response {
  if (isLoggedIn && pathname === "/") {
    return Response.redirect(new URL(`/${locale}/dashboard`, origin));
  }

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return Response.redirect(new URL(`/${locale}`, origin));
  }

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL(`/${locale}`, origin));
  }

  return true;
}

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    authorized: () => true,
  },
} satisfies NextAuthConfig;