# Pierwsze wdrożenie Mieszkanioholika na Cloudflare Workers

## Context

Cel: dostarczyć działający `https://mieszkanioholik.<account>.workers.dev` z podpiętym cloud Supabase (Frankfurt eu-central-1), realizujący decyzje z @context/foundation/infrastructure.md (Cloudflare Workers + Static Assets, NIE Pages) i @context/foundation/tech-stack.md (10x-astro-starter, Astro 6 + React 19 + Supabase external).

Stan wejściowy (per Explore survey):

- `wrangler.jsonc` nazwa workera = `10x-astro-starter` (starter-default, do personalizacji).
- `package.json` nie ma `deploy` skryptu; `wrangler@^4.90.0` w devDeps; brak `npm run deploy`.
- `astro.config.mjs` correct: `output: "server"`, `@astrojs/cloudflare()` adapter, env schema dla `SUPABASE_URL`/`SUPABASE_KEY` jako `context: "server"`, `access: "secret"`, `optional: true`.
- `wrangler.jsonc` correct shape: Workers (NOT Pages) — `main`, `assets`, `compatibility_flags: ["nodejs_compat"]`, `observability` enabled, `compatibility_date: 2026-05-08`. Bez KV/vars/services/routes.
- `.github/workflows/ci.yml` robi tylko `npx astro sync` + `npm run lint` + `npm run build` — **NIE deployuje**. Pierwszy deploy będzie manual.
- `src/lib/supabase.ts` używa `createServerClient(...)` untyped → 20 pre-existing `@typescript-eslint/no-unsafe-*` errors w 3 plikach. Lokalne `npm run build` ich nie blokuje, ale CI `npm run lint` jest czerwone na każdym pushu.
- `src/db/database.types.ts` nie istnieje. `.dev.vars` nie istnieje.

User confirmed (Plan Mode interview):

1. Cloudflare account istnieje, **brak lokalnego loginu** → start od `wrangler login`.
2. **Brak cloud Supabase project** → manualny gate: stwórz w Frankfurt.
3. **Wygeneruj Database types od razu** → naprawia 20 lint errorów properly, CI też zielone.
4. Scope: **manual `wrangler deploy` → live URL**. CI auto-deploy + custom domain = follow-up.

Out of scope tej sesji: CI deploy step, custom domain, OAuth providers (Google/Apple per PRD FR-001), `Cache-Control: private` na authed routes, `tech-stack.md` `deployment_target` update z `cloudflare-pages` → `cloudflare-workers`.

## Critical files modified

- `/Users/telusmikolaj/KURSY/10xdevs/mieszkanioholik/wrangler.jsonc` — zmiana pola `name`
- `/Users/telusmikolaj/KURSY/10xdevs/mieszkanioholik/package.json` — dodanie skryptu `deploy`
- `/Users/telusmikolaj/KURSY/10xdevs/mieszkanioholik/src/db/database.types.ts` — generated (new file)
- `/Users/telusmikolaj/KURSY/10xdevs/mieszkanioholik/src/lib/supabase.ts` — typed `createServerClient<Database>`

Pliki NIE modyfikowane: `astro.config.mjs` (env schema już correct), `.github/workflows/ci.yml` (CI deploy out of scope, lint zazieleni się po types), `CLAUDE.md` (Database-types sekcja w DO NOT pozostaje jako active reference), `.dev.vars` (lokalne — niezwiązane z production deploy).

Existing utilities/patterns reused: `createServerClient` z `@supabase/ssr` (już używany), cookie handling pattern z `parseCookieHeader` w `src/lib/supabase.ts` (nie zmienia się), `astro:env/server` import (correct, zostaje), middleware pattern w `src/middleware.ts` (nie wymaga zmiany — sama `createClient` jest już prawidłowo wywoływana).

## Steps

### Phase A: Local prep (no platform changes, no secrets, no deploy)

1. **Edit `wrangler.jsonc`**: change `"name": "10x-astro-starter"` → `"name": "mieszkanioholik"`. To jedyna zmiana w tym pliku.

2. **Edit `package.json` `scripts`**: dodać `"deploy": "astro build && wrangler deploy"` jako audited path. `npm run deploy` staje się jednym entry pointem (build + deploy w jednym).

### Phase B: Manual user gates (out-of-band akcje użytkownika)

3. **Cloudflare local login** — interactive browser auth:

   ```
   npx wrangler login
   ```

   Token zapisuje się w `~/.config/.wrangler/`. Verify: `npx wrangler whoami` → zwraca email.

4. **Stwórz cloud Supabase project** (~2 min provisioning):
   - https://supabase.com/dashboard → "New project"
   - Name: `mieszkanioholik`
   - **Region: Frankfurt (eu-central-1)** — krytyczne dla Workers↔Supabase double-hop latency (risk register row #4 w infrastructure.md)
   - Zapisz admin password
   - Skopiuj z Settings → API: **Project URL** (postaci `https://<ref>.supabase.co`) + **anon public key**
   - Settings → API → **Project Reference ID** (postaci `<ref>` w URL dashboardu) — potrzebne do `supabase link`
   - Authentication → Providers → Email → toggle **"Confirm email" OFF** dla MVP (OAuth providers Google/Apple per PRD są follow-up)

### Phase C: Link Supabase & generate types (fix lint blocker)

5. **Link cwd do cloud Supabase project** — browser-based auth na pierwszym linku:

   ```
   npx supabase link --project-ref <ref-z-kroku-4>
   ```

   Verify: `npx supabase projects list` pokazuje project z `linked: true`.

6. **Wygeneruj Database types**:

   ```
   mkdir -p src/db
   npx supabase gen types typescript --linked > src/db/database.types.ts
   ```

   Plik będzie minimal (głównie schema `auth.users`, bez własnych tabel — nie ma jeszcze migracji), ale wystarczy do parametryzacji client.

7. **Wire `Database` type w `src/lib/supabase.ts`**:
   - Dodać import: `import type { Database } from "@/db/database.types";`
   - Zmienić: `createServerClient(SUPABASE_URL, SUPABASE_KEY, { ... })` → `createServerClient<Database>(SUPABASE_URL, SUPABASE_KEY, { ... })`
   - To naprawia wszystkie 20 errorów `@typescript-eslint/no-unsafe-*` w `src/lib/supabase.ts`, `src/middleware.ts`, `src/pages/auth/confirm-email.astro` w jednym ruchu (wszystkie pochodzą z generic Supabase return type).

8. **Verify clean lint + type check**:
   ```
   npm run lint          # expect 0 errors
   npx astro check       # expect 0 errors (4 hints w eslint.config.js są pre-existing OK)
   ```

### Phase D: Configure production secrets + first deploy

9. **Set Supabase secrets na Workers** (interactive prompts, wartości nie wpadają do `.git`):

   ```
   npx wrangler secret put SUPABASE_URL
   # wklej cloud URL z kroku 4 (postaci https://<ref>.supabase.co)
   npx wrangler secret put SUPABASE_KEY
   # wklej anon public key z kroku 4
   ```

   Verify: `npx wrangler secret list` pokazuje oba (bez wartości — Cloudflare nie wystawia ich back).

10. **First production deploy**:

    ```
    npm run deploy
    ```

    (Equivalent do `astro build && npx wrangler deploy`.) Wrangler:
    - kompiluje Astro do `dist/_worker.js/index.js`
    - uploaduje static assets z `dist/` na CDN
    - publikuje Worker
    - zwraca URL `https://mieszkanioholik.<account>.workers.dev`

    Pierwszy deploy ~30-60s.

11. **Smoke-test live URL** — w jednym terminalu:
    ```
    npx wrangler tail     # streaming runtime logs
    ```
    W przeglądarce: otwórz live URL, kliknij sign-up, podaj test email + password, signin, dashboard. Tail powinien pokazywać structured request logi.

## Verification (end-to-end)

| Po fazie | Sprawdzenie                                                       | Expected                                                                         |
| -------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| A.1      | `grep '"name"' wrangler.jsonc`                                    | `"mieszkanioholik"`                                                              |
| A.2      | `node -e 'console.log(require("./package.json").scripts.deploy)'` | `astro build && wrangler deploy`                                                 |
| B.3      | `npx wrangler whoami`                                             | email konta Cloudflare                                                           |
| B.4      | dashboard Supabase                                                | projekt status: "Healthy", region "Central EU (Frankfurt)"                       |
| C.5      | `npx supabase projects list`                                      | mieszkanioholik z `linked: true`                                                 |
| C.6      | `wc -l src/db/database.types.ts`                                  | > 10 linii (header + Database namespace + auth schema)                           |
| C.7      | `grep 'createServerClient<Database>' src/lib/supabase.ts`         | linia match                                                                      |
| C.8      | `npm run lint` exit                                               | 0                                                                                |
| C.8      | `npx astro check` exit                                            | 0 errors                                                                         |
| D.9      | `npx wrangler secret list`                                        | `SUPABASE_URL`, `SUPABASE_KEY` obecne                                            |
| D.10     | `npm run deploy` exit                                             | 0; output zawiera live URL                                                       |
| D.11     | browser smoke + `wrangler tail`                                   | landing 200, signup 200, signin 200 → /dashboard 200; tail pokazuje request logi |

End-to-end: użytkownik testowy może w deployed URL zarejestrować się, zalogować, dotrzeć do /dashboard. Brak 502, brak unauthenticated leakage.

## Risks during execution (i mitigacje na żywo)

- **Wrangler login wymaga lokalnej przeglądarki**. Mitigation: w razie problemu — utworzyć scoped API token w Cloudflare panel (permissions: `Workers Scripts:Edit`, `Workers KV Storage:Edit`, `User Details:Read`), eksport `export CLOUDFLARE_API_TOKEN=<token>` przed `wrangler deploy`.
- **Supabase project provisioning może być wolne (~2 min)**. Czekać na status "Healthy" w dashboardzie zanim ruszać krok C.5.
- **`supabase gen types --linked` może zwrócić empty types** jeśli `auth` schema nie jest exposed. Fallback: `npx supabase gen types typescript --linked --schema public,auth > src/db/database.types.ts`.
- **`wrangler deploy` może zwrócić "Subdomain not configured"** jeśli account nie ma jeszcze `workers.dev` subdomain. Dashboard → Workers & Pages → tab "Subdomain" — wybierz nazwę raz, retry.
- **Cookie leak risk** (z infrastructure.md row #6): nie testujemy w tej sesji, ale notatka — w smoke test loguj się z prywatnego okna i sprawdź czy w dev tools widać `Cache-Control: private` na `/dashboard` response. Pełna mitigacja to follow-up.

## Follow-ups (świadomie poza zakresem tej sesji)

- Update `context/foundation/tech-stack.md`: `deployment_target: cloudflare-pages` → `cloudflare-workers` (spójność z infrastructure.md).
- Wire CI auto-deploy: dodać `cloudflare/wrangler-action@v3` step do `.github/workflows/ci.yml`, plus `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` repo secrets.
- OAuth providers config: Google + Apple w Supabase dashboard per PRD FR-001 ("mainstream consumer identity, not developer-centric") — wymaga osobnych OAuth client credentials.
- Custom domain — wymaga DNS configuration.
- `Cache-Control: private, no-store` na authed routes (Cloudflare CDN cookie-leak mitigation z infrastructure.md row #6).
- Cloudflare billing alert at $1/day (KV write-cap detection — risk register row #3).
- Cloudflare MCP server: `claude mcp add --transport http cloudflare https://mcp.cloudflare.com/workers-observability` (per infrastructure.md Operational Story).
- Persist approved plan to `context/deployment/deploy-plan.md` (per lesson 5 chain handoff: "approved plan persists at deploy-plan.md").
