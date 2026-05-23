---
project: mieszkanioholik
researched_at: 2026-05-21
recommended_platform: cloudflare-workers
runner_up: vercel
context_type: mvp
tech_stack:
  language: typescript
  framework: astro-6
  runtime: cloudflare-workers
  database: supabase-external
---

## Recommendation

**Deploy on Cloudflare Workers + Static Assets** (NOT Cloudflare Pages — Pages is deprecated for new projects since April 2025).

This is the only platform in the shortlist that scores Pass on all five agent-friendly criteria AND wins on cost (Workers free tier covers 100k req/day ≈ 3M req/mo), latency (dedicated Warsaw POP, ~10ms from Polish persona), and agent-friendliness (15+ official MCP servers with OAuth, `llms.txt` + Markdown for Agents GA). The starter (`10x-astro-starter`) already ships `@astrojs/cloudflare`, `wrangler.jsonc`, and Cloudflare bindings (IMAGES, SESSION KV) — zero adapter swap. The only correction vs the tech-stack.md hint is the deploy surface: emit `wrangler deploy` (Workers), not `wrangler pages deploy`.

## Platform Comparison

Hard filters applied: Q1 (no persistent connections required) drops none. All six candidates can run Astro 6 SSR with an appropriate adapter. Soft weights: Q2 (cost minimization, HEAVY) and Q4 (single PL/EU region) dominate the ranking.

| Platform                 | CLI-first       | Managed / Serverless               | Agent-readable docs                                   | Stable deploy API                       | MCP / Integration                                 | Cost @ low traffic                                    |
| ------------------------ | --------------- | ---------------------------------- | ----------------------------------------------------- | --------------------------------------- | ------------------------------------------------- | ----------------------------------------------------- |
| **Cloudflare (Workers)** | Pass            | Pass                               | Pass (`llms.txt` + Markdown for Agents GA)            | Pass (Wrangler v4)                      | Pass (15+ official MCP servers, Code Mode, OAuth) | **$0** (100k req/day free)                            |
| **Vercel**               | Pass            | Pass                               | Pass (`llms.txt` + content negotiation)               | Pass                                    | Partial (MCP beta, read-only)                     | $0 Hobby (commercial-use prohibited)                  |
| **Netlify**              | Pass            | Pass                               | Pass (`llms.txt` + Markdown via content neg)          | Pass (safe default — `--prod` required) | Pass (`@netlify/mcp` GA)                          | ~$19/mo Pro almost certain                            |
| **Fly.io**               | Pass            | Partial (container model)          | Partial (docs OSS on GitHub, no `llms.txt` confirmed) | Pass                                    | Partial (`fly mcp` experimental)                  | $0.20–$2/mo (no free tier since Oct 2024)             |
| **Railway**              | Pass            | Partial (container, managed scale) | Partial (no `llms.txt` confirmed)                     | Pass                                    | Partial (MCP WIP, destructive ops excluded)       | $5/mo Hobby floor                                     |
| **Render**               | Pass (CLI 2024) | Partial (container)                | Partial (no `llms.txt` confirmed)                     | Pass                                    | Pass (MCP GA, 20+ tools)                          | $7/mo Starter (free tier 30–50s cold starts unusable) |

### Shortlisted Platforms

#### 1. Cloudflare Workers + Static Assets (Recommended)

Wygrywa zdecydowanie na Q2 (cost): Workers free tier daje 100k requestów/dzień (~3M/mo) — wszystko inne w MVP scope mieści się grubo poniżej. Wygrywa też na Q4 (PL/EU): Cloudflare ma POP w Warszawie, więc latency ~10ms vs Frankfurt 25-35ms u konkurentów. Agent-friendliness jest najwyższy w branży: `llms.txt` + `llms-full.txt`, Markdown for Agents (GA luty 2026 z content negotiation), oraz 15+ oficjalnych remote MCP servers z OAuth (Workers Bindings, Workers Builds, Workers Observability, plus Code Mode dla 2,500 endpoints API). Adapter `@astrojs/cloudflare` jest GA i z Astro 6 działa lokalnie na real `workerd` przez `astro dev` — `wrangler pages dev` nie jest już potrzebny. **Krytyczne wyjaśnienie**: Pages jest deprecated dla nowych projektów od kwietnia 2025; deployujemy na Workers + Static Assets via `wrangler deploy`, NIE `wrangler pages deploy` (ten command istnieje jeszcze ale jest legacy path).

#### 2. Vercel

Solidny runner-up. Hobby tier mieści 1M function invocations + 100GB bandwidth + 4 CPU-hrs Active — 100k req/mo Astro SSR + Supabase to wciąż $0 jeśli strony nie są image-heavy. `llms.txt` GA. Fluid Compute eliminuje cold-start dla typowego SSR. **Główne wady**: (1) commercial-use prohibition na Hobby — gdy Mieszkanioholik kiedykolwiek zarobi nawet 1 zł, musisz przejść na Pro $20/seat/mo; (2) Vercel MCP jest beta i read-only; (3) musisz explicit ustawić `regions: ["fra1"]` bo default to `iad1` (Washington) → transatlantic latency dla PL users. Adapter swap (`@astrojs/cloudflare` → `@astrojs/vercel`) jest mechaniczny ale wymaga przepisania logiki bindings (IMAGES/SESSION → external alternatywy).

#### 3. Netlify

5/5 Pass na criteriach, ale traci na Q2: credit-based pricing od 2025 dał 300 kredytów/mo free z **hard pause** (nie overage billing). 100k req/mo prawie na pewno pcha do Pro $19-20/mo. Region selection (Frankfurt) tylko Pro+. MCP GA, `llms.txt` GA, Identity reprieved luty 2026 (przestało być deprecated). Trzecia opcja istnieje na wypadek gdyby Cloudflare i Vercel oba odpadły — rzadko racjonalna w naszej sytuacji.

## Anti-Bias Cross-Check: Cloudflare Workers

### Devil's Advocate — Weaknesses

1. **Pages-to-Workers migration mid-MVP.** Starter `10x-astro-starter` i `tech-stack.md` mówią "cloudflare-pages", ale Pages jest deprecated dla nowych projektów od kwietnia 2025. Naiwne podążanie za bootstrap-era tutorialami albo `wrangler pages deploy` deployuje na surface w feature-freeze.
2. **Astro 6 wciąż w beta (luty 2026 status).** Starter pinuje `astro@^6.3.1` — leading edge. Beta = możliwe breaking changes w `@astrojs/cloudflare` w trakcie 8-tygodniowego MVP timeline. Solo dev po godzinach nie ma bufora na upstream regressje.
3. **KV-as-session bottleneck.** Free tier KV = 1k writes/day. Każdy login + każdy SESSION-refresh = write. Naiwny pattern "refresh TTL na każdej authed page-load" przy 50 daily users × 30 listings = capout w tygodniach. Tikająca bomba przy "remember me forever".
4. **Edge runtime ≠ native Node libs.** `nodejs_compat` pokrywa `node:buffer`/`node:crypto`, ale każda przyszła zależność z native bindings (Sharp, Puppeteer, pdfkit) wyleci na buildzie. PRD FR-016 (PDF export, nice-to-have) — większość PDF libów po stronie serwera ma native deps. Implikacja: PDF musi być client-side (jsPDF) albo external service.
5. **Workers↔Supabase double-hop.** Jeśli projekt Supabase nie jest w eu-central-1 (Frankfurt) na AWS, każde DB query z Warsaw POP idzie Warsaw→Frankfurt→Supabase-region. Hyperdrive (Postgres pooler na Cloudflare) załatwia, ale dodaje warstwę konfiguracji.

### Pre-Mortem — How This Could Fail

Sześć miesięcy w Mieszkanioholiku na Cloudflare Workers wszystko padło bez efektu spektakularnego — cicha śmierć przez tysiące pęknięć. Pierwszy wyciek: SESSION KV. Wczesny MVP pattern odświeżał TTL na każdej authed page-load. Przy 50 daily users × 30 ofert dziennie wybili free cap (1k writes) w trzecim tygodniu. Solo dev nie zauważył aż przyszedł $0.50/day billing alert — tanio, ale smell. Gorzej: zespół wciąż używał `wrangler pages deploy` z bootstrap-era poradnika; nigdy nie zmigrował na Workers Static Assets gdy Pages zamroził feature set. W czwartym miesiącu `@astrojs/cloudflare` shipnął breaking change w middleware contract w minor releasie — upgrade i deploy zaczął 502'ować na auth-gated routes. Brak smoke testów w CI = zauważyli gdy znajomy próbował się zalogować. W piątym miesiącu rozważali Vercel, ale koszt wymiany adaptera, przepisania logiki Cloudflare-bindings i migracji SESSION storage przeważył nad bólem — zostali i łatali. MVP shipped, ale lekcja: edge-runtime constraints nie gryzą przy MVP velocity — gryzą przy MVP scale-up.

### Unknown Unknowns

- **`@supabase/ssr` cookie leak przez CDN cache.** Cookies ustawione w SSR response mogą być cache'owane jeśli response ma cache-friendly headers. Supabase docs ostrzegają explicit ("set `Cache-Control: private` on authed routes"). Łatwo przegapić w early scaffolding; objawia się jako silent bug gdy dwóch userów browsuje równolegle i widzą sesje siebie nawzajem.
- **Workers bundle 10MB compressed limit.** Astro + React 19 + Tailwind + Supabase SSR + Zod może podejść blisko limitu jeśli pociągniesz big deps. Liczy się PER-WORKER, więc dzielenie route'ów nie pomaga.
- **KV eventual consistency dla SESSION.** Reads do 60s po write mogą nie widzieć latest. User loguje się → redirect → SESSION KV read na post-login route może nie znaleźć właśnie zapisanej sesji. Symptom: "zalogowałem się ale pisze że nie jestem zalogowany" → retry → działa. Random, niereprodukowalne, agent naturalnie nie instrumentuje.
- **Brak git-based auto-deploy na Workers (vs Pages).** Pages miał automatic deploys z GitHuba. Workers wymaga GitHub Actions (mamy w CI per starter) lub `wrangler deploy` z lokalna. Stracony "click button to deploy" affordance — dla solo dev gdy CI failuje może oznaczać "git push and hope".
- **Preview deploy auth.** Jeśli chcesz preview deploys za hasłem (żeby znajomi mogli zobaczyć WIP bez exposure), Cloudflare Access to ścieżka — dodaje produkt + complexity. Vercel/Netlify dają password-protection na preview URLach out of the box.

## Operational Story

- **Preview deploys**: Cloudflare Workers ma versioned uploads (`npx wrangler versions upload`) → tworzy preview URL nie-produkcyjny. Lub w panelu Workers → Settings → włącz "Preview deployments" dla auto-preview z każdej PR (jeśli używasz GitHub Actions deployującego na branche). Preview URL jest unguessable ale public; jeśli chcesz auth — patrz "Preview deploy auth" w Unknown unknowns.
- **Secrets**: dwa miejsca. Lokalnie i dla deploya: `npx wrangler secret put SUPABASE_URL`, `npx wrangler secret put SUPABASE_KEY` (interactive prompt — wartość nie wchodzi do `.git` ani `wrangler.jsonc`). Dla GitHub Actions CI: GitHub repo secrets (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, plus `SUPABASE_URL`/`SUPABASE_KEY` jeśli build potrzebuje). Rotacja: `wrangler secret put` z nową wartością (overwrite), redeploy.
- **Rollback**: `npx wrangler versions list` żeby zobaczyć poprzednie wersje (nadawane numery przyrostowe), potem `npx wrangler versions deploy <version-id>` żeby przełączyć ruch instant na poprzednią. Time-to-revert: ~10s. **Caveat**: rollback nie cofa migracji bazy danych (Supabase) — jeśli deploy zawierał `supabase db push`, rollback Workera musi być sparowany z manualnym DB rollbackiem.
- **Approval**: human-only dla destructive akcji — usunięcie Worker (delete), rotacja primary API token, usunięcie KV namespace / D1 database, zmiana DNS przez `wrangler`. Agent może unattended robić: deploy nowej wersji, rollback do poprzedniej, czytanie logów, czytanie metryk, dodawanie nowych secrets (nie nadpisywanie istniejących bez confirmacji).
- **Logs**: real-time przez `npx wrangler tail` (streaming z runtime, filter po `--status error`, `--method`, `--search`). Persisted: Workers Logs panel (3 dni retention free, 200k events/day cap; konfigurowalne via `wrangler.jsonc` `observability.enabled = true` — już włączone w starterze). Agent czyta przez MCP: `mcp.cloudflare.com/workers-observability` (OAuth) — structured tools dla `logs_query`, `metrics_summary`, `errors_recent`.

## Risk Register

| Risk                                                                                    | Source           | Likelihood | Impact                       | Mitigation                                                                                                                                                                                              |
| --------------------------------------------------------------------------------------- | ---------------- | ---------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pages-deprecation confusion — używamy `wrangler pages deploy` zamiast `wrangler deploy` | Devil's advocate | H          | M                            | Explicit `wrangler deploy` w README + CLAUDE.md; zaktualizować `tech-stack.md` `deployment_target` z `cloudflare-pages` na `cloudflare-workers`; deploy script w `package.json` używa `wrangler deploy` |
| Astro 6 beta breaking changes w `@astrojs/cloudflare` mid-MVP                           | Devil's advocate | M          | H                            | Pin exact version w `package.json` (no caret); CI smoke test loguje testowego usera; followuj Astro release notes                                                                                       |
| KV write-cap exhaustion (1k/day) na SESSION storage                                     | Devil's advocate | L          | M                            | Nie refresh TTL na każdej page-load; rozważ short-lived JWT w HttpOnly cookie (bypass KV dla session-identity); Cloudflare billing alert at $1/day                                                      |
| Workers↔Supabase double-hop latency                                                     | Devil's advocate | M          | L                            | Umieść projekt Supabase w eu-central-1 (Frankfurt); rozważ Hyperdrive post-MVP jeśli p95 query latency > 50ms                                                                                           |
| Edge runtime breaks native-deps libs (PDF/image)                                        | Devil's advocate | H          | L (FR-016 jest nice-to-have) | PRD FR-016 (PDF export) implementuj client-side via jsPDF lub external service (np. CloudConvert); zadokumentuj jako constraint w CLAUDE.md                                                             |
| CDN cache leak Set-Cookie headers przez `@supabase/ssr`                                 | Unknown unknowns | M          | H                            | `Cache-Control: private, no-store` na wszystkich authed routes; CI test: smoke test sprawdza że auth-required response NIE ma `Cache-Control: public`                                                   |
| KV eventual consistency dla SESSION reads                                               | Unknown unknowns | L          | M                            | Read-your-own-write pattern via JWT w cookie (bypass KV dla session-identity); KV tylko na soft session state (preferences, etc.)                                                                       |
| Workers bundle 10MB compressed limit                                                    | Unknown unknowns | L          | M                            | Monitor bundle size w CI (`du -h dist/_worker.js`); lazy-load big deps; tree-shake aggressively                                                                                                         |
| Brak git-based auto-deploy na Workers                                                   | Unknown unknowns | L          | L                            | Starter już wired GitHub Actions z `wrangler-action`; verify on first deploy                                                                                                                            |
| Preview deploy auth — public URLs                                                       | Unknown unknowns | L          | L                            | MVP: preview URLs unguessable wystarczy; jeśli sensitive WIP — Cloudflare Access (post-MVP)                                                                                                             |

## Getting Started

Kroki założeniowe: scaffolded `10x-astro-starter` w cwd (już zrobione per `verification.md`), `.dev.vars` skonfigurowane (per `/dev-setup` skill), lokalnie `npm run dev` działa.

1. **Cloudflare account + scoped API token** (manual, browser): załóż konto na cloudflare.com (free), w My Profile → API Tokens stwórz token z permissions: `Workers Scripts:Edit`, `Workers KV Storage:Edit`, `User Details:Read`. Skopiuj token oraz Account ID z dashboardu.

2. **Lokalny Wrangler login**:

```
npx wrangler login
```

Otworzy się browser, autoryzujesz, token zapisuje się lokalnie.

3. **Ustaw Supabase secrets na Workers** (interactive, nie wchodzą do `.git`):

```
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_KEY
```

4. **First deploy na Workers** (NIE `wrangler pages deploy`):

```
npm run build
npx wrangler deploy
```

Zwróci URL `https://mieszkanioholik.<account>.workers.dev` — sanity check w przeglądarce, zaloguj się testowym kontem.

5. **Verify obserwability w czasie rzeczywistym**:

```
npx wrangler tail
```

W innym terminalu zrób kilka requestów do live URL — powinieneś widzieć structured logi z runtime.

6. **Configure GitHub Actions secrets** (Settings → Secrets and variables → Actions): dodaj `CLOUDFLARE_API_TOKEN` i `CLOUDFLARE_ACCOUNT_ID` plus istniejące `SUPABASE_URL`/`SUPABASE_KEY`. Następny `git push origin master` powinien wytrigerować CI deploy.

7. **Optional: install Cloudflare MCP server** (dla agent operability):

```
claude mcp add --transport http cloudflare https://mcp.cloudflare.com/workers-observability
```

OAuth flow w pierwszym query.

## Out of Scope

Następujące **NIE** były badane w tym researchu:

- Konfiguracja Docker image (nie potrzebna na Workers — zero container)
- Setup CI/CD pipeline (starter już ma `.github/workflows/ci.yml`; ten skill rekomenduje platformę, nie tuning pipeline)
- Production-scale architecture: multi-region failover, HA, disaster recovery — irrelevantne na MVP scope dla solo-app low-traffic
- Cloudflare Access dla preview deploy auth (post-MVP)
- Hyperdrive dla Supabase pooling (post-MVP, jeśli p95 latency wskazuje potrzebę)
- D1 / R2 / Queues migration ze Supabase (świadomie rozdzielone w `tech-stack.md`; Supabase pozostaje external)
