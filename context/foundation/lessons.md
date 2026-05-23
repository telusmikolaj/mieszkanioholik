# Lessons Learned

> Append-only register of recurring rules and patterns. Re-read at start by /10x-frame, /10x-research, /10x-plan, /10x-plan-review, /10x-implement, /10x-impl-review.

## Never quote 10x-cli sentinel marker strings in rules-for-AI files

- **Context**: Authoring or editing rules-for-AI markdown files (`CLAUDE.md`, `AGENTS.md`, `.cursor/rules/*.mdc`, `.github/copilot-instructions.md`, nested per-area variants) in any project managed by `@przeprogramowani/10x-cli`.
- **Problem**: Literal quotation of `<!-- BEGIN @przeprogramowani/10x-cli -->` or `<!-- END -->` in plain-text body — even inside a backticked code span — causes the next `10x get mNlN` to interpret the first match as the start of the managed block and overwrite everything between it and the next END marker. Incident 2026-05-21 on this project: a Critical DO NOT rule that cited both marker strings to warn agents away from them was itself the bait — `10x get m1l5` silently deleted bullets 2–5 of DO NOT plus 9 downstream sections (Database types, Conventions, Project, Stack, Daily commands, First-run setup, CI, Repo state, 10x-cli context architecture). Recovery required full reconstruction from prior chat context.
- **Rule**: Never quote the literal sentinel strings (`<!-- BEGIN @przeprogramowani/10x-cli -->`, `<!-- END -->`) anywhere in a rules-for-AI file outside the single bona-fide marker pair the CLI manages. When referring to them in prose, use plain-text descriptions ("the BEGIN/END HTML comment markers below") or pointers ("search this file for `@przeprogramowani`"). Before saving any rules-for-AI file in a 10x-cli-managed project, grep the body for stray markers and confirm exactly two matches survive (one BEGIN, one END).
- **Applies to**: frame, plan, implement, impl-review
