import type { APIRoute } from "astro";
import { createClient } from "@/lib/supabase";

// OAuth callback handler: Google redirects user → Supabase callback URL →
// Supabase redirects here with `?code=<auth-code>` (and optional `next` to
// override the post-login redirect target). We exchange the code for a
// session cookie via @supabase/ssr, then redirect to the requested page.
export const GET: APIRoute = async (context) => {
  const code = context.url.searchParams.get("code");
  const next = context.url.searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return context.redirect(`/auth/signin?error=${encodeURIComponent("Missing OAuth code")}`);
  }

  const supabase = createClient(context.request.headers, context.cookies);
  if (!supabase) {
    return context.redirect(`/auth/signin?error=${encodeURIComponent("Supabase is not configured")}`);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return context.redirect(`/auth/signin?error=${encodeURIComponent(error.message)}`);
  }

  return context.redirect(next);
};
