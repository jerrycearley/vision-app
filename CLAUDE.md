# Claude Code Instructions (Vision App)

Read these files first:
- `CLAUDE_CONTEXT.md`
- `PRODUCT_NORTH_STAR.md`

Operating mode:
- You are the primary implementer.
- Be proactive: propose the next 1-3 highest-leverage tasks aligned with PRODUCT_NORTH_STAR, then execute.
- Prefer small, reviewable commits.

Safety/permissions:
- In this repo, you may run git read-only commands freely (status, diff, log, show, branch, fetch, pull) without asking.
- You may modify code and commit changes.
- Do not push to remotes or publish externally without asking JC.
- Do not change secrets/keys; use env vars and `.env.example` patterns.

Documentation:
- Keep `CLAUDE_CONTEXT.md` updated with any new constraints/decisions and how to run the project.
- When you complete a task, summarize what changed and how to verify (commands + URLs).
