# ReliefLink — Render deployment

## What this package contains
- `render.yaml` — Render web-service configuration
- `Procfile` — production start command fallback
- `.python-version` — Python 3.11
- `/health` — Render health check
- FastAPI + static frontend served from one origin

## Deploy
1. Create a GitHub repository and upload the **contents of this folder** (not the outer ZIP).
2. On Render, choose **New → Blueprint** and select the GitHub repository.
3. Render will read `render.yaml`, install the requirements and start the FastAPI server.
4. Open the generated `https://...onrender.com` URL.

No localhost URL is hard-coded into the frontend; API calls use relative paths such as `/api/state`, so the same build works locally and on Render.

## Demo accounts
- Coordinator: `coordinator@relieflink.demo` / `demo123`
- Affected resident: `affected@relieflink.demo` / `demo123`
- NGO: `ngo@relieflink.demo` / `demo123`

## Important
This is a prototype. Demo users and in-memory data are intentionally included for presentations. A production system should use secure authentication, a persistent database, role-based authorization, HTTPS-only secrets, audit logs and verified emergency data sources.
