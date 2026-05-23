---
starter_id: 10x-astro-starter
package_manager: npm
project_name: mieszkanioholik
hints:
  language_family: js
  team_size: solo
  deployment_target: cloudflare-workers
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
---

## Why this stack

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
