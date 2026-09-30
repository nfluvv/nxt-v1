import type { NextAuthConfig } from "next-auth";

const PUBLIC_ROUTES = [
  "/",           // ← ВОТ ЭТА СТРОКА. Без неё бесконечный редирект.
  "/login",
  "/register",
  "/forbidden",
  "/verify-email",
  "/forgot-password",
  "/users",
  "/reset-password",
  "/confirm-email-change",
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

  // 2. Админ-зона
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return Response.redirect(new URL(`/${locale}`, origin));
  }

  // 3. Неавторизованный на защищённом маршруте → главная
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