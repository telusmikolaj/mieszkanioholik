import type { APIRoute } from "astro";
import { createClient } from "@/lib/supabase";

// OAuth start: user clicks "Continue with Google" → form POST here → we ask
// Supabase for the Google OAuth URL (with our `/api/auth/callback` as the
// post-auth target) → redirect the browser to Google. Per PRD FR-001 this
// is the only sign-in path; email/password is intentionally absent.
export const POST: APIRoute = async (context) => {
  const supabase = createClient(context.request.headers, context.cookies);
  if (!supabase) {
    return context.redirect(`/auth/signin?error=${encodeURIComponent("Supabase is not configured")}`);
  }

  const redirectTo = new URL("/api/auth/callback", context.url.origin).toString();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });

  if (error || !data.url) {
    return context.redirect(`/auth/signin?error=${encodeURIComponent(error?.message ?? "Failed to start OAuth")}`);
  }

  return context.redirect(data.url);
};
