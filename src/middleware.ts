import { defineMiddleware } from "astro:middleware";
import { createClient } from "@/lib/supabase";

const PROTECTED_ROUTES = ["/dashboard"];

// Mitigates Cloudflare CDN cookie/session leak: any response that carries
// per-user state (auth pages, protected routes, or any route reached while
// authenticated) must NOT be cached by shared caches between users. See
// context/foundation/infrastructure.md risk register row #6.
const NO_CACHE_HEADER = "private, no-store";

function applyNoCache(response: Response): Response {
  response.headers.set("Cache-Control", NO_CACHE_HEADER);
  return response;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createClient(context.request.headers, context.cookies);

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    context.locals.user = user ?? null;
  } else {
    context.locals.user = null;
  }

  const isProtectedRoute = PROTECTED_ROUTES.some((route) => context.url.pathname.startsWith(route));
  const isAuthRoute = context.url.pathname.startsWith("/auth/");

  if (isProtectedRoute && !context.locals.user) {
    return applyNoCache(context.redirect("/auth/signin"));
  }

  const response = await next();

  if (isProtectedRoute || isAuthRoute || context.locals.user) {
    return applyNoCache(response);
  }

  return response;
});
