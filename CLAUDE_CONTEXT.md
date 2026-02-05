# Claude Code Context (Vision App)

## North star
See `PRODUCT_NORTH_STAR.md`.

Summary: As AI/robots reduce traditional jobs, this app should help people find meaning/purpose and earn tokens for real achievements (skills, education, goals). The aim is to increase wisdom and self-understanding to help humanity live in harmony in an age of abundance.

## Current status (2026-02-04)
- Disk space issue resolved by uninstalling MATLAB R2020a (~30GB freed). Root FS now healthy.
- Docker pruning loop installed to prevent build cache from filling disk:
  - Script: `/home/jerry/.local/bin/docker-prune.sh` (keeps 15GB build cache)
  - Cron + log: `/home/jerry/.local/share/docker-prune.log`

## Dev environment (this repo)
Repo: `/home/jerry/Desktop/vision-app`

### Key fixes already applied (committed)
Commit: `fix(docker): build monorepo workspaces + reduce context + host-gateway DB`
- Monorepo uses npm workspaces; Docker builds must use repo root context.
- Added `.dockerignore` so Docker context is small (avoid sending host node_modules).
- API + Web Dockerfiles install `bash` (needed by repo postinstall `scripts/fix-react.sh`).
- Compose builds `api` and `web` from repo root.

### Networking quirk
This Docker daemon appears to block container-to-container traffic (like `icc=false`).
Workaround in `docker-compose.yml`:
- API uses `DATABASE_HOST=host.docker.internal` + `extra_hosts: host-gateway` to reach Postgres via host-published port 5432.

### What is currently running
- `docker compose up -d db redis api web`
- Web: http://localhost:3000
- API docs: http://localhost:4000/api/docs

## How to help
When asked to work:
1) Read this file first.
2) Propose next steps and execute them.
3) If you discover new constraints/decisions, update this file with a short note.

## Commands
- Build images: `docker compose build`
- Start stack: `docker compose up -d`
- Logs: `docker compose logs -f api` / `docker compose logs -f web`
- Status: `docker compose ps`
