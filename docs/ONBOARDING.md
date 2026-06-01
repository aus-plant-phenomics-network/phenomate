# Phenomate — Onboarding Guide

## Project Overview
- Name: phenomate (pyproject.toml)
- Languages: Python (backend), TypeScript/React (frontend), Shell/Makefile, Docker, YAML, JSON
- Frameworks: Django, Django-Ninja, Celery, RabbitMQ, React + Vite, TanStack, Tailwind
- Short description: A Django-backed frontend app (React/Vite) for plant phenomics; uses phenomate-core and appm for data processing and project management. See README.md for setup and developer notes.

## Architecture Layers
- Backend (service)
  - Path: backend/
  - Key files: backend/settings.py, manage.py, backend/asgi.py, backend/api.py
  - Role: Django app, API (Django-Ninja), Celery tasks, database migrations
- Frontend (client)
  - Path: src/
  - Key files: src/main.tsx, src/routes/**, src/lib/api/v1.d.ts, src/components/**
  - Role: React UI (Vite), routing, DTOs generated from backend OpenAPI
- Infrastructure & Devops
  - Files: docker-compose.yaml, docker/*/Dockerfile, Makefile
  - Role: local dev vs dockerized deployment, volumes, logging
- Config & Docs
  - Files: pyproject.toml, package.json, README.md, .env*, tsconfig.json
  - Role: dependency manifests, developer instructions, environment settings

## Key Concepts & Design Decisions
- DTO sync: Frontend types are generated from backend OpenAPI (src/lib/api/v1.d.ts). Keep sync-backend script in package.json up-to-date.
- Celery + RabbitMQ: Background tasks (backend/tasks.py). Local dev uses SQLite; production uses Postgres volume (phenomate_pgdata).
- VFS & large tables: Chonky-powered virtual file system (src/components/VFS.tsx) — handles large file lists; be cautious with performance.
- monorepo-style local dev: pyproject.toml uses local path dependencies (phenomate-core, appm).

## Guided Tour (step-by-step)
1. Project purpose & README — read README.md (overview, dev vs docker instructions).
2. Local dev startup
   - Install dev deps: make install-dev
   - Start backend: make run-server (or uv run manage.py runserver)
   - Start frontend: make run-ui
   - Start Celery: make run-celery
3. Backend entry points
   - manage.py (project runner)
   - backend/settings.py (environment config)
   - backend/api.py / backend/urls.py (API routing)
4. Frontend entry points
   - src/main.tsx (app bootstrap)
   - src/routes/* (page logic)
   - src/lib/api/v1.d.ts (generated API types)
5. Tasks & background processing
   - backend/tasks.py, backend/celery.py — Celery worker config
6. CI / infra & docker
   - docker-compose.yaml, docker/*/Dockerfile, Makefile (dev helpers, volumes)
7. Type sync workflow
   - npm run sync-backend to regenerate src/lib/api/v1.d.ts from backend OpenAPI

## File Map (key files)
- README.md — project overview, docker vs local instructions
- pyproject.toml — Python project metadata, dependencies, tool config
- package.json — frontend scripts (dev/build/sync-backend)
- backend/settings.py — Django settings (env-driven); high complexity
- manage.py — Django CLI entry
- backend/api.py — API wiring (Django-Ninja)
- backend/celery.py — Celery app config
- src/main.tsx — React entry
- src/lib/api/v1.d.ts — generated API types (large)
- src/components/Table.tsx — large table UI (performance-sensitive)
- src/components/VFS.tsx — virtual file system (complex UI)
- docker-compose.yaml — orchestrates services for dockerized run
- Makefile — common developer commands

## Complexity Hotspots (approach carefully)
- src/lib/api/v1.d.ts — ~840 lines; authoritative DTO file. Regenerate via openapi sync when backend changes.
- src/components/Table.tsx (605 lines) — large UI table; extensibility & perf caution.
- src/VFS.tsx (403 lines) — file system UI; concurrency and large datasets.
- src/routes/project.create.tsx (522 lines) and project.offload (329 lines) — complex page flows.
- backend/settings.py (260 lines) — environment & secrets handling; changes affect app config across environments.

## First Tasks for a New Contributor (recommended)
1. Run the app locally (follow README): make install-dev → make run-server → make run-ui
2. Reproduce the backend OpenAPI and regenerate frontend types: start backend → npm run sync-backend
3. Explore how an API request flows: trace from src/lib/api to backend/api.py → models and serializers in backend/*.
4. Add a small UI change to a component (e.g., Header.tsx), run frontend dev, open localhost:3000.
5. Read backend/tests/migrations and try a small migration locally using manage.py migrate.

---

Saved using the project scan and README (best-effort). Consider committing the file to the repo: `git add docs/ONBOARDING.md && git commit -m "Add onboarding guide"` if you want it tracked by Git.
