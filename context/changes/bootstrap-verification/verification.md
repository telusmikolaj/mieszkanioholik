---
bootstrapped_at: 2026-05-20T19:18:24Z
starter_id: 10x-astro-starter
starter_name: "10x Astro Starter (Astro + Supabase + Cloudflare)"
project_name: mieszkanioholik
language_family: js
package_manager: npm
cwd_strategy: git-clone
bootstrapper_confidence: first-class
phase_3_status: ok
audit_command: "npm audit --json"
---

## Hand-off

```yaml
starter_id: 10x-astro-starter
package_manager: npm
project_name: mieszkanioholik
hints:
  language_family: js
  team_size: solo
  deployment_target: cloudflare-pages
  ci_provider: github-actions
  ci_default_flow: auto-deploy-on-merge
  bootstrapper_confidence: first-class
  path_taken: standard
  quality_override: false
  self_check_answers: null
  has_auth: true
  has_payments: false
  has_realtime: false
  has_ai: true
  has_background_jobs: false
```

### Why this stack

Solo, after-hours, 8-week MVP for a desktop-primary web app with mainstream
consumer-identity OAuth (FR-001), AI extraction from pasted listing text
(FR-004), and strict per-user data isolation as a guardrail. 10x-astro-starter
is the recommended default for `(web, js)` and clears all four agent-friendly
gates; Supabase covers OAuth + Postgres + storage + Row-Level Security
(matching the isolation guardrail), Cloudflare Pages/Workers gives the edge
runtime, and TypeScript + Zod at boundaries supports the closed-set field
extraction in US-01. Bootstrapper confidence is first-class — expect
mostly-smooth scaffolding with occasional manual steps. CI on GitHub Actions
with auto-deploy on merge is the starter's standard shape; payments, realtime,
and background jobs are out of scope per PRD non-goals.

## Pre-scaffold verification

| Signal      | Value                                                                     | Severity | Notes                                                                       |
| ----------- | ------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------- |
| npm package | not run                                                                   | n/a      | `cmd_template` starts with `git clone`; no npm-distributed CLI to query     |
| GitHub repo | przeprogramowani/10x-astro-starter last pushed 2026-05-17T10:33:39Z       | fresh    | resolved from card `docs_url`; queried via anonymous GitHub API (gh unauth) |

## Scaffold log

**Resolved invocation**: `git clone https://github.com/przeprogramowani/10x-astro-starter .bootstrap-scaffold && cd .bootstrap-scaffold && npm install`
**Strategy**: git-clone
**Exit code**: 0
**Files moved**: 21 (`.env.example`, `.github/`, `.gitignore`, `.husky/`, `.nvmrc`, `.prettierrc.json`, `.vscode/`, `astro.config.mjs`, `CLAUDE.md.scaffold`, `components.json`, `eslint.config.js`, `node_modules/`, `package-lock.json`, `package.json`, `public/`, `README.md`, `src/`, `supabase/`, `tsconfig.json`, `wrangler.jsonc`)
**Conflicts (.scaffold siblings)**: `CLAUDE.md.scaffold` (cwd already carried a `CLAUDE.md` — preserved verbatim; scaffold copy sidelined as `CLAUDE.md.scaffold`)
**.gitignore handling**: moved silently (cwd had none)
**.bootstrap-scaffold cleanup**: deleted (`.git/` stripped before move-up so upstream history does not leak)
**`context/` preservation**: scaffold did not ship a `context/` directory; cwd `context/` (PRD, tech-stack, this verification log) untouched

Install summary: 773 packages added, 774 audited.

## Post-scaffold audit

**Tool**: `npm audit --json`
**Summary**: 0 CRITICAL, 1 HIGH, 10 MODERATE, 0 LOW
**Direct vs transitive**: 0/0/3/0 direct of total 0/1/10/0

#### CRITICAL findings

None.

#### HIGH findings

- **devalue** (range `5.6.3 - 5.8.0`) — *Svelte devalue: DoS via sparse array deserialization*. CVSS 7.5 / CWE-770. Transitive via `wrangler → miniflare`. Advisory: [GHSA-77vg-94rm-hx3p](https://github.com/advisories/GHSA-77vg-94rm-hx3p). Fix available (transitively addressed by upgrading `wrangler` to `3.107.3` — semver-major change).

#### MODERATE findings

- **@astrojs/check** (`>=0.9.3`, **direct**) — moderate via `@astrojs/language-server`. Fix: downgrade to `0.9.2` (semver-major).
- **@astrojs/cloudflare** (`>=12.2.4`, **direct**) — moderate via `@cloudflare/vite-plugin` and `wrangler`. Fix: upgrade to `12.6.13` (semver-major).
- **wrangler** (`<=0.0.0-kickoff-demo || >=3.108.0`, **direct**) — moderate via `miniflare`. Fix: downgrade to `3.107.3` (semver-major).
- **@astrojs/language-server** (`>=2.14.0`, transitive) — moderate via `volar-service-yaml`. Affects `@astrojs/check`.
- **@cloudflare/vite-plugin** (`>=0.0.7`, transitive) — moderate via `miniflare`, `wrangler`, `ws`. Affects `@astrojs/cloudflare`.
- **miniflare** (`>=3.20250204.0`, transitive) — moderate via `ws`. Affects `@cloudflare/vite-plugin`, `wrangler`.
- **volar-service-yaml** (`<=0.0.70`, transitive) — moderate via `yaml-language-server`. Affects `@astrojs/language-server`.
- **ws** (`8.0.0 - 8.20.0`, transitive) — *ws: Uninitialized memory disclosure*. CVSS 4.4 / CWE-908. Advisory: [GHSA-58qx-3vcg-4xpx](https://github.com/advisories/GHSA-58qx-3vcg-4xpx).
- **yaml** (`2.0.0 - 2.8.2`, transitive) — *yaml is vulnerable to Stack Overflow via deeply nested YAML collections*. CVSS 4.3 / CWE-674. Advisory: [GHSA-48c2-rrv3-qjmp](https://github.com/advisories/GHSA-48c2-rrv3-qjmp).
- **yaml-language-server** (range listed in npm output, transitive) — moderate via `yaml`. Affects `volar-service-yaml`.

#### LOW / INFO findings

None.

Dependency footprint: 449 prod / 316 dev / 131 optional / 895 total.

## Hints recorded but not acted on

| Hint                    | Value                  |
| ----------------------- | ---------------------- |
| bootstrapper_confidence | first-class            |
| quality_override        | false                  |
| path_taken              | standard               |
| self_check_answers      | null                   |
| team_size               | solo                   |
| deployment_target       | cloudflare-pages       |
| ci_provider             | github-actions         |
| ci_default_flow         | auto-deploy-on-merge   |
| has_auth                | true                   |
| has_payments            | false                  |
| has_realtime            | false                  |
| has_ai                  | true                   |
| has_background_jobs     | false                  |

## Next steps

Next: a future skill will set up agent context (CLAUDE.md, AGENTS.md). For now, your project is scaffolded and verified — happy hacking.

Useful manual steps in the meantime:
- `git init` (if you have not already) to start your own repo history.
- Review `CLAUDE.md.scaffold` — diff against your existing `CLAUDE.md` and decide whether to merge anything from the starter's version.
- Configure Supabase Row-Level Security early (the starter card flags this as a known-gotcha; your PRD's per-user isolation guardrail makes it non-negotiable).
- Address audit findings per your project's risk tolerance — `npm audit fix --force` clears all 11 but is semver-major; consider scoping the upgrades to `wrangler@3.107.3` (resolves 5 of the chains, including the single HIGH) and `@astrojs/check@0.9.2` separately.
- Copy `.env.example` to `.env` and populate the Supabase / Cloudflare credentials before running `npm run dev`.
